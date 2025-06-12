/*
  # Create clients table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text, client name)
      - `cpf` (text, tax ID)
      - `email` (text, contact email)
      - `phone` (text, contact phone)
      - `address` (text, full address)
      - `cep` (text, postal code)
      - `city` (text, city)
      - `state` (text, state)
      - `company_id` (uuid, references companies)
      - `responsible_ids` (uuid array, responsible users)
      - `observations` (text, notes)
      - `tags` (text array, client tags)
      - `custom_fields` (jsonb, custom fields)
      - `tenant_id` (uuid, references tenants)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `clients` table
    - Add policy for users to access clients in their tenant
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cpf text,
  email text,
  phone text,
  address text,
  cep text,
  city text,
  state text,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  responsible_ids uuid[] DEFAULT '{}',
  observations text,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access clients in their tenant"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS clients_tenant_id_idx ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS clients_name_idx ON clients(name);
CREATE INDEX IF NOT EXISTS clients_company_id_idx ON clients(company_id);
CREATE INDEX IF NOT EXISTS clients_cpf_idx ON clients(cpf);