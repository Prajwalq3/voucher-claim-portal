-- Delete existing auth users so user can re-register fresh
DELETE FROM auth.users WHERE email IN ('prajwal0485@gmail.com', 'aprajwal414@gmail.com');
