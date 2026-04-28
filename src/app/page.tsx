"use client";

import { useState, useEffect } from "react";

/* ── DATA ───────────────────────────────────────── */

const SEGUIDORES = [
  { value: "menos_1k", label: "Menos de 1.000", sub: "Estou começando agora", score: 0 },
  { value: "1k_5k", label: "Entre 1.000 e 5.000", sub: "Já tenho uma base inicial", score: 20 },
  { value: "5k_10k", label: "Entre 5.000 e 10.000", sub: "Estou crescendo aos poucos", score: 20 },
  { value: "10k_50k", label: "Entre 10.000 e 50.000", sub: "Tenho uma comunidade ativa", score: 10 },
  { value: "50k_mais", label: "Mais de 50.000", sub: "Já tenho um público grande", score: 5 },
];

const TEMPO = [
  { value: "menos_3m", label: "Menos de 3 meses", score: 3 },
  { value: "3_12m", label: "De 3 a 12 meses", score: 8 },
  { value: "1_3a", label: "De 1 a 3 anos", score: 10 },
  { value: "mais_3a", label: "Mais de 3 anos", score: 8 },
];

const DIFICULDADE = [
  { value: "ideias", label: "Não sei o que postar", sub: "Fico travado na hora de criar", score: 8 },
  { value: "alcance", label: "Posto mas ninguém vê", sub: "Meu conteúdo não chega nas pessoas", score: 10 },
  { value: "consistencia", label: "Não consigo manter a frequência", sub: "Começo bem mas paro depois de um tempo", score: 10 },
  { value: "monetizar", label: "Tenho audiência mas não vendo", sub: "As pessoas me seguem mas não compram", score: 10 },
  { value: "posicionamento", label: "Não sei como me posicionar", sub: "Falta clareza sobre o meu nicho", score: 10 },
];

const INVESTIMENTO = [
  { value: "sim_total", label: "Sim, estou pronto", sub: "Já tenho esse valor disponível", score: 20 },
  { value: "sim_parcelado", label: "Sim, se puder parcelar", sub: "Consigo investir com parcelamento", score: 20 },
  { value: "preciso_entender", label: "Preciso entender melhor", sub: "Quero saber o que está incluído antes de decidir", score: 10 },
  { value: "nao_agora", label: "Agora não consigo", sub: "Não tenho esse valor disponível no momento", score: 0 },
];

const HORAS = [
  { value: "menos_3", label: "Menos de 3 horas", score: 3 },
  { value: "3_5", label: "De 3 a 5 horas", score: 8 },
  { value: "5_10", label: "De 5 a 10 horas", score: 10 },
  { value: "mais_10", label: "Mais de 10 horas", score: 10 },
];

const DISPONIBILIDADE = [
  { value: "sim", label: "Sim, consigo estar presente", sub: "Vou participar dos encontros ao vivo", score: 10 },
  { value: "maioria", label: "Na maioria das vezes", sub: "Quando não puder, vejo a gravação", score: 6 },
  { value: "dificil", label: "Vai ser difícil", sub: "Só conseguiria acompanhar pelas gravações", score: 0 },
];

/* ── STEP CONFIG ─────────────────────────────────── */

type StepType = "text" | "email" | "tel" | "radio" | "select" | "textarea";

interface StepConfig {
  id: string;
  question: string;
  type: StepType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string; sub?: string; score?: number }[];
  hint?: string;
}

