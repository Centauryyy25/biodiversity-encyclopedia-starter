-- Track publish lifecycle for submissions
alter table public.submissions
  add column if not exists published boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists published_species_id uuid references public.species(id);

create index if not exists submissions_published_idx on public.submissions (published);
