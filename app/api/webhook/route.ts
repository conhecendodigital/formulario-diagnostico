import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://webhook.vendasvno.com/webhook/pdf-forms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('Webhook failed:', res.status, text)
      return NextResponse.json({ error: 'Webhook failed', status: res.status }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook proxy error:', error)
    return NextResponse.json({ error: 'Erro ao enviar para webhook' }, { status: 500 })
  }
}
