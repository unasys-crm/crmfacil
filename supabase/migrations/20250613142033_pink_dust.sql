/*
  # Create Demo Tenant

  1. New Records
    - Insert demo tenant record with ID `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
    - Ensures the tenant exists for user creation

  2. Safety
    - Uses INSERT ... ON CONFLICT DO NOTHING to prevent duplicate errors
    - Safe to run multiple times
*/

-- Insert demo tenant if it doesn't exist
INSERT INTO tenants (
  id,
  name,
  domain,
  settings,
  created_at,
  updated_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Empresa Demo',
  'demo.crmfacil.com',
  '{"theme": "default", "features": ["calendar", "deals", "clients", "companies"]}'::jsonb,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;