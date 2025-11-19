-- Ensure published species reference releases when species row is deleted
alter table public.submissions
  drop constraint if exists submissions_published_species_id_fkey;

alter table public.submissions
  add constraint submissions_published_species_id_fkey
  foreign key (published_species_id)
  references public.species(id)
  on delete set null;
