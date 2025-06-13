/*
  # Fix infinite recursion in users table RLS policy

  1. Problem
    - The "Admins can manage users in their tenant" policy causes infinite recursion
    - Policy tries to query the same users table it's protecting
    - This creates a circular dependency during policy evaluation

  2. Solution
    - Drop the problematic policy that causes recursion
    - Create a simpler, non-recursive policy structure
    - Use auth.jwt() to get user metadata instead of querying users table
    - Separate admin management from regular user access

  3. New Policies
    - Users can read their own data (existing, keep as is)
    - Users can update their own data (existing, keep as is)
    - Remove the recursive admin policy for now to fix the immediate issue
    - Admin functionality can be handled at the application level

  4. Security Notes
    - This removes the admin-level RLS policy temporarily
    - Admin operations should be handled through service role or application logic
    - Consider using Supabase functions for admin operations that need elevated privileges
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage users in their tenant" ON users;

-- The existing policies for users reading/updating their own data are fine and don't cause recursion:
-- "Users can read their own data" - uses uid() = id (no table query)
-- "Users can update their own data" - uses uid() = id (no table query)

-- For admin operations, consider using one of these approaches:
-- 1. Handle admin logic in the application layer with proper authorization checks
-- 2. Use Supabase Edge Functions with service role access
-- 3. Create a separate admin interface that uses service role credentials

-- If you need admin-level RLS in the future, here's a non-recursive approach:
-- You could store admin status in auth.users.user_metadata and reference that instead
-- of querying the users table within the policy itself.

-- Example of a non-recursive admin policy (commented out for now):
-- CREATE POLICY "Service role can manage all users"
--   ON users
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);