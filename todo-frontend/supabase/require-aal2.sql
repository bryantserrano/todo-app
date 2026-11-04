-- Run once in the Supabase SQL Editor after enabling the TOTP flow.
-- The restrictive policy applies the AAL2 requirement alongside the existing
-- permissive owner policy, including if another permissive policy is added.
create policy "Require MFA for tasks"
on public.tasks
as restrictive
for all
to authenticated
using (
  (select auth.jwt() ->> 'aal') = 'aal2'
)
with check (
  (select auth.jwt() ->> 'aal') = 'aal2'
);
