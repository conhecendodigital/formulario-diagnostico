import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { error } = await supabase
      .from('diagnosticos')
      .upsert({
        submission_id: body.submissionId,
        instagram: body.instagram,
        nome: body.nome,
        email: body.email,
        nicho: body.nicho,
        objetivo: body.objetivo,
        dificuldade: body.dificuldade,
        fatura: body.fatura,
        descobrir: Array.isArray(body.descobrir) ? body.descobrir : [body.descobrir].filter(Boolean),
        tom: body.tom,
        print_perfil: body.print_perfil,
        print_insights: body.print_insights,
        print_melhor_post: body.print_melhor_post,
        submitted_at: body.submitted_at,
      }, { onConflict: 'submission_id' })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save API error:', error)
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }
}
