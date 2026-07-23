-- Run this in Supabase Dashboard > SQL Editor after creating the account in the app.
-- Replace YOUR_USERNAME with the username used during registration.
update public.users
set role = 'admin'
where username = 'YOUR_USERNAME';

-- Confirm the account has administrator access.
select id, full_name, username, role
from public.users
where username = 'YOUR_USERNAME';