const STEPS: StepConfig[] = [
  { id: "nome", question: "Qual é o seu nome completo?", type: "text", placeholder: "Digite seu nome", required: true },
  { id: "email", question: "Qual é o seu melhor e-mail?", type: "email", placeholder: "seuemail@exemplo.com", required: true },
  { id: "telefone", question: "Qual é o seu WhatsApp?", type: "tel", placeholder: "(11) 99999-9999", required: true, hint: "Com DDD. Vamos entrar em contato por lá." },
  { id: "instagram", question: "Qual é o @ do seu Instagram?", type: "text", placeholder: "@seuperfil", required: true, hint: "Vamos dar uma olhada no seu perfil antes da conversa." },
  { id: "seguidores", question: "Quantos seguidores você tem hoje?", type: "radio", options: SEGUIDORES, required: true },
  { id: "nicho", question: "Qual é o seu nicho de conteúdo?", type: "text", placeholder: "Ex: maternidade, finanças, fitness, beleza...", required: true },
  { id: "tempo", question: "Há quanto tempo você cria conteúdo?", type: "select", options: TEMPO, required: true },
  { id: "dificuldade", question: "Qual é a sua maior dificuldade hoje?", type: "radio", options: DIFICULDADE, required: true },
  { id: "tentativas", question: "O que você já tentou para resolver isso?", type: "textarea", placeholder: "Cursos, mentorias, estratégias que testou...", required: true, hint: "Quanto mais detalhe, melhor conseguimos preparar a conversa." },
  { id: "investimento", question: "Está disposto a investir de R$3.500 a R$6.000 para ter nosso acompanhamento no grupo exclusivo e encontros ao vivo que vão te dar a direção certa?", type: "radio", options: INVESTIMENTO, required: true },
  { id: "horas", question: "Quantas horas por semana você dedica ao conteúdo?", type: "select", options: HORAS, required: true },
  { id: "disponibilidade", question: "Consegue participar ao vivo às 18h (Brasil) ou 22h (Portugal)?", type: "radio", options: DISPONIBILIDADE, required: true },
  { id: "extra", question: "Quer contar mais alguma coisa?", type: "textarea", placeholder: "Escreva aqui se quiser, é opcional.", required: false, hint: "Pode deixar em branco se preferir." },
];

const TOTAL = STEPS.length;

/* ── MAIN COMPONENT ──────────────────────────────── */

