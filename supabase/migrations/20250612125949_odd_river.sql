/*
  # Insert sample data

  1. Sample Data
    - Demo companies
    - Demo clients
    - Demo deals
    - Demo events

  This migration creates sample data for demonstration purposes.
*/

DO $$
DECLARE
  demo_tenant_id uuid;
  demo_user_id uuid;
  demo_pipeline_id uuid;
  company1_id uuid;
  company2_id uuid;
  client1_id uuid;
  client2_id uuid;
BEGIN
  -- Get demo tenant and user
  SELECT id INTO demo_tenant_id FROM tenants WHERE domain = 'demo.crmfacil.com';
  SELECT id INTO demo_user_id FROM users WHERE email = 'admin@crmfacil.com';
  SELECT id INTO demo_pipeline_id FROM pipelines WHERE tenant_id = demo_tenant_id AND is_default = true;
  
  IF demo_tenant_id IS NOT NULL AND demo_user_id IS NOT NULL THEN
    -- Insert sample companies
    INSERT INTO companies (id, name, razao_social, cnpj, segment, origin, store_count, email, phone, city, state, tags, tenant_id)
    VALUES 
      (gen_random_uuid(), 'Empresa ABC Ltda', 'ABC Comércio e Serviços Ltda', '12.345.678/0001-95', 'Tecnologia', 'Indicação', 5, 'contato@empresaabc.com', '(11) 98765-4321', 'São Paulo', 'SP', ARRAY['Cliente Premium', 'Ativo'], demo_tenant_id),
      (gen_random_uuid(), 'XYZ Indústria S.A.', 'XYZ Indústria e Comércio S.A.', '98.765.432/0001-87', 'Indústria', 'Site', 12, 'comercial@xyzindustria.com', '(11) 87654-3210', 'Rio de Janeiro', 'RJ', ARRAY['Prospect'], demo_tenant_id)
    RETURNING id INTO company1_id;

    -- Get company IDs
    SELECT id INTO company1_id FROM companies WHERE cnpj = '12.345.678/0001-95' AND tenant_id = demo_tenant_id;
    SELECT id INTO company2_id FROM companies WHERE cnpj = '98.765.432/0001-87' AND tenant_id = demo_tenant_id;

    -- Insert sample clients
    INSERT INTO clients (id, name, cpf, email, phone, city, state, company_id, responsible_ids, tags, tenant_id)
    VALUES 
      (gen_random_uuid(), 'João Silva', '123.456.789-01', 'joao@email.com', '(11) 98765-4321', 'São Paulo', 'SP', company1_id, ARRAY[demo_user_id], ARRAY['VIP', 'Ativo'], demo_tenant_id),
      (gen_random_uuid(), 'Ana Costa', '987.654.321-09', 'ana@email.com', '(11) 87654-3210', 'Rio de Janeiro', 'RJ', company2_id, ARRAY[demo_user_id], ARRAY['Novo'], demo_tenant_id)
    RETURNING id INTO client1_id;

    -- Get client IDs
    SELECT id INTO client1_id FROM clients WHERE cpf = '123.456.789-01' AND tenant_id = demo_tenant_id;
    SELECT id INTO client2_id FROM clients WHERE cpf = '987.654.321-09' AND tenant_id = demo_tenant_id;

    -- Insert sample deals (only if pipeline exists)
    IF demo_pipeline_id IS NOT NULL THEN
      INSERT INTO deals (title, description, value, stage, probability, expected_close_date, client_id, company_id, responsible_id, pipeline_id, tenant_id)
      VALUES 
        ('Implementação Sistema CRM', 'Projeto de implementação completa do sistema CRM', 50000.00, 'Proposta', 75, CURRENT_DATE + INTERVAL '30 days', client1_id, company1_id, demo_user_id, demo_pipeline_id, demo_tenant_id),
        ('Consultoria em Vendas', 'Projeto de consultoria para otimização do processo de vendas', 25000.00, 'Qualificação', 50, CURRENT_DATE + INTERVAL '45 days', client2_id, company2_id, demo_user_id, demo_pipeline_id, demo_tenant_id);
    END IF;

    -- Insert sample events
    INSERT INTO events (title, description, start_date, end_date, type, client_id, responsible_id, tenant_id)
    VALUES 
      ('Reunião com Cliente ABC', 'Apresentação da proposta de CRM', CURRENT_DATE + INTERVAL '1 day' + TIME '14:00', CURRENT_DATE + INTERVAL '1 day' + TIME '15:00', 'meeting', client1_id, demo_user_id, demo_tenant_id),
      ('Follow-up Proposta XYZ', 'Acompanhamento da proposta de consultoria', CURRENT_DATE + INTERVAL '2 days' + TIME '10:30', CURRENT_DATE + INTERVAL '2 days' + TIME '11:00', 'call', client2_id, demo_user_id, demo_tenant_id);
  END IF;
END $$;