import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(mode === "signin" ? "Welcome back!" : "Account created!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,hsl(225_80%_50%/0.15),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,hsl(24_100%_55%/0.1),transparent_70%)] blur-3xl" />
        <div className="relative text-center px-12 max-w-md">
          <div className="h-20 w-20 rounded-2xl mx-auto mb-6 gradient-accent flex items-center justify-center text-3xl font-bold text-accent-foreground">D</div>
          <h2 className="font-brand text-3xl text-foreground tracking-[0.04em] mb-2">DukanOs</h2>
          <p className="text-sm text-muted-foreground">Business OS for every Indian shop</p>
          <p className="text-xs text-muted-foreground/60 mt-4">
            Bill in 30 seconds. Send on WhatsApp. Get paid. Built for kirana, garage, repair, salon — every dukan.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="h-14 w-14 rounded-xl mx-auto mb-3 gradient-accent flex items-center justify-center text-xl font-bold text-accent-foreground">D</div>
            <h1 className="font-brand text-xl text-foreground tracking-[0.04em]">DukanOs</h1>
          </div>

          <div className="glass-strong rounded-2xl p-6 space-y-5">
            <div className="flex bg-card/50 rounded-lg p-1 text-xs font-semibold">
              <button onClick={() => setMode("signin")}
                className={`flex-1 py-2 rounded-md transition-all ${mode === "signin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                Sign in
              </button>
              <button onClick={() => setMode("signup")}
                className={`flex-1 py-2 rounded-md transition-all ${mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                Sign up
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === "signin" ? "Sign in to manage your dukan." : "Start billing in under a minute."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" placeholder="you@business.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <button type="submit" disabled={loading || !email || !password}
                className="w-full gradient-accent text-accent-foreground py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin" />
                ) : (
                  <>{mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
            <p className="text-[10px] text-center text-muted-foreground/60">
              By continuing you agree that DukanOs may store your business data securely.
            </p>
          </div>

          <button onClick={() => navigate("/")}
            className="w-full text-center text-xs text-muted-foreground/60 mt-4 hover:text-muted-foreground transition-colors">
            ← Back to home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
