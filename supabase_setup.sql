-- =============================================
-- SUPABASE SETUP — Formulário Diagnóstico
-- Execute TUDO no SQL Editor do Supabase
-- =============================================

-- 1. STORAGE: Criar bucket público para os prints
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'diagnostico',
  'diagnostico',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. STORAGE POLICIES: Permitir upload e leitura pública
-- Leitura pública (qualquer um pode ver os prints)
CREATE POLICY IF NOT EXISTS "Acesso público leitura" ON storage.objects
  FOR SELECT USING (bucket_id = 'diagnostico');

-- Upload via service role (a API route usa service_role_key)
CREATE POLICY IF NOT EXISTS "Upload via service role" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'diagnostico');

-- 3. TABELA: Salvar os formulários como backup
CREATE TABLE IF NOT EXISTS public.diagnosticos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id TEXT UNIQUE,
  
  -- Dados de contato
  instagram TEXT,
  nome TEXT,
  email TEXT,
  
  -- Respostas
  nicho TEXT,
  objetivo TEXT,
  dificuldade TEXT,
  fatura TEXT,
  descobrir TEXT[], -- array de strings
  tom TEXT,
  
  -- URLs dos prints (Supabase Storage)
  print_perfil TEXT,
  print_insights TEXT,
  print_melhor_post TEXT,
  
  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT, -- URL do PDF gerado (preenchida pelo n8n depois)
  status TEXT DEFAULT 'pendente' -- pendente, analisando, concluido
);

-- 4. POLICIES: Permitir insert público e select via service role
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Qualquer um pode inserir" ON public.diagnosticos
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role pode ler tudo" ON public.diagnosticos
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Service role pode atualizar" ON public.diagnosticos
  FOR UPDATE USING (true);

-- 5. INDEX para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_diagnosticos_email ON public.diagnosticos(email);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_instagram ON public.diagnosticos(instagram);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_submission_id ON public.diagnosticos(submission_id);
