/*
  # Fix Users Table RLS Policy

  1. Security Updates
    - Add policy to allow authenticated users to insert their own user records
    - This fixes the "new row violates row-level security policy" error
    - Users can only insert records where the id matches their auth.uid()

  2. Changes
    - Add INSERT policy for users table
    - Allow users to create their own profile records
*/

-- Allow authenticated users to insert their own user record
CREATE POLICY "Allow authenticated users to insert their own user record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);