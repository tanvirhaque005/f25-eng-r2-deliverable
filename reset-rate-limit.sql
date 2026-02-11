-- Run this in Supabase SQL Editor to reset rate limits
-- Note: This may not work depending on your Supabase version and plan

-- Option 1: Clear rate limit cache (if stored in a table)
-- DELETE FROM auth.rate_limits WHERE email = 'your-email@example.com';

-- Option 2: Check if rate limits are stored in auth.config
-- SELECT * FROM auth.config WHERE key LIKE '%rate%limit%';

-- Option 3: For development, you can try to disable rate limiting via config
-- UPDATE auth.config SET value = '999999' WHERE key = 'email_rate_limit_per_hour';

-- Note: The exact table/column names depend on your Supabase version
-- If these don't work, use the Dashboard method instead
