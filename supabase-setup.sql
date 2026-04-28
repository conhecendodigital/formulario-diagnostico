-- Execute este SQL no Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

CREATE TABLE IF NOT EXISTS mentoria_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  instagram TEXT,
  seguidores TEXT,
  nicho TEXT,
  tempo TEXT,
  dificuldade TEXT,
  tentativas TEXT,
  investimento TEXT,
  horas TEXT,
  disponibilidade TEXT,
  extra TEXT,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Permissao: apenas INSERT publico (anon key), leitura bloqueada
ALTER TABLE mentoria_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode enviar candidatura"
  ON mentoria_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Apenas service_role pode ler (admin)
CREATE POLICY "Apenas admin pode ler leads"
  ON mentoria_leads
  FOR SELECT
  TO authenticated
  USING (true);
