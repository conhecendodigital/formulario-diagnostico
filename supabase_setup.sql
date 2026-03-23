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
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. STORAGE POLICIES
DROP POLICY IF EXISTS "Acesso publico leitura" ON storage.objects;
CREATE POLICY "Acesso publico leitura" ON storage.objects
  FOR SELECT USING (bucket_id = 'diagnostico');

DROP POLICY IF EXISTS "Upload via service role" ON storage.objects;
CREATE POLICY "Upload via service role" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'diagnostico');

-- 3. TABELA: Salvar os formulários
CREATE TABLE IF NOT EXISTS public.diagnosticos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id TEXT UNIQUE,
  instagram TEXT,
  nome TEXT,
  email TEXT,
  nicho TEXT,
  objetivo TEXT,
  dificuldade TEXT,
  fatura TEXT,
  descobrir TEXT[],
  tom TEXT,
  print_perfil TEXT,
  print_insights TEXT,
  print_melhor_post TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  status TEXT DEFAULT 'pendente'
);

-- 4. RLS + POLICIES
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode inserir" ON public.diagnosticos;
CREATE POLICY "Qualquer um pode inserir" ON public.diagnosticos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role pode ler" ON public.diagnosticos;
CREATE POLICY "Service role pode ler" ON public.diagnosticos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role pode atualizar" ON public.diagnosticos;
CREATE POLICY "Service role pode atualizar" ON public.diagnosticos
  FOR UPDATE USING (true);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_diagnosticos_email ON public.diagnosticos(email);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_instagram ON public.diagnosticos(instagram);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_submission_id ON public.diagnosticos(submission_id);
