/*
  # Create pipelines table

  1. New Tables
    - `pipelines`
      - `id` (uuid, primary key)
      - `name` (text, pipeline name)
      - `stages` (jsonb, pipeline stages with id, name, color, order)
      - `is_default` (boolean, default pipeline)
      - `tenant_id` (uuid, references tenants)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `pipelines` table
    - Add policy for users to access pipelines in their tenant

  3. Default Data
    - Create default sales pipeline
*/

CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stages jsonb NOT NULL DEFAULT '[]',
  is_default boolean DEFAULT false,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access pipelines in their tenant"
  ON pipelines
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON pipelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS pipelines_tenant_id_idx ON pipelines(tenant_id);
CREATE INDEX IF NOT EXISTS pipelines_is_default_idx ON pipelines(is_default);

-- Insert default pipeline for demo tenant
DO $$
DECLARE
  demo_tenant_id uuid;
BEGIN
  SELECT id INTO demo_tenant_id FROM tenants WHERE domain = 'demo.crmfacil.com';
  
  IF demo_tenant_id IS NOT NULL THEN
    INSERT INTO pipelines (name, stages, is_default, tenant_id)
    VALUES (
      'Pipeline de Vendas',
      '[
        {"id": "1", "name": "Prospecção", "color": "#ef4444", "order": 1},
        {"id": "2", "name": "Qualificação", "color": "#f97316", "order": 2},
        {"id": "3", "name": "Proposta", "color": "#eab308", "order": 3},
        {"id": "4", "name": "Negociação", "color": "#22c55e", "order": 4},
        {"id": "5", "name": "Fechamento", "color": "#3b82f6", "order": 5}
      ]'::jsonb,
      true,
      demo_tenant_id
    );
  END IF;
END $$;