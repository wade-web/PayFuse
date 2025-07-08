/*
  # Schema initial PayFuse

  1. Nouvelles tables
    - `profiles` - Profils utilisateurs
    - `payments` - Transactions de paiement
    - `webhooks` - Configuration des webhooks
    - `api_keys` - Clés API utilisateurs
    - `security_logs` - Logs de sécurité

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour l'accès utilisateur
*/

-- Profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Paiements
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  provider text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  description text,
  provider_payment_id text,
  payment_url text,
  webhook_url text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL,
  status text NOT NULL DEFAULT 'active',
  secret text,
  last_delivery timestamptz,
  delivery_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Clés API
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL,
  permissions text[] NOT NULL,
  last_used timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Logs de sécurité
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  message text NOT NULL,
  ip_address inet,
  user_agent text,
  severity text NOT NULL DEFAULT 'info',
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own webhooks"
  ON webhooks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own webhooks"
  ON webhooks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own api_keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own api_keys"
  ON api_keys FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own security_logs"
  ON security_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments(created_at);
CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS security_logs_user_id_idx ON security_logs(user_id);