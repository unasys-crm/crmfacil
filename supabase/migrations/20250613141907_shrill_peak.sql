/*
  # Fix Users RLS Policy for Insert Operations

  1. Security Changes
    - Add policy to allow authenticated users to insert their own records
    - Ensure users can only create records with their own auth.uid()
    - Maintain existing read/update policies

  This fixes the "new row violates row-level security policy" error when creating user records.
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Create policy to allow authenticated users to insert their own records
CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the existing policies are correct
DROP POLICY IF EXISTS "Users can read their own data" ON users;
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);