@@ .. @@
 -- Drop the problematic policy that causes infinite recursion
 DROP POLICY IF EXISTS "Admins can manage users in their tenant" ON users;
 
+-- Add company_id column to events table if it doesn't exist
+DO $$
+BEGIN
+  IF NOT EXISTS (
+    SELECT 1 FROM information_schema.columns
+    WHERE table_name = 'events' AND column_name = 'company_id'
+  ) THEN
+    ALTER TABLE events ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;
+    CREATE INDEX IF NOT EXISTS events_company_id_idx ON events(company_id);
+  END IF;
+END $$;
+
 -- The existing policies for users reading/updating their own data are fine and don't cause recursion:
 -- "Users can read their own data" - uses uid() = id (no table query)
 -- "Users can update their own data" - uses uid() = id (no table query)