export default function MentoriaForm() {
  const [step, setStep] = useState(-1); // -1 = welcome
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [animating, setAnimating] = useState(false);

  const goTo = (n: number) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(n);
      setError("");
      setAnimating(false);
    }, 200);
  };

  const current = step >= 0 && step < TOTAL ? STEPS[step] : null;

  const validate = (): boolean => {
    if (!current) return true;
    if (!current.required && !answers[current.id]) return true;
    const val = (answers[current.id] || "").trim();
    if (current.required && !val) {
      setError("Preencha este campo para continuar.");
      return false;
    }
    if (current.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setError("Informe um e-mail válido.");
      return false;
    }
    setError("");
    return true;
  };

  const next = () => {
    if (!validate()) return;
    if (step < TOTAL - 1) goTo(step + 1);
    else submit();
  };

  const prev = () => {
    if (step > 0) goTo(step - 1);
    else if (step === 0) goTo(-1);
  };

  const submit = async () => {
    let score = 0;
    STEPS.forEach((s) => {
      if (s.options) {
        const opt = s.options.find((o) => o.value === answers[s.id]);
        if (opt?.score) score += opt.score;
      }
    });
    const lead = { ...answers, score, timestamp: new Date().toISOString() };

    // Salva no localStorage como backup
    try {
      const leads = JSON.parse(localStorage.getItem("mentoria_leads") || "[]");
      leads.push(lead);
      localStorage.setItem("mentoria_leads", JSON.stringify(leads));
    } catch {}

    // Envia para o Supabase
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch {}

    setDone(true);
    goTo(TOTAL);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && current?.type !== "textarea") {
      e.preventDefault();
      next();
    }
  };

  const pct = step < 0 ? 0 : Math.min(((step + 1) / TOTAL) * 100, 100);

  /* ── WELCOME ── */
  if (step === -1) {
    return (
      <Shell pct={0}>
        <div className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-sky-500/20">
              <svg width="28" height="28" fill="none" viewBox="0 0 48 48"><path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="white"/></svg>
            </div>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-sky-400 mb-3">Mentoria de Crescimento</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              Candidatura para<br />entrar na turma
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-sm leading-relaxed mb-8">
              Responda algumas perguntas rápidas para agendar uma conversa com a Cátia ou o Matheus.
            </p>
            <div className="flex gap-2 mb-8">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/50">@catiacreator</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/50">@omatheus.ai</span>
            </div>
            <button onClick={() => goTo(0)} className="btn-primary w-full max-w-xs">
              Começar
            </button>
            <p className="text-xs text-white/30 mt-4">Leva menos de 3 minutos</p>
          </div>
        </div>
      </Shell>
    );
  }

  /* ── SUCCESS ── */
  if (done && step >= TOTAL) {
    return (
      <Shell pct={100}>
        <div className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-sky-500/30 text-white text-3xl font-bold">
              ✓
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Candidatura enviada!</h2>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed mb-6">
              Vamos analisar as suas respostas e entrar em contato pelo WhatsApp para marcar a conversa.
            </p>
            <div className="w-full max-w-sm rounded-xl bg-sky-500/5 border border-sky-500/15 p-5 text-left">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-sky-400 mb-2">Próximo passo</p>
              <p className="text-sm text-white/60 leading-relaxed">
                Fique de olho no seu WhatsApp. A gente vai mandar uma mensagem para combinar o melhor horário.
              </p>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (!current) return null;

  /* ── FORM STEP ── */
  return (
    <Shell pct={pct} stepLabel={`${step + 1} de ${TOTAL}`}>
      <div
        className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
        onKeyDown={handleKey}
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold leading-snug mb-6">
          {current.question}
        </h2>

        {/* TEXT / EMAIL / TEL */}
        {(current.type === "text" || current.type === "email" || current.type === "tel") && (
          <input
            type={current.type}
            autoFocus
            className="form-input"
            placeholder={current.placeholder}
            value={answers[current.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
          />
        )}

        {/* TEXTAREA */}
        {current.type === "textarea" && (
          <textarea
            autoFocus
            className="form-input min-h-[120px] resize-y"
            placeholder={current.placeholder}
            value={answers[current.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
          />
        )}

        {/* SELECT */}
        {current.type === "select" && current.options && (
          <div className="grid gap-2">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setAnswers({ ...answers, [current.id]: opt.value }); setError(""); }}
                className={`option-card ${answers[current.id] === opt.value ? "selected" : ""}`}
              >
                <span className="option-dot" />
                <span className="text-sm font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* RADIO */}
        {current.type === "radio" && current.options && (
          <div className="grid gap-2">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setAnswers({ ...answers, [current.id]: opt.value }); setError(""); }}
                className={`option-card ${answers[current.id] === opt.value ? "selected" : ""}`}
              >
                <span className="option-dot" />
                <div className="text-left">
                  <span className="text-sm font-semibold block">{opt.label}</span>
                  {opt.sub && <span className="text-xs text-white/40 block mt-0.5">{opt.sub}</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* HINT */}
        {current.hint && <p className="text-xs text-white/30 mt-3">{current.hint}</p>}

        {/* ERROR */}
        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

        {/* NAV */}
        <div className="flex gap-3 mt-8">
          <button type="button" onClick={prev} className="btn-ghost">
            Voltar
          </button>
          <button type="button" onClick={next} className="btn-primary flex-1">
            {step === TOTAL - 1 ? "Enviar candidatura" : "Continuar"}
          </button>
        </div>

        {/* KEYBOARD HINT */}
        {current.type !== "textarea" && (
          <p className="text-[11px] text-white/20 text-center mt-4 hidden sm:block">
            Pressione Enter para continuar
          </p>
        )}
      </div>
    </Shell>
  );
}

/* ── SHELL LAYOUT ────────────────────────────────── */

function Shell({ children, pct, stepLabel }: { children: React.ReactNode; pct: number; stepLabel?: string }) {
  return (
    <div className="relative min-h-dvh flex flex-col">
      {/* Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="absolute -bottom-32 -right-20 w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      {/* Progress */}
      {pct > 0 && (
        <div className="sticky top-0 z-20 bg-[#0c1120]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-lg mx-auto px-5 py-3 flex items-center gap-4">
            {stepLabel && (
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 shrink-0">
                {stepLabel}
              </span>
            )}
            <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-5 py-12">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}
