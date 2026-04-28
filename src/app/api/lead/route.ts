import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      nome, email, telefone, instagram, seguidores,
      nicho, tempo, dificuldade, tentativas,
      investimento, horas, disponibilidade, extra, score,
    } = body;

    if (!nome || !email || !telefone) {
      return NextResponse.json({ error: "Campos obrigatorios faltando." }, { status: 400 });
    }

    const row = {
      nome: String(nome).trim(),
      email: String(email).trim().toLowerCase(),
      telefone: String(telefone).trim(),
      instagram: instagram ? String(instagram).trim() : null,
      seguidores: seguidores || null,
      nicho: nicho ? String(nicho).trim() : null,
      tempo: tempo || null,
      dificuldade: dificuldade || null,
      tentativas: tentativas ? String(tentativas).trim() : null,
      investimento: investimento || null,
      horas: horas || null,
      disponibilidade: disponibilidade || null,
      extra: extra ? String(extra).trim() : null,
      score: typeof score === "number" ? score : 0,
    };

    // Salva no Supabase
    const { data, error } = await supabase
      .from("mentoria_leads")
      .insert([row])
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Erro ao salvar candidatura." }, { status: 500 });
    }

    // Envia webhook pro n8n (nao bloqueia a resposta)
    if (WEBHOOK_URL) {
      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      }).catch((err) => console.error("Webhook error:", err));
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
