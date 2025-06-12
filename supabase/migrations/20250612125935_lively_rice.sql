/*
  # Create deals table

  1. New Tables
    - `deals`
      - `id` (uuid, primary key)
      - `title` (text, deal title)
      - `description` (text, deal description)
      - `value` (numeric, deal value)
      - `stage` (text, current stage)
      - `probability` (integer, win probability)
      - `expected_close_date` (date, expected close date)
      - `client_id` (uuid, references clients)
      - `company_id` (uuid, references companies)
      - `responsible_id` (uuid, references users)
      - `pipeline_id` (uuid, references pipelines)
      - `custom_fields` (jsonb, custom fields)
      - `tenant_id` (uuid, references tenants)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `deals` table
    - Add policy for users to access deals in their tenant
*/

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  value numeric(15,2) DEFAULT 0,
  stage text NOT NULL,
  probability integer DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date date,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  responsible_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  custom_fields jsonb DEFAULT '{}',
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access deals in their tenant"
  ON deals
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS deals_tenant_id_idx ON deals(tenant_id);
CREATE INDEX IF NOT EXISTS deals_stage_idx ON deals(stage);
CREATE INDEX IF NOT EXISTS deals_responsible_id_idx ON deals(responsible_id);
CREATE INDEX IF NOT EXISTS deals_pipeline_id_idx ON deals(pipeline_id);
CREATE INDEX IF NOT EXISTS deals_client_id_idx ON deals(client_id);
CREATE INDEX IF NOT EXISTS deals_company_id_idx ON deals(company_id);