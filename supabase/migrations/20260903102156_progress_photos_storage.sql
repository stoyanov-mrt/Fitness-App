-- Private bucket for progress photos, one folder per user
-- (`${auth.uid()}/...`) enforced by policy rather than by convention.

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false);

create policy "users can view their own progress photos"
  on storage.objects for select
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can upload their own progress photos"
  on storage.objects for insert
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can update their own progress photos"
  on storage.objects for update
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can delete their own progress photos"
  on storage.objects for delete
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
