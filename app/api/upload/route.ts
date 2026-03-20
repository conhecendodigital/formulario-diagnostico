import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role for server-side uploads
)

const BUCKET = 'diagnostico'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const submissionId = formData.get('submissionId') as string || crypto.randomUUID()

    if (!files.length) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Ensure bucket exists (will be created manually in Supabase dashboard)
    const uploadedUrls: Record<string, string> = {}

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg'
      const fieldName = formData.get(`fieldName_${files.indexOf(file)}`) as string || file.name
      const fileName = `${submissionId}/${fieldName}_${Date.now()}.${ext}`

      const buffer = await file.arrayBuffer()
      
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error(`Upload error for ${fieldName}:`, error)
        continue
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName)

      uploadedUrls[fieldName] = urlData.publicUrl
    }

    return NextResponse.json({ 
      success: true, 
      submissionId,
      urls: uploadedUrls 
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload' }, 
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
