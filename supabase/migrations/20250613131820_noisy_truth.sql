/*
  # Fix events table and user policies

  1. Changes
    - Drop problematic recursive policy on users table
    - Add company_id column to events table if it doesn't exist
    - Create index for company_id column

  2. Security
    - Remove recursive policy that was causing issues
    - Keep existing non-recursive policies for users
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage users in their tenant" ON users;

-- Add company_id column to events table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE events ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS events_company_id_idx ON events(company_id);
  END IF;
END $$;

-- The existing policies for users reading/updating their own data are fine and don't cause recursion:
-- "Users can read their own data" - uses auth.uid() = id (no table query)
-- "Users can update their own data" - uses auth.uid() = id (no table query)