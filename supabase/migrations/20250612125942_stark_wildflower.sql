/*
  # Create events table

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text, event title)
      - `description` (text, event description)
      - `start_date` (timestamptz, start date and time)
      - `end_date` (timestamptz, end date and time)
      - `all_day` (boolean, all day event)
      - `type` (text, event type)
      - `client_id` (uuid, references clients)
      - `deal_id` (uuid, references deals)
      - `responsible_id` (uuid, references users)
      - `google_event_id` (text, Google Calendar event ID)
      - `outlook_event_id` (text, Outlook event ID)
      - `tenant_id` (uuid, references tenants)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `events` table
    - Add policy for users to access events in their tenant
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  all_day boolean DEFAULT false,
  type text DEFAULT 'meeting',
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  responsible_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  google_event_id text,
  outlook_event_id text,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access events in their tenant"
  ON events
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_tenant_id_idx ON events(tenant_id);
CREATE INDEX IF NOT EXISTS events_responsible_id_idx ON events(responsible_id);
CREATE INDEX IF NOT EXISTS events_start_date_idx ON events(start_date);
CREATE INDEX IF NOT EXISTS events_client_id_idx ON events(client_id);
CREATE INDEX IF NOT EXISTS events_deal_id_idx ON events(deal_id);