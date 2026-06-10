import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { events } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string; ts: number };

const quickReplies = [
  "¿Qué hay esta semana?",
  "Eventos baratos",
  "Recomiéndame un concierto",
  "¿Cómo compro?",
];

const eventsContext = events
  .slice(0, 15)
  .map((e) => `- ${e.title} | ${e.category} | ${e.city} | $${e.price} | ${e.date}`)
  .join("\n");

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy **Glow Assistant** ✨\nTu guía personal para descubrir los mejores eventos. ¿En qué te ayudo?",
      ts: Date.now(),
    },
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMsg: Msg = { role: "user", content: trimmed, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("chatbot-service", {
        body: { messages: history, eventsContext },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "El asistente no respondió", description: data.error, variant: "destructive" });
        return;
      }

      const reply = data?.reply ?? "Lo siento, no pude generar una respuesta.";
      setMessages((m) => [...m, { role: "assistant", content: reply, ts: Date.now() }]);
    } catch (e) {
      toast({
        title: "Error de conexión",
        description: e instanceof Error ? e.message : "Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating bubble — sits above BottomNav (z-50) without covering its tabs */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir asistente de IA"
        className="fixed right-4 z-50 group"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
      >
        <div className="absolute inset-0 rounded-full gradient-primary blur-lg opacity-60 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
        <div className="relative w-12 h-12 rounded-full gradient-primary text-primary-foreground shadow-xl flex items-center justify-center hover-scale">
          <Sparkles className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-secondary border-2 border-background" />
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-foreground/50 backdrop-blur-md animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-[85vh] sm:h-[640px] glass-strong rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden border border-border/50 shadow-2xl animate-slide-up"
          >
            {/* Header */}
            <div className="relative px-4 py-3 gradient-primary overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
              </div>
              <div className="relative flex items-center justify-between text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Glow Assistant</p>
                    <p className="text-[10px] opacity-90 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      IA en línea
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar asistente"
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-muted/20 to-background"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col animate-fade-in ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      m.role === "user"
                        ? "gradient-primary text-primary-foreground rounded-br-md"
                        : "bg-card text-foreground rounded-bl-md border border-border/50"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-current prose-headings:text-current [&_*]:text-inherit">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 px-2">
                    {formatTime(m.ts)}
                  </span>
                </div>
              ))}
              {typing && (
                <div className="flex items-start animate-fade-in">
                  <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick replies */}
            {messages.length <= 2 && (
              <div className="px-3 pt-2 pb-1 flex gap-2 overflow-x-auto scrollbar-hide bg-background/80 backdrop-blur-sm border-t border-border/50">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={typing}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-primary/10 text-xs text-primary font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
                className="p-3 mb-4 flex gap-2 border-t border-border/50 bg-background/90 backdrop-blur-sm safe-bottom"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregúntame lo que quieras..."
                aria-label="Mensaje al asistente"
                disabled={typing}
                className="flex-1 px-4 py-2.5 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
              <button
                type="submit"
                aria-label="Enviar mensaje"
                disabled={!input.trim() || typing}
                className="w-11 h-11 rounded-full gradient-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover-scale shadow-lg"
              >
                {typing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
