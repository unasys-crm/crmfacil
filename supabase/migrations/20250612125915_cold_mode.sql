/*
  # Create companies table

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, company name)
      - `razao_social` (text, legal name)
      - `cnpj` (text, tax ID)
      - `segment` (text, business segment)
      - `origin` (text, lead origin)
      - `store_count` (integer, number of stores)
      - `address` (text, full address)
      - `cep` (text, postal code)
      - `city` (text, city)
      - `state` (text, state)
      - `email` (text, contact email)
      - `phone` (text, contact phone)
      - `tags` (text array, company tags)
      - `custom_fields` (jsonb, custom fields)
      - `tenant_id` (uuid, references tenants)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `companies` table
    - Add policy for users to access companies in their tenant
*/

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  razao_social text,
  cnpj text,
  segment text,
  origin text,
  store_count integer DEFAULT 1,
  address text,
  cep text,
  city text,
  state text,
  email text,
  phone text,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access companies in their tenant"
  ON companies
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS companies_tenant_id_idx ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS companies_name_idx ON companies(name);
CREATE INDEX IF NOT EXISTS companies_cnpj_idx ON companies(cnpj);