-- Extend submissions table with species-ready payload + metadata
alter table public.submissions
  add column if not exists contributor_name text,
  add column if not exists contributor_email text,
  add column if not exists payload jsonb default '{}'::jsonb,
  add column if not exists moderator_notes text,
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

update public.submissions
set payload = coalesce(payload, '{}'::jsonb);

alter table public.submissions
  alter column payload set default '{}'::jsonb,
  alter column payload set not null;

create index if not exists submissions_payload_gin on public.submissions using gin (payload);

create or replace function public.handle_submissions_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_submissions_updated_at on public.submissions;
create trigger trigger_submissions_updated_at
before update on public.submissions
for each row execute procedure public.handle_submissions_updated_at();
