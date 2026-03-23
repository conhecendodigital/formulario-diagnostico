import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'diagnostico'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const submissionId = formData.get('submissionId') as string || crypto.randomUUID()

    if (!files.length) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Máximo 5 arquivos por vez' }, { status: 400 })
    }

    const uploadedUrls: Record<string, string> = {}

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        console.error(`File too large: ${file.name} (${file.size} bytes)`)
        continue
      }

      // Validate MIME type
      if (!ALLOWED_TYPES.includes(file.type)) {
        console.error(`Invalid file type: ${file.type}`)
        continue
      }

      const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
      const fieldName = (formData.get(`fieldName_${files.indexOf(file)}`) as string || 'file').replace(/[^a-zA-Z0-9_-]/g, '')
      const fileName = `${submissionId.replace(/[^a-zA-Z0-9_-]/g, '')}/${fieldName}_${Date.now()}.${ext}`

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
