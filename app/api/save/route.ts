import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simple sanitize: trim strings, limit length
function sanitize(val: unknown, maxLen = 500): string {
  if (typeof val !== 'string') return ''
  return val.trim().slice(0, maxLen)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.submissionId || !body.email) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const { error } = await supabase
      .from('diagnosticos')
      .upsert({
        submission_id: sanitize(body.submissionId, 100),
        instagram: sanitize(body.instagram, 100),
        nome: sanitize(body.nome, 200),
        email: sanitize(body.email, 200),
        nicho: sanitize(body.nicho, 200),
        objetivo: sanitize(body.objetivo, 200),
        dificuldade: sanitize(body.dificuldade, 200),
        fatura: sanitize(body.fatura, 200),
        descobrir: Array.isArray(body.descobrir)
          ? body.descobrir.map((s: unknown) => sanitize(s, 200)).filter(Boolean)
          : [],
        tom: sanitize(body.tom, 200),
        print_perfil: sanitize(body.print_perfil, 1000),
        print_insights: sanitize(body.print_insights, 1000),
        print_melhor_post: sanitize(body.print_melhor_post, 1000),
        prints_insights_detalhados: Array.isArray(body.prints_insights_detalhados)
          ? body.prints_insights_detalhados.map((s: unknown) => sanitize(s, 1000)).filter(Boolean)
          : [],
        desabafo: sanitize(body.desabafo, 2000),
        submitted_at: body.submitted_at || new Date().toISOString(),
      }, { onConflict: 'submission_id' })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save API error:', error)
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }
}
