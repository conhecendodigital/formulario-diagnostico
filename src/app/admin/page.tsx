"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  instagram: string | null;
  seguidores: string | null;
  nicho: string | null;
  tempo: string | null;
  dificuldade: string | null;
  tentativas: string | null;
  investimento: string | null;
  horas: string | null;
  disponibilidade: string | null;
  extra: string | null;
  score: number;
  created_at: string;
}

const LABELS: Record<string, Record<string, string>> = {
  seguidores: { menos_1k: "Menos de 1k", "1k_5k": "1k-5k", "5k_10k": "5k-10k", "10k_50k": "10k-50k", "50k_mais": "50k+" },
  dificuldade: { ideias: "Sem ideias", alcance: "Pouco alcance", consistencia: "Inconsistente", monetizar: "Nao monetiza", posicionamento: "Sem posicionamento" },
  investimento: { sim_total: "Sim, pronto", sim_parcelado: "Sim, parcelado", preciso_entender: "Quer entender", nao_agora: "Nao agora" },
  disponibilidade: { sim: "Sempre", maioria: "Maioria", dificil: "Dificilmente" },
  tempo: { menos_3m: "Menos de 3 meses", "3_12m": "3-12 meses", "1_3a": "1-3 anos", mais_3a: "3+ anos" },
  horas: { menos_3: "Menos de 3h", "3_5": "3-5h", "5_10": "5-10h", mais_10: "10h+" },
};

function lbl(field: string, value: string | null) {
  if (!value) return "";
  return LABELS[field]?.[value] || value;
}

function scoreBadge(score: number) {
  if (score >= 60) return { text: "Alto", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" };
  if (score >= 35) return { text: "Medio", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" };
  return { text: "Baixo", color: "bg-red-500/15 text-red-400 border-red-500/20" };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "mid" | "low">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mentoria_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setLeads(data as Lead[]);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = leads.filter((l) => {
    if (filter === "high") return l.score >= 60;
    if (filter === "mid") return l.score >= 35 && l.score < 60;
    if (filter === "low") return l.score < 35;
    return true;
  });

  const high = leads.filter((l) => l.score >= 60).length;
  const mid = leads.filter((l) => l.score >= 35 && l.score < 60).length;
  const low = leads.filter((l) => l.score < 35).length;

  return (
    <div className="min-h-dvh bg-[#0c1120] text-white">
      {/* Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-sky-500/8 blur-[100px]" />
        <div className="absolute -bottom-32 -right-20 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-sky-400 mb-1">Mentoria de Crescimento</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              Painel de Leads
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchLeads} className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">
              Atualizar
            </button>
            <a href="/mentoria/" className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">
              Formulario
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={leads.length} onClick={() => setFilter("all")} active={filter === "all"} />
          <StatCard label="Alto encaixe" value={high} color="text-emerald-400" onClick={() => setFilter("high")} active={filter === "high"} />
          <StatCard label="Medio" value={mid} color="text-amber-400" onClick={() => setFilter("mid")} active={filter === "mid"} />
          <StatCard label="Baixo" value={low} color="text-red-400" onClick={() => setFilter("low")} active={filter === "low"} />
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16 text-white/30">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">Nenhum lead ainda</p>
            <p className="text-white/20 text-xs mt-1">Os leads aparecem aqui quando alguem preenche o formulario</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((lead) => {
              const badge = scoreBadge(lead.score);
              const isOpen = expanded === lead.id;
              return (
                <div
                  key={lead.id}
                  className={`rounded-xl border transition-all cursor-pointer ${
                    isOpen
                      ? "bg-white/[0.04] border-white/10"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
                  }`}
                  onClick={() => setExpanded(isOpen ? null : lead.id)}
                >
                  {/* Row */}
                  <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-white/60">
                      {(lead.nome || "?").charAt(0).toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{lead.nome}</p>
                      <p className="text-xs text-white/40 truncate">{lead.instagram || lead.email}</p>
                    </div>
                    {/* Badge */}
                    <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                      {badge.text}
                    </span>
                    {/* Score */}
                    <span className="text-sm font-bold tabular-nums text-white/60">{lead.score}pts</span>
                    {/* Time */}
                    <span className="text-xs text-white/25 hidden sm:block">{timeAgo(lead.created_at)}</span>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-white/5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <Detail label="Email" value={lead.email} />
                        <Detail label="WhatsApp" value={lead.telefone} />
                        <Detail label="Instagram" value={lead.instagram} />
                        <Detail label="Seguidores" value={lbl("seguidores", lead.seguidores)} />
                        <Detail label="Nicho" value={lead.nicho} />
                        <Detail label="Tempo criando" value={lbl("tempo", lead.tempo)} />
                        <Detail label="Dificuldade" value={lbl("dificuldade", lead.dificuldade)} />
                        <Detail label="Horas/semana" value={lbl("horas", lead.horas)} />
                        <Detail label="Investimento" value={lbl("investimento", lead.investimento)} />
                        <Detail label="Disponibilidade" value={lbl("disponibilidade", lead.disponibilidade)} />
                      </div>
                      {lead.tentativas && (
                        <div className="mt-3">
                          <p className="text-[10px] font-bold tracking-wider uppercase text-white/30 mb-1">O que ja tentou</p>
                          <p className="text-sm text-white/60 leading-relaxed">{lead.tentativas}</p>
                        </div>
                      )}
                      {lead.extra && (
                        <div className="mt-3">
                          <p className="text-[10px] font-bold tracking-wider uppercase text-white/30 mb-1">Observacoes</p>
                          <p className="text-sm text-white/60 leading-relaxed">{lead.extra}</p>
                        </div>
                      )}
                      <p className="text-xs text-white/20 mt-3">
                        {new Date(lead.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, onClick, active }: {
  label: string; value: number; color?: string; onClick: () => void; active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-all ${
        active ? "bg-white/[0.05] border-white/15" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
      }`}
    >
      <p className="text-[10px] font-bold tracking-wider uppercase text-white/30 mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${color || "text-white"}`} style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
    </button>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="py-1">
      <span className="text-white/30 text-xs">{label}: </span>
      <span className="text-white/70 text-xs font-medium">{value}</span>
    </div>
  );
}
