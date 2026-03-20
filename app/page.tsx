'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://n8n.vendasvno.com/webhook-test/bcd43c77-f1f8-426f-b263-c15486892231"

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════

interface UploadValue {
  file: File
  base64: string
  fileName: string
}

interface MultiUploadItem {
  base64: string
  name: string
}

interface FieldDef {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'multi' | 'upload' | 'multiupload'
  placeholder?: string
  required?: boolean
  instruction?: string
  example?: string
  options?: string[]
}

interface StepDef {
  id: string
  title: string
  subtitle: string
  fields: FieldDef[]
}

// ═══════════════════════════════════════════════
// File Upload Component
// ═══════════════════════════════════════════════

function FileUpload({ 
  name, label, instruction, required, value, onChange 
}: { 
  name: string; label: string; instruction?: string; required?: boolean; 
  value: UploadValue | null; onChange: (name: string, value: UploadValue | null) => void 
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("Arquivo muito grande. Máximo 10MB."); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      onChange(name, { file, base64: result, fileName: file.name })
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => { 
    e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) 
  }

  return (
    <div className="mb-2">
      <label className="block text-sm font-bold text-white mb-1.5">
        {label} {required && <span className="text-[#0ea5e9]">*</span>}
      </label>
      {instruction && (
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">{instruction}</p>
      )}
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 glass-card">
          <img src={preview} alt="Preview" className="w-full max-h-64 object-contain bg-black/50" />
          <button onClick={() => { setPreview(null); onChange(name, null) }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/90 text-white text-sm font-bold flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg shadow-red-500/30">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
          <div className="absolute bottom-3 left-3 px-4 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/30">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Print enviado
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => ref.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragging 
              ? "border-[#0ea5e9] bg-[#0ea5e9]/10" 
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
          }`}
        >
          <span className="material-symbols-outlined text-4xl text-slate-500 mb-2 block">add_photo_alternate</span>
          <p className="text-sm text-slate-400 font-medium">Toca aqui para tirar ou escolher o print</p>
          <p className="text-xs text-slate-600 mt-1">JPG, PNG — máx 10MB</p>
          <input ref={ref} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
// Multi Upload Component
// ═══════════════════════════════════════════════

function MultiUpload({ 
  name, label, instruction, onChange 
}: { 
  name: string; label: string; instruction?: string; 
  onChange: (name: string, value: MultiUploadItem[]) => void 
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<MultiUploadItem[]>([])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 5 - previews.length)
    newFiles.forEach(file => {
      if (file.size > 10 * 1024 * 1024) return
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => {
          const updated = [...prev, { base64: e.target?.result as string, name: file.name }]
          onChange(name, updated)
          return updated
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (i: number) => {
    setPreviews(prev => {
      const updated = prev.filter((_, idx) => idx !== i)
      onChange(name, updated)
      return updated
    })
  }

  return (
    <div className="mb-2">
      <label className="block text-sm font-bold text-white mb-1.5">{label}</label>
      {instruction && <p className="text-xs text-slate-400 mb-3">{instruction}</p>}
      <div className="grid grid-cols-3 gap-3 mb-2">
        {previews.map((p, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden border border-white/10 aspect-square glass-card">
            <img src={p.base64} alt="" className="w-full h-full object-cover" />
            <button onClick={() => removeFile(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/90 text-white text-xs flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ))}
        {previews.length < 5 && (
          <div onClick={() => ref.current?.click()}
            className="border border-dashed border-white/10 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all">
            <span className="material-symbols-outlined text-2xl text-slate-600">add</span>
            <span className="text-xs text-slate-600 font-bold mt-1">{previews.length}/5</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
    </div>
  )
}

// ═══════════════════════════════════════════════
// Steps Data
// ═══════════════════════════════════════════════

const steps: StepDef[] = [
  {
    id: "intro", title: "Estudo Completo do Teu Perfil",
    subtitle: "Preenche com calma. Quanto mais honesto, melhor o resultado.", fields: []
  },
  {
    id: "basico", title: "Sobre você", subtitle: "O básico para te conhecer",
    fields: [
      { name: "instagram", label: "Seu @ no Instagram", type: "text", placeholder: "@seuperfil", required: true },
      { name: "nome", label: "Como quer ser chamado no estudo?", type: "text", placeholder: "Ex: João", required: true },
      { name: "email", label: "Email para receber o estudo", type: "text", placeholder: "seuemail@email.com", required: true },
      { name: "nicho", label: "Qual seu nicho?", type: "text", placeholder: "Ex: Nutrição, Marketing, Moda...", required: true },
      { name: "tempo", label: "Há quanto tempo cria conteúdo?", type: "select", required: true,
        options: ["Menos de 6 meses", "6 meses a 1 ano", "1 a 2 anos", "2 a 5 anos", "Mais de 5 anos"] },
      { name: "frequencia", label: "Quantas vezes por semana você posta?", type: "select", required: true,
        options: ["Menos de 1x", "1-2x", "3-4x", "5-6x", "Todo dia"] }
    ]
  },
  {
    id: "prints", title: "Prints do seu perfil", subtitle: "Essa é a parte mais importante. Com os prints eu analiso com dados REAIS.",
    fields: [
      { name: "print_perfil", label: "Print do seu PERFIL completo", type: "upload", required: true,
        instruction: "Abra seu perfil no Instagram e tire um print da tela inteira. Quero ver: foto, bio, seguidores e o grid." },
      { name: "print_insights", label: "Print dos INSIGHTS gerais", type: "upload", required: true,
        instruction: "Instagram → Painel profissional → Insights → Visão geral. Tire print dessa tela (alcance, engajamento, seguidores)." },
      { name: "print_seguidores", label: "Print da DEMOGRAFIA (idade/gênero)", type: "upload", required: false,
        instruction: "Insights → Total de seguidores → tire print da parte de IDADE e GÊNERO. Me ajuda a entender quem te segue." },
      { name: "print_melhor_post", label: "Print do seu MELHOR POST recente", type: "upload", required: true,
        instruction: "Abra o post que você acha que foi melhor nos últimos 30 dias. Print mostrando o post + curtidas + comentários." },
      { name: "print_melhor_reel", label: "Print do seu MELHOR REEL (se faz Reels)", type: "upload", required: false,
        instruction: "Se você faz Reels, abra o melhor e tire print com as views. Se não faz, pule." },
      { name: "print_insights_post", label: "Print dos INSIGHTS de um post", type: "upload", required: false,
        instruction: "Abra qualquer post → 'Ver insights' → print. Mostra salvamentos, compartilhamentos, alcance." },
      { name: "prints_extras", label: "Mais prints? Suba aqui (até 5)", type: "multiupload", required: false,
        instruction: "Prints extras de posts, stories, insights — qualquer coisa que você ache relevante." }
    ]
  },
  {
    id: "objetivo", title: "Seus objetivos", subtitle: "O que você quer com o perfil?",
    fields: [
      { name: "objetivo", label: "Qual seu objetivo PRINCIPAL?", type: "select", required: true,
        options: ["Ganhar seguidores", "Vender produto/serviço", "Construir autoridade", "Conseguir clientes", "Monetizar com publi", "Criar comunidade", "Divulgar negócio local", "Ainda não sei"] },
      { name: "mudar", label: "Se pudesse mudar UMA coisa no perfil, o que seria?", type: "textarea", placeholder: "Fala sem filtro...", required: true },
      { name: "dificuldade", label: "Sua MAIOR dificuldade hoje?", type: "select", required: true,
        options: ["Não sei o que postar", "Posto mas ninguém vê", "Tenho views mas ninguém compra", "Não mantenho constância", "Não sei vender sem parecer chato", "Cresci mas não gera dinheiro", "Não sei usar Reels", "Tudo acima"] }
    ]
  },
  {
    id: "dinheiro", title: "Sobre dinheiro", subtitle: "Isso muda TUDO na análise. Sem julgamento.",
    fields: [
      { name: "fatura", label: "Você já fatura com o Instagram?", type: "select", required: true,
        options: ["Nunca vendi nada", "Já vendi mas não é constante", "Vendas toda semana", "É minha renda principal", "Só publi/parcerias"] },
      { name: "quanto", label: "Quanto por mês? (aproximado)", type: "select", required: true,
        options: ["R$0", "Menos de R$500", "R$500-2.000", "R$2.000-5.000", "R$5.000-15.000", "Mais de R$15.000", "Prefiro não dizer"] },
      { name: "produto_tem", label: "Tem produto ou serviço?", type: "select", required: true,
        options: ["Não tenho nada", "Tenho ideia mas não criei", "Tenho mas não vendo bem", "Tenho e vendo regular", "Vários produtos", "Vendo serviço/consultoria"] },
      { name: "produto_desc", label: "Se tem, descreva rapidamente:", type: "textarea", placeholder: "Ex: Curso R$97, consultoria R$500/sessão...", required: false }
    ]
  },
  {
    id: "conteudo", title: "Seu conteúdo", subtitle: "Como você cria hoje",
    fields: [
      { name: "formatos", label: "Quais formatos você mais usa?", type: "multi", required: true,
        options: ["Fotos com frase", "Carrosséis", "Reels falando", "Reels trending", "Reels tutorial", "Stories", "Lives"] },
      { name: "proposito", label: "Quando posta, qual o objetivo?", type: "select", required: true,
        options: ["Ensinar", "Motivar/inspirar", "Mostrar bastidores", "Vender", "Tudo misturado", "Depende do dia"] },
      { name: "pedido", label: "Você pede algo no final do post?", type: "select", required: true,
        options: ["Sempre", "Às vezes", "Raramente", "Nunca — não gosto", "Não sabia que tinha que pedir"] },
      { name: "legendas", label: "Como são suas legendas?", type: "select", required: true,
        options: ["Curtas (1-2 frases)", "Médias (1 parágrafo)", "Longas (conto história)", "Depende", "Quase não escrevo"] }
    ]
  },
  {
    id: "final", title: "Última etapa", subtitle: "Quase lá!",
    fields: [
      { name: "descobrir", label: "O que mais quer descobrir? (até 3)", type: "multi", required: true,
        options: ["O que está errado", "Que conteúdo fazer", "Como vender mais", "Como ganhar seguidores", "Se a bio está boa", "Quais posts funcionam", "Formatos novos", "Plano de ação"] },
      { name: "tom", label: "Você prefere que eu seja...", type: "select", required: true,
        options: ["100% direto — quero a verdade", "Direto mas com carinho", "Mais motivacional — quero sair animado"] },
      { name: "extra", label: "Mais alguma coisa que eu deveria saber?", type: "textarea", placeholder: "Pode ser qualquer coisa...", required: false }
    ]
  }
]

// ═══════════════════════════════════════════════
// Main Form
// ═══════════════════════════════════════════════

export default function DiagnosticoForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Record<string, unknown>>({})
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const set = useCallback((k: string, v: unknown) => setData(p => ({ ...p, [k]: v })), [])
  const toggle = useCallback((k: string, v: string) => {
    setData(p => {
      const current = (p[k] as string[]) || []
      return { ...p, [k]: current.includes(v) ? current.filter(i => i !== v) : [...current, v] }
    })
  }, [])

  const ok = () => {
    const s = steps[step]
    if (!s.fields.length) return true
    return s.fields.filter(f => f.required).every(f => {
      const v = data[f.name]
      if (f.type === 'multi') return Array.isArray(v) && v.length > 0
      if (f.type === 'upload') return !!v
      return v && String(v).trim()
    })
  }

  const submit = async () => {
    setSending(true)
    const submissionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const imageUrls: Record<string, string | string[]> = {}

    // Step 1: Upload all images to Supabase Storage
    const imageFields = Object.entries(data).filter(
      ([, v]) => (v && typeof v === 'object' && 'base64' in (v as Record<string, unknown>)) ||
                  (Array.isArray(v) && v.length > 0 && v[0]?.base64)
    )

    if (imageFields.length > 0) {
      setUploadProgress('Enviando prints...')
      
      for (const [fieldName, value] of imageFields) {
        try {
          if (Array.isArray(value)) {
            // MultiUpload: upload each file
            const urls: string[] = []
            for (let i = 0; i < value.length; i++) {
              const item = value[i] as MultiUploadItem
              const blob = await fetch(item.base64).then(r => r.blob())
              const formData = new FormData()
              formData.append('files', blob, item.name)
              formData.append('fieldName_0', `${fieldName}_${i}`)
              formData.append('submissionId', submissionId)
              const res = await fetch('/api/upload', { method: 'POST', body: formData })
              const result = await res.json()
              if (result.urls) urls.push(...Object.values(result.urls) as string[])
            }
            imageUrls[fieldName] = urls
          } else {
            // Single upload
            const upload = value as UploadValue
            const blob = await fetch(upload.base64).then(r => r.blob())
            const formData = new FormData()
            formData.append('files', blob, upload.fileName)
            formData.append('fieldName_0', fieldName)
            formData.append('submissionId', submissionId)
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const result = await res.json()
            if (result.urls) imageUrls[fieldName] = Object.values(result.urls)[0] as string
          }
        } catch (err) {
          console.error(`Upload error for ${fieldName}:`, err)
        }
      }
    }

    // Step 2: Build clean payload with URLs instead of base64
    setUploadProgress('Finalizando...')
    const clean: Record<string, unknown> = { submissionId, submitted_at: new Date().toISOString() }
    Object.entries(data).forEach(([k, v]) => {
      if (imageUrls[k]) {
        clean[k] = imageUrls[k]
      } else if (v && typeof v === 'object' && 'base64' in (v as Record<string, unknown>)) {
        clean[k] = null // failed upload
      } else if (Array.isArray(v) && v[0]?.base64) {
        clean[k] = null // failed upload
      } else {
        clean[k] = v
      }
    })

    // Step 3: Send to n8n webhook
    try {
      await fetch(WEBHOOK_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(clean) 
      })
    } catch { console.log('webhook error') }
    setDone(true)
    setSending(false)
    setUploadProgress('')
  }

  const s = steps[step]
  const pct = (step / (steps.length - 1)) * 100

  // ═══════════════════════════════════════════════
  // Success Screen
  // ═══════════════════════════════════════════════
  if (done) return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="w-24 h-24 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
          <span className="material-symbols-outlined text-5xl text-emerald-400">check_circle</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3">Recebido!</h1>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Vou analisar seu perfil com atenção.<br/>O estudo chega no seu email em até <strong className="text-white">48h</strong>.
        </p>

        <div className="space-y-3 text-left mb-10">
          {[
            { text: 'Formulário recebido', done: true },
            { text: 'Análise do perfil', done: false },
            { text: 'PDF pronto → seu email', done: false },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-4 rounded-xl border glass-card ${
              item.done ? 'border-emerald-500/30 bg-emerald-500/[0.05]' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                item.done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500'
              }`}>
                {item.done ? (
                  <span className="material-symbols-outlined text-lg">check</span>
                ) : i + 1}
              </div>
              <span className={`text-sm font-medium ${item.done ? 'text-emerald-300' : 'text-slate-500'}`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <a 
          href="https://instagram.com/omatheus.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-white font-bold text-sm tracking-tight shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
        >
          Seguir @omatheus.ai
        </a>
      </motion.div>
    </div>
  )

  // ═══════════════════════════════════════════════
  // Form
  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-5 py-8">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]">
              {step === 0 ? '' : `Etapa ${step} de ${steps.length - 1}`}
            </span>
            {step > 0 && (
              <span className="text-[10px] font-bold text-slate-600">{Math.round(pct)}%</span>
            )}
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-[#0ea5e9]" 
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Step Title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">{s.title}</h1>
            <p className="text-slate-500 text-sm mb-8">{s.subtitle}</p>

            {/* Intro Step */}
            {s.id === 'intro' && (
              <div className="space-y-4">
                <div className="glass-card rounded-2xl p-6">
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    Esse formulário tem <strong className="text-white">6 etapas rápidas</strong> — leva uns 5 minutos.
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    Vou te pedir uns <strong className="text-white">prints do Instagram</strong> — eles me dão dados reais que não consigo ver por fora (salvamentos, alcance, quem te segue).
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Quanto mais honesto você for, melhor o estudo.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: 'lock', text: 'Confidencial' },
                    { icon: 'timer', text: '5 minutos' },
                    { icon: 'photo_camera', text: 'Vou pedir prints' },
                    { icon: 'analytics', text: 'Entrega em 48h' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card">
                      <span className="material-symbols-outlined text-[#0ea5e9] text-xl">{item.icon}</span>
                      <span className="text-sm text-slate-300 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-6">
              {s.fields.map(f => (
                <div key={f.name}>
                  {f.type === 'upload' && (
                    <FileUpload 
                      name={f.name} label={f.label} instruction={f.instruction} 
                      required={f.required} value={data[f.name] as UploadValue | null} onChange={set} 
                    />
                  )}
                  {f.type === 'multiupload' && (
                    <MultiUpload 
                      name={f.name} label={f.label} instruction={f.instruction} 
                      onChange={set as (name: string, value: MultiUploadItem[]) => void} 
                    />
                  )}
                  {f.type === 'text' && (
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">
                        {f.label} {f.required && <span className="text-[#0ea5e9]">*</span>}
                      </label>
                      <input 
                        type="text" 
                        value={(data[f.name] as string) || ''} 
                        onChange={e => set(f.name, e.target.value)} 
                        placeholder={f.placeholder}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#0ea5e9]/50 focus:bg-white/[0.06] transition-all" 
                      />
                    </div>
                  )}
                  {f.type === 'textarea' && (
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">
                        {f.label} {f.required && <span className="text-[#0ea5e9]">*</span>}
                      </label>
                      <textarea 
                        value={(data[f.name] as string) || ''} 
                        onChange={e => set(f.name, e.target.value)} 
                        placeholder={f.placeholder} 
                        rows={3}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 text-white placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-[#0ea5e9]/50 focus:bg-white/[0.06] transition-all" 
                      />
                    </div>
                  )}
                  {f.type === 'select' && (
                    <div>
                      <label className="block text-sm font-bold text-white mb-3">
                        {f.label} {f.required && <span className="text-[#0ea5e9]">*</span>}
                      </label>
                      <div className="space-y-2">
                        {f.options?.map(o => (
                          <button 
                            key={o} 
                            onClick={() => set(f.name, o)}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all font-medium ${
                              data[f.name] === o 
                                ? 'bg-[#0ea5e9]/15 border-[#0ea5e9]/40 text-[#0ea5e9]' 
                                : 'bg-white/[0.02] border-white/6 text-slate-400 hover:bg-white/[0.04] hover:border-white/10'
                            }`}
                          >
                            {data[f.name] === o && (
                              <span className="material-symbols-outlined text-sm mr-2 align-middle">check_circle</span>
                            )}
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {f.type === 'multi' && (
                    <div>
                      <label className="block text-sm font-bold text-white mb-3">
                        {f.label} {f.required && <span className="text-[#0ea5e9]">*</span>}
                      </label>
                      <div className="space-y-2">
                        {f.options?.map(o => {
                          const sel = ((data[f.name] as string[]) || []).includes(o)
                          return (
                            <button 
                              key={o} 
                              onClick={() => toggle(f.name, o)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 font-medium ${
                                sel 
                                  ? 'bg-[#0ea5e9]/15 border-[#0ea5e9]/40 text-[#0ea5e9]' 
                                  : 'bg-white/[0.02] border-white/6 text-slate-400 hover:bg-white/[0.04] hover:border-white/10'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                                sel ? 'bg-[#0ea5e9] border-[#0ea5e9]' : 'border-white/20'
                              }`}>
                                {sel && <span className="material-symbols-outlined text-white text-sm">check</span>}
                              </div>
                              {o}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[10px] text-slate-600 mt-2 font-medium">Pode escolher mais de um</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-10 pb-12">
              {step > 0 && (
                <button 
                  onClick={() => setStep(p => p - 1)}
                  className="px-6 py-3.5 rounded-full border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5 transition-all"
                >
                  <span className="material-symbols-outlined text-lg align-middle mr-1">arrow_back</span>
                  Voltar
                </button>
              )}
              {step < steps.length - 1 ? (
                <button 
                  onClick={() => setStep(p => p + 1)} 
                  disabled={!ok()}
                  className={`flex-1 px-6 py-3.5 rounded-full text-sm font-bold transition-all ${
                    ok() 
                      ? 'shimmer-btn text-white shadow-lg shadow-[#0ea5e9]/20 hover:shadow-[#0ea5e9]/40' 
                      : 'bg-white/5 text-slate-700 cursor-not-allowed'
                  }`}
                >
                  {step === 0 ? 'Começar' : 'Próxima'}
                  <span className="material-symbols-outlined text-lg align-middle ml-1">arrow_forward</span>
                </button>
              ) : (
                <button 
                  onClick={submit} 
                  disabled={!ok() || sending}
                  className={`flex-1 px-6 py-3.5 rounded-full text-sm font-bold transition-all ${
                    ok() && !sending 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40' 
                      : 'bg-white/5 text-slate-700 cursor-not-allowed'
                  }`}
                >
                  {sending ? (
                    <>
                      <span className="material-symbols-outlined text-lg align-middle mr-1 animate-spin">progress_activity</span>
                      {uploadProgress || 'Enviando...'}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg align-middle mr-1">send</span>
                      Enviar formulário
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
