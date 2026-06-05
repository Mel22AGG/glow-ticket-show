import { useState } from "react";
import { Sparkles, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const signInSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Nombre muy corto").max(80),
});

const AuthScreen = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
          return;
        }
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "No se pudo iniciar sesión", description: error, variant: "destructive" });
        } else {
          toast({ title: "¡Bienvenido de vuelta! ✨" });
        }
      } else {
        const parsed = signUpSchema.safeParse({ email, password, fullName });
        if (!parsed.success) {
          toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({ title: "No se pudo registrar", description: error, variant: "destructive" });
        } else {
          toast({ title: "¡Cuenta creada! 🎉", description: "Ya puedes empezar a explorar." });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (<div className="min-h-screen flex flex-col justify-center px-6 gradient-mesh">
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center shadow-xl animate-pulse-glow">
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground">GlowTicket</h1>
        <p className="text-sm text-muted-foreground">Tu pase a los mejores eventos</p>
      </div>

      <div className="flex bg-muted rounded-full p-1 mb-6 animate-fade-in">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              mode === m ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
            }`}
          >
            {m === "signin" ? "Iniciar sesión" : "Registrarse"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in">
        {mode === "signup" && (
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 hover-scale"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "signin" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      <p className="text-[11px] text-muted-foreground text-center mt-6">
        El primer usuario registrado se convierte en <strong>administrador</strong> automáticamente.
      </p>
    </div>
  );
};

export default AuthScreen;
