"use client";

import { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getColorScheme } from "@/lib/colors";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "chart" | "revisionPanel";
  chartData?: any[];
}

const SUBS = {
  frango: { proteina: 31, carbo: 0, gordura: 3.6 },
  carne: { proteina: 26, carbo: 0, gordura: 15 },
  ovo: { proteina: 13, carbo: 1, gordura: 11 },
  ovos: { proteina: 13, carbo: 1, gordura: 11 },
  peixe: { proteina: 22, carbo: 0, gordura: 5 },
  queijo: { proteina: 25, carbo: 2, gordura: 33 },
  banana: { proteina: 1.3, carbo: 23, gordura: 0.3 },
  maca: { proteina: 0.3, carbo: 14, gordura: 0.2 },
  laranja: { proteina: 1, carbo: 21, gordura: 0.2 },
  morango: { proteina: 0.7, carbo: 7.7, gordura: 0.3 },
  arroz: { proteina: 2.7, carbo: 28, gordura: 0.3 },
  batata: { proteina: 2, carbo: 17, gordura: 0.1 },
  mandioca: { proteina: 1.5, carbo: 38, gordura: 0.3 },
  aveia: { proteina: 17, carbo: 66, gordura: 7 },
};

function calcularEquivalencia(base: string, novo: string) {
  const b = SUBS[base];
  const n = SUBS[novo];
  if (!b || !n) return null;

  const fator = b.proteina / n.proteina || 1;
  const qnt = Math.round(100 * fator);

  return {
    quantidade: `${qnt}g de ${novo}`,
    explicacao: `Equivalência calculada pela proteína de referência.`,
  };
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    const v = localStorage.getItem("nfc_voice_enabled");
    return v ? JSON.parse(v) : false;
  });
  const [sexo, setSexo] = useState("masculino");
  const colors = getColorScheme(sexo);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hist = localStorage.getItem("nfc_chat_history");
    const plano = localStorage.getItem("plano");

    if (hist) setMessages(JSON.parse(hist));
    else {
      setMessages([
        {
          role: "assistant",
          content:
            "Olá! 👋 Vamos focar no seu plano nutricional: substituições, ajustes e revisão.",
        },
      ]);
    }

    if (plano) {
      try {
        setSexo(JSON.parse(plano)?.usuario?.sexo || "masculino");
      } catch {}
    }
  }, []);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("nfc_chat_history", JSON.stringify(messages));
  }, [messages]);

  const stripEmojis = (t: string) =>
    t.replace(/[\u{1F300}-\u{1FAFF}]/gu, "");

  const speak = (t: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(stripEmojis(t));
    u.lang = "pt-BR";
    u.rate = 1.0;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  };

  function detectIntent(txt: string) {
    const m = txt.toLowerCase();

    if (m.includes("trocar") && m.includes(" por ")) {
      const partes = m.split(" ");
      const base = partes[1];
      const novo = partes[partes.length - 1];
      const eq = calcularEquivalencia(base, novo);
      if (eq) {
        return `✅ Substituição aplicada:

Use ${eq.quantidade}

${eq.explicacao}

Quer outra troca?`;
      }
    }

    if (m.includes("fruta")) {
      return `✅ Frutas recomendadas:

🍎 Maçã  
🍓 Morango  
🍊 Laranja  
🍌 Banana (ótima pré-treino)

Em qual refeição quer incluir?`;
    }

    if (m.includes("revisar")) return "✅ Vamos revisar seu plano:";

    return null;
  }

  async function simulateTyping(text: string) {
    let parcial = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    for (const char of text) {
      parcial += char;
      setMessages((prev) => {
        const cp = [...prev];
        cp[cp.length - 1].content = parcial + "▌";
        return cp;
      });
      await new Promise((res) => setTimeout(res, 12));
    }

    setMessages((prev) => {
      const cp = [...prev];
      cp[cp.length - 1].content = parcial;
      return cp;
    });

    speak(text);
  }

  const sendMessage = async (txt?: string) => {
    let message = (txt || input.trim()).toLowerCase();
    if (!message || loading) return;

    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: message }]);

    const intent = detectIntent(message);

    if (intent && message !== "revisar") {
      await simulateTyping(intent);
      setLoading(false);
      return;
    }

    if (message.includes("revisar")) {
      await simulateTyping("✅ Escolha abaixo:");
      setMessages((p) => [...p, { role: "assistant", type: "revisionPanel", content: "" }]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Responda APENAS sobre nutrição, cardápios, substituições e treinos. Não desvie. Pergunta: ${message}`,
        }),
      });

      const data = await res.json();
      let resposta = data.message;

      resposta = resposta.replace(/matérias escolares|assuntos gerais|variedade de tópicos/gi, "");

      await simulateTyping(resposta);
    } catch {
      await simulateTyping("⚠ Estou focado apenas na nutrição do seu plano. Peça substituições, ajustes, revisão, frutas ou gráficos.");
    }

    setLoading(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 bg-gradient-to-r ${colors.button} text-white p-4 rounded-full shadow-xl`}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[680px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
          <div className={`bg-gradient-to-r ${colors.primary} text-white p-4 rounded-t-2xl flex justify-between items-center`}>
            <span className="font-bold">NutriFitCoach Assistant</span>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const state = !voiceEnabled;
                  setVoiceEnabled(state);
                  localStorage.setItem("nfc_voice_enabled", JSON.stringify(state));
                }}
              >
                {voiceEnabled ? "🔊" : "🔇"}
              </button>
              <button onClick={() => setIsOpen(false)}>❌</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? \`bg-gradient-to-r \${colors.button} text-white\`
                      : "bg-white text-gray-800 border"
                  }`}
                >
                  {msg.type === "revisionPanel" && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => sendMessage("substituições")} className="review-btn">Revisar Substituições</button>
                      <button onClick={() => sendMessage("pré treino")} className="review-btn">Revisar Pré-treino</button>
                      <button onClick={() => sendMessage("frutas")} className="review-btn">Incluir Frutas</button>
                      <button onClick={() => sendMessage("refeicoes")} className="review-btn">Revisar Refeições</button>
                      <button onClick={() => sendMessage("gráfico")} className="review-btn">Gráfico</button>
                    </div>
                  )}

                  {msg.type === "chart" && msg.chartData && (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={msg.chartData} dataKey="value" outerRadius={70}>
                          <Cell fill="#10b981" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {!msg.type && <p>{msg.content}</p>}
                </div>
              </div>
            ))}
            <div ref={msgEndRef} />
          </div>

          <div className="p-4 flex gap-2 border-t">
            <input
              className="flex-1 border px-3 py-2 rounded-xl"
              placeholder="Digite aqui..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={() => sendMessage()}
              className={`bg-gradient-to-r ${colors.button} text-white px-5 py-2 rounded-xl`}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
