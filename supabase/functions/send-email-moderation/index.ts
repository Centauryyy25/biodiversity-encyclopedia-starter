import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";

type ModerationStatus = "approved" | "rejected";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resendFrom = Deno.env.get("RESEND_FROM") ?? "Encyclopedia <no-reply@resend.dev>";
const resend = new Resend(resendApiKey);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c] ?? c));

const buildTemplate = (status: ModerationStatus, params: { name: string; species: string; reason?: string }) => {
  const { name, species, reason } = params;

  const baseStyles = `
    <style>
      :root { color-scheme: light dark; }
      .wrapper { background:#f5f5f5; padding:24px; font-family:Arial,Helvetica,sans-serif; }
      .card { background:#ffffff; color:#0f172a; padding:20px; border-radius:12px; max-width:640px; margin:0 auto; border:1px solid #e2e8f0; }
      .title { color:${status === "approved" ? "#16a34a" : "#b91c1c"}; font-size:20px; font-weight:700; margin-bottom:12px; }
      .muted { color:#475569; }
      @media (prefers-color-scheme: dark) {
        .wrapper { background:#0d1117 !important; }
        .card { background:#161b22 !important; border:1px solid #30363d !important; color:#e6edf3 !important; }
        .muted { color:#9ca3af; }
      }
    </style>
  `;

  const intro =
    status === "approved"
      ? `<p>Halo ${name || "Kontributor"},</p><p>Pengajuan spesies <strong>${species}</strong> telah disetujui dan sekarang dipublikasikan. 🎉</p>`
      : `<p>Halo ${name || "Kontributor"},</p><p>Sayangnya pengajuan <strong>${species}</strong> belum dapat kami setujui.</p>${reason ? `<p class="muted">Alasan: ${reason}</p>` : ""}`;

  const subject = status === "approved" ? `Spesies Disetujui: ${species}` : `Spesies Ditolak: ${species}`;

  const html = `
    ${baseStyles}
    <div class="wrapper">
      <div class="card">
        <div class="title">${status === "approved" ? "Pengajuan Disetujui" : "Pengajuan Ditolak"}</div>
        ${intro}
        <p class="muted" style="margin-top:12px;">Jika ada pertanyaan, balas email ini untuk klarifikasi.</p>
        <p style="margin-top:16px;">Terima kasih,<br /><strong>Tim Moderator Encyclopedia</strong></p>
      </div>
    </div>
  `;

  return { subject, html };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY environment variable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch (_err) {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const emailRaw = typeof payload.email === "string" ? payload.email.trim() : "";
  const speciesRaw = typeof payload.species === "string" ? payload.species.trim() : "";
  const nameRaw = typeof payload.name === "string" ? payload.name.trim() : "";
  const statusRaw = typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "";
  const reasonRaw = typeof payload.reason === "string" ? payload.reason.trim() : "";

  if (!emailRaw || !speciesRaw || !statusRaw) {
    return new Response(JSON.stringify({ error: "Missing required fields: email, species, status" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const status = statusRaw === "approved" ? "approved" : statusRaw === "rejected" ? "rejected" : null;
  if (!status) {
    return new Response(JSON.stringify({ error: "Status must be approved or rejected" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const safeName = escapeHtml(nameRaw);
  const safeSpecies = escapeHtml(speciesRaw);
  const safeReason = escapeHtml(reasonRaw);

  const { subject, html } = buildTemplate(status, { name: safeName, species: safeSpecies, reason: safeReason });

  try {
    const response = await resend.emails.send({
      from: resendFrom,
      to: [emailRaw],
      subject,
      html,
    });

    if (response.error) {
      console.error("Resend error:", response.error);
      return new Response(JSON.stringify({ error: "Failed to send email", details: response.error }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Email sent", data: response.data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error sending moderation email:", err);
    return new Response(JSON.stringify({ error: "Unexpected error sending email", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
