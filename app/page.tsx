'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
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

type QuestionDef =
  | { kind: 'intro' }
  | { kind: 'contact' }
  | { kind: 'text'; name: string; label: string; placeholder: string; required: boolean }
  | { kind: 'select'; name: string; label: string; options: string[]; required: boolean }
  | { kind: 'multi'; name: string; label: string; options: string[]; required: boolean; hint?: string }
  | { kind: 'upload'; name: string; label: string; instruction: string; required: boolean }
  | { kind: 'multiupload'; name: string; label: string; instruction: string }
  | { kind: 'submit' }

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
    <div>
      <label className="block text-lg sm:text-xl font-bold text-white mb-1.5">
        {label} {required && <span className="text-[#0ea5e9]">*</span>}
      </label>
      {instruction && (
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">{instruction}</p>
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
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragging
              ? "border-[#0ea5e9] bg-[#0ea5e9]/10"
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
          }`}
        >
          <span className="material-symbols-outlined text-5xl text-slate-500 mb-3 block">add_photo_alternate</span>
          <p className="text-sm text-slate-400 font-medium">Toca aqui para tirar ou escolher o print</p>
          <p className="text-xs text-slate-600 mt-1.5">JPG, PNG — máx 10MB</p>
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
    <div>
      <label className="block text-lg sm:text-xl font-bold text-white mb-1.5">{label}</label>
      {instruction && <p className="text-xs text-slate-400 mb-4">{instruction}</p>}
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
// 10 questions (intro + 10 + submit = 12 slides)
// ═══════════════════════════════════════════════

const questions: QuestionDef[] = [
  // 0 — Intro
  { kind: 'intro' },

  // 1 — Dados de contato (3 campos agrupados)
  { kind: 'contact' },

  // 2 — Nicho
  { kind: 'text', name: 'nicho', label: 'Qual seu nicho?', placeholder: 'Ex: Nutrição, Marketing, Moda...', required: true },

  // 3 — Print do perfil
  { kind: 'upload', name: 'print_perfil', label: 'Print do seu PERFIL completo', required: true,
    instruction: 'Abra seu perfil no Instagram e tire um print da tela inteira. Quero ver: foto, bio, seguidores e o grid.' },

  // 4 — Print dos insights
  { kind: 'upload', name: 'print_insights', label: 'Print dos INSIGHTS gerais', required: true,
    instruction: 'Instagram → Painel profissional → Insights → Visão geral. Tire print dessa tela (alcance, engajamento, seguidores).' },

  // 5 — Print melhor post
  { kind: 'upload', name: 'print_melhor_post', label: 'Print do seu MELHOR POST recente', required: true,
    instruction: 'Abra o post que foi melhor nos últimos 30 dias. Print mostrando o post + curtidas + comentários.' },

  // 6 — Objetivo
  { kind: 'select', name: 'objetivo', label: 'Qual seu objetivo PRINCIPAL?', required: true,
    options: ['Ganhar seguidores', 'Vender produto/serviço', 'Construir autoridade', 'Conseguir clientes', 'Monetizar com publi', 'Criar comunidade', 'Divulgar negócio local', 'Ainda não sei'] },

  // 7 — Maior dificuldade
  { kind: 'select', name: 'dificuldade', label: 'Sua MAIOR dificuldade hoje?', required: true,
    options: ['Não sei o que postar', 'Posto mas ninguém vê', 'Tenho views mas ninguém compra', 'Não mantenho constância', 'Não sei vender sem parecer chato', 'Cresci mas não gera dinheiro', 'Não sei usar Reels', 'Tudo acima'] },

  // 8 — Fatura
  { kind: 'select', name: 'fatura', label: 'Você já fatura com o Instagram?', required: true,
    options: ['Nunca vendi nada', 'Já vendi mas não é constante', 'Vendas toda semana', 'É minha renda principal', 'Só publi/parcerias'] },

  // 9 — O que quer descobrir
  { kind: 'multi', name: 'descobrir', label: 'O que mais quer descobrir?', required: true, hint: 'Escolha até 3',
    options: ['O que está errado', 'Que conteúdo fazer', 'Como vender mais', 'Como ganhar seguidores', 'Se a bio está boa', 'Quais posts funcionam', 'Formatos novos', 'Plano de ação'] },

  // 10 — Tom da análise
  { kind: 'select', name: 'tom', label: 'Você prefere que eu seja...', required: true,
    options: ['100% direto — quero a verdade', 'Direto mas com carinho', 'Mais motivacional — quero sair animado'] },

  // Submit
  { kind: 'submit' },
]

const TOTAL_QUESTIONS = 10 // questions excluding intro and submit

// ═══════════════════════════════════════════════
// Main Form
// ═══════════════════════════════════════════════

export default function DiagnosticoForm() {
  const [qi, setQi] = useState(0) // question index
  const [data, setData] = useState<Record<string, unknown>>({})
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [direction, setDirection] = useState(1)

  const set = useCallback((k: string, v: unknown) => setData(p => ({ ...p, [k]: v })), [])
  const toggle = useCallback((k: string, v: string) => {
    setData(p => {
      const current = (p[k] as string[]) || []
      return { ...p, [k]: current.includes(v) ? current.filter(i => i !== v) : [...current, v] }
    })
  }, [])

  const q = questions[qi]

  // Count answered questions for progress
  const answeredCount = (() => {
    let count = 0
    for (const question of questions) {
      if (question.kind === 'intro' || question.kind === 'submit') continue
      if (question.kind === 'contact') {
        if (data.instagram && data.nome && data.email) count++
        continue
      }
      const name = question.name
      const v = data[name]
      if (question.kind === 'multi') { if (Array.isArray(v) && v.length > 0) count++ }
      else if (question.kind === 'upload') { if (v) count++ }
      else if (question.kind === 'multiupload') { if (v) count++ }
      else { if (v && String(v).trim()) count++ }
    }
    return count
  })()
  const pct = (answeredCount / TOTAL_QUESTIONS) * 100

  // Validate current question
  const canAdvance = () => {
    if (q.kind === 'intro') return true
    if (q.kind === 'submit') return false
    if (q.kind === 'contact') {
      return !!(data.instagram && String(data.instagram).trim() && data.nome && String(data.nome).trim() && data.email && String(data.email).trim())
    }
    if (q.kind === 'multiupload') return true // optional
    if (!q.required) return true
    const v = data[q.name]
    if (q.kind === 'multi') return Array.isArray(v) && v.length > 0
    if (q.kind === 'upload') return !!v
    return v && String(v).trim() !== ''
  }

  const goNext = useCallback(() => {
    if (qi < questions.length - 1) {
      setDirection(1)
      setQi(i => i + 1)
    }
  }, [qi])

  const goBack = () => {
    if (qi > 0) {
      setDirection(-1)
      setQi(i => i - 1)
    }
  }

  // Auto-advance on single select
  const handleSelect = useCallback((name: string, value: string) => {
    set(name, value)
    setTimeout(() => {
      setDirection(1)
      setQi(i => Math.min(i + 1, questions.length - 1))
    }, 350)
  }, [set])

  // Keyboard: Enter to advance
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && canAdvance()) {
        if (q.kind === 'intro' || q.kind === 'contact' || (q.kind === 'text') || q.kind === 'multiupload') {
          e.preventDefault()
          goNext()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [qi, data, goNext]) // eslint-disable-line react-hooks/exhaustive-deps

  // Submit
  const submit = async () => {
    setSending(true)
    const submissionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const imageUrls: Record<string, string | string[]> = {}

    const imageFields = Object.entries(data).filter(
      ([, v]) => (v && typeof v === 'object' && 'base64' in (v as Record<string, unknown>)) ||
                  (Array.isArray(v) && v.length > 0 && v[0]?.base64)
    )

    if (imageFields.length > 0) {
      setUploadProgress('Enviando prints...')
      for (const [fieldName, value] of imageFields) {
        try {
          if (Array.isArray(value)) {
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

    setUploadProgress('Finalizando...')
    const clean: Record<string, unknown> = { submissionId, submitted_at: new Date().toISOString() }
    Object.entries(data).forEach(([k, v]) => {
      if (imageUrls[k]) {
        clean[k] = imageUrls[k]
      } else if (v && typeof v === 'object' && 'base64' in (v as Record<string, unknown>)) {
        clean[k] = null
      } else if (Array.isArray(v) && v[0]?.base64) {
        clean[k] = null
      } else {
        clean[k] = v
      }
    })

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

  const allRequiredFilled = () => {
    for (const question of questions) {
      if (question.kind === 'intro' || question.kind === 'submit' || question.kind === 'multiupload') continue
      if (question.kind === 'contact') {
        if (!(data.instagram && data.nome && data.email)) return false
        continue
      }
      if (!question.required) continue
      const v = data[question.name]
      if (question.kind === 'multi') { if (!Array.isArray(v) || v.length === 0) return false }
      else if (question.kind === 'upload') { if (!v) return false }
      else { if (!v || !String(v).trim()) return false }
    }
    return true
  }

  // Animation
  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, y: 0 },
    exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -40 : 40 }),
  }

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
  // Render current question
  // ═══════════════════════════════════════════════
  const questionNumber = qi // intro = 0, first question = 1, etc.

  const renderQuestion = () => {
    switch (q.kind) {
      case 'intro':
        return (
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Estudo Completo do Teu Perfil</h1>
            <p className="text-slate-500 text-sm mb-8">Preenche com calma. Quanto mais honesto, melhor o resultado.</p>
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-6">
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  São só <strong className="text-white">10 perguntas</strong> — leva uns 3 minutos.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  Vou te pedir <strong className="text-white">3 prints do Instagram</strong> — eles me dão dados reais que não consigo ver por fora.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Quanto mais honesto você for, melhor o estudo.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: 'lock', text: 'Confidencial' },
                  { icon: 'timer', text: '3 minutos' },
                  { icon: 'photo_camera', text: '3 prints' },
                  { icon: 'analytics', text: 'Entrega em 48h' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-xl">{item.icon}</span>
                    <span className="text-sm text-slate-300 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'contact':
        return (
          <div>
            <div className="mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]/60">
                Pergunta 1 de {TOTAL_QUESTIONS}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-6">Seus dados</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Seu @ no Instagram <span className="text-[#0ea5e9]">*</span>
                </label>
                <input
                  type="text"
                  value={(data.instagram as string) || ''}
                  onChange={e => set('instagram', e.target.value)}
                  placeholder="@seuperfil"
                  autoFocus
                  className="w-full px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#0ea5e9]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Como quer ser chamado? <span className="text-[#0ea5e9]">*</span>
                </label>
                <input
                  type="text"
                  value={(data.nome as string) || ''}
                  onChange={e => set('nome', e.target.value)}
                  placeholder="Ex: João"
                  className="w-full px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#0ea5e9]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Email para receber o estudo <span className="text-[#0ea5e9]">*</span>
                </label>
                <input
                  type="email"
                  value={(data.email as string) || ''}
                  onChange={e => set('email', e.target.value)}
                  placeholder="seuemail@email.com"
                  className="w-full px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#0ea5e9]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-4">Pressione <span className="text-slate-500 font-bold">Enter ↵</span> para continuar</p>
          </div>
        )

      case 'text':
        return (
          <div>
            <div className="mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]/60">
                Pergunta {questionNumber} de {TOTAL_QUESTIONS}
              </span>
            </div>
            <label className="block text-xl sm:text-2xl font-bold text-white mb-5">
              {q.label} {q.required && <span className="text-[#0ea5e9]">*</span>}
            </label>
            <input
              type="text"
              value={(data[q.name] as string) || ''}
              onChange={e => set(q.name, e.target.value)}
              placeholder={q.placeholder}
              autoFocus
              className="w-full px-5 py-4 rounded-xl bg-white/[0.04] border border-white/8 text-white placeholder-slate-600 text-base focus:outline-none focus:border-[#0ea5e9]/50 focus:bg-white/[0.06] transition-all"
            />
            <p className="text-[11px] text-slate-600 mt-3">Pressione <span className="text-slate-500 font-bold">Enter ↵</span> para continuar</p>
          </div>
        )

      case 'upload':
        return (
          <div>
            <div className="mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]/60">
                Pergunta {questionNumber} de {TOTAL_QUESTIONS}
              </span>
            </div>
            <FileUpload
              name={q.name} label={q.label} instruction={q.instruction}
              required={q.required} value={data[q.name] as UploadValue | null} onChange={set}
            />
          </div>
        )

      case 'multiupload':
        return (
          <div>
            <div className="mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]/60">
                Opcional
              </span>
            </div>
            <MultiUpload
              name={q.name} label={q.label} instruction={q.instruction}
              onChange={set as (name: string, value: MultiUploadItem[]) => void}
            />
          </div>
        )

      case 'select':
        return (
          <div>
            <div className="mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]/60">
                Pergunta {questionNumber} de {TOTAL_QUESTIONS}
              </span>
            </div>
            <label className="block text-xl sm:text-2xl font-bold text-white mb-5">
              {q.label} {q.required && <span className="text-[#0ea5e9]">*</span>}
            </label>
            <div className="space-y-2.5">
              {q.options.map((o, idx) => (
                <button
                  key={o}
                  onClick={() => handleSelect(q.name, o)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all font-medium flex items-center gap-3 ${
                    data[q.name] === o
                      ? 'bg-[#0ea5e9]/15 border-[#0ea5e9]/40 text-[#0ea5e9]'
                      : 'bg-white/[0.02] border-white/6 text-slate-400 hover:bg-white/[0.04] hover:border-white/10'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 text-xs font-black transition-all ${
                    data[q.name] === o ? 'border-[#0ea5e9] bg-[#0ea5e9] text-white' : 'border-white/15 text-slate-600'
                  }`}>
                    {data[q.name] === o ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : String.fromCharCode(65 + idx)}
                  </span>
                  {o}
                </button>
              ))}
            </div>
          </div>
        )

      case 'multi':
        return (
          <div>
            <div className="mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]/60">
                Pergunta {questionNumber} de {TOTAL_QUESTIONS}
              </span>
            </div>
            <label className="block text-xl sm:text-2xl font-bold text-white mb-5">
              {q.label} {q.required && <span className="text-[#0ea5e9]">*</span>}
            </label>
            <div className="space-y-2.5">
              {q.options.map(o => {
                const sel = ((data[q.name] as string[]) || []).includes(o)
                return (
                  <button
                    key={o}
                    onClick={() => toggle(q.name, o)}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 font-medium ${
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
            <p className="text-[10px] text-slate-600 mt-3 font-medium">{q.hint || 'Pode escolher mais de um'}</p>
          </div>
        )

      case 'submit':
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-emerald-400">rocket_launch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Tudo pronto!</h1>
            <p className="text-slate-500 text-sm mb-8">Revise se quiser, ou envia direto.</p>
            <div className="w-full glass-card rounded-2xl p-5 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-[#0ea5e9] text-lg">summarize</span>
                <span className="text-sm font-bold text-white">Resumo</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-400">
                {data.nome ? <p>👤 <span className="text-slate-300">{String(data.nome)}</span></p> : null}
                {data.instagram ? <p>📱 <span className="text-slate-300">{String(data.instagram)}</span></p> : null}
                {data.nicho ? <p>🎯 <span className="text-slate-300">{String(data.nicho)}</span></p> : null}
                {data.objetivo ? <p>🚀 <span className="text-slate-300">{String(data.objetivo)}</span></p> : null}
                <p>📸 <span className="text-slate-300">
                  {Object.entries(data).filter(([, v]) => v && typeof v === 'object' && 'base64' in (v as Record<string, unknown>)).length} prints enviados
                </span></p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed top: progress */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-5 py-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9]/70">
              {q.kind === 'intro' ? 'Início' : `${Math.round(pct)}% completo`}
            </span>
            <span className="text-[10px] font-bold text-slate-600">
              {answeredCount}/{TOTAL_QUESTIONS}
            </span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-[#0ea5e9]"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-5 pt-20 pb-28">
        <div className="max-w-lg w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={qi}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderQuestion()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed bottom: navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-lg mx-auto px-5 py-4 flex gap-3">
          {qi > 0 && (
            <button
              onClick={goBack}
              className="px-5 py-3 rounded-full border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5 transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
          )}

          {q.kind === 'submit' ? (
            <button
              onClick={submit}
              disabled={!allRequiredFilled() || sending}
              className={`flex-1 px-6 py-3.5 rounded-full text-sm font-bold transition-all ${
                allRequiredFilled() && !sending
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
          ) : (
            <button
              onClick={goNext}
              disabled={!canAdvance()}
              className={`flex-1 px-6 py-3.5 rounded-full text-sm font-bold transition-all ${
                canAdvance()
                  ? 'shimmer-btn text-white shadow-lg shadow-[#0ea5e9]/20 hover:shadow-[#0ea5e9]/40'
                  : 'bg-white/5 text-slate-700 cursor-not-allowed'
              }`}
            >
              {q.kind === 'intro' ? 'Começar' : 'Próxima'}
              <span className="material-symbols-outlined text-lg align-middle ml-1">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
