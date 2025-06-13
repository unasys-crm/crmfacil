/*
  # Fix Events Table RLS Policy

  1. Security Updates
    - Drop existing policy that may have issues with INSERT operations
    - Create separate policies for SELECT, INSERT, UPDATE, and DELETE operations
    - Ensure proper tenant isolation for all operations
    - Allow users to manage events where they are responsible and within their tenant

  2. Policy Details
    - SELECT: Users can read events in their tenant
    - INSERT: Users can create events for themselves in their tenant
    - UPDATE: Users can update events they are responsible for in their tenant
    - DELETE: Users can delete events they are responsible for in their tenant
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users can access events in their tenant" ON events;

-- Create separate policies for better control

-- Policy for SELECT operations
CREATE POLICY "Users can read events in their tenant"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT users.tenant_id
      FROM users
      WHERE users.id = auth.uid()
    )
  );

-- Policy for INSERT operations
CREATE POLICY "Users can create events in their tenant"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    responsible_id = auth.uid() AND
    tenant_id IN (
      SELECT users.tenant_id
      FROM users
      WHERE users.id = auth.uid()
    )
  );

-- Policy for UPDATE operations
CREATE POLICY "Users can update their events in their tenant"
  ON events
  FOR UPDATE
  TO authenticated
  USING (
    responsible_id = auth.uid() AND
    tenant_id IN (
      SELECT users.tenant_id
      FROM users
      WHERE users.id = auth.uid()
    )
  )
  WITH CHECK (
    responsible_id = auth.uid() AND
    tenant_id IN (
      SELECT users.tenant_id
      FROM users
      WHERE users.id = auth.uid()
    )
  );

-- Policy for DELETE operations
CREATE POLICY "Users can delete their events in their tenant"
  ON events
  FOR DELETE
  TO authenticated
  USING (
    responsible_id = auth.uid() AND
    tenant_id IN (
      SELECT users.tenant_id
      FROM users
      WHERE users.id = auth.uid()
    )
  );