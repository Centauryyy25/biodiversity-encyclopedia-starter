import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resendFrom = Deno.env.get("RESEND_FROM") ?? "Encyclopedia <onboarding@resend.dev>";

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
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { email, species, name } = body ?? {};
  const recipient = typeof email === "string" ? email.trim() : "";
  const speciesName = typeof species === "string" ? species.trim() : "";
  const senderName =
    typeof name === "string" && name.trim().length ? name.trim() : "Kontributor";

  if (!recipient || !speciesName) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: email & species" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // HTML template
  let htmlTemplate = `
    <div class="wrapper" style="background:#f5f5f5;padding:24px;font-family:Arial,Helvetica,sans-serif;">
      <div class="card" style="background:white;padding:20px;border-radius:12px;max-width:600px;margin:0 auto;">
        <h2 class="title" style="color:#9DC183;margin-bottom:12px;">
          Halo {{username}}! 👋
        </h2>

        <p>Terima kasih atas kontribusimu di <b>Encyclopedia Biodiversity</b>.</p>

        <p>Data spesies <b>{{species}}</b> berhasil diterima dan sedang dalam proses review oleh moderator.</p>

        <div style="margin:20px 0;padding:16px;border-left:4px solid #9DC183;background:#f0f7ff;border-radius:8px;">
          <b>Detail Pengiriman:</b><br />
          Spesies: {{species}}<br />
          Pengirim: {{username}} ({{email}})
        </div>

        <p>Salam hangat,<br /><b>Tim Encyclopedia</b></p>
      </div>
    </div>
  `;

  // Render variables
  const htmlFinal = htmlTemplate
    .replace(/{{username}}/g, senderName)
    .replace(/{{species}}/g, speciesName)
    .replace(/{{email}}/g, recipient);

  const resend = new Resend(resendApiKey);

  try {
    const response = await resend.emails.send({
      from: resendFrom,
      to: [recipient],
      subject: `Konfirmasi Pengiriman: ${speciesName}`,
      html: htmlFinal,
    });

    if (response.error) {
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: response.error }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ message: "Email sent", data: response.data }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
