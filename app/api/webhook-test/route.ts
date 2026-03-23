import { NextResponse } from 'next/server'

export async function GET() {
  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://webhook.vendasvno.com/webhook/pdf-forms'
  
  const testData = {
    test: true,
    timestamp: new Date().toISOString(),
    message: 'Teste de conectividade do formulário'
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    })

    const responseText = await res.text().catch(() => '')

    return NextResponse.json({
      success: res.ok,
      webhookUrl,
      status: res.status,
      statusText: res.statusText,
      response: responseText.slice(0, 500),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      webhookUrl,
      error: String(error),
    }, { status: 500 })
  }
}
