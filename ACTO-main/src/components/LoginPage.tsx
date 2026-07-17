import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [selectedConnections, setSelectedConnections] = useState<string[]>(["gmail", "calendar"]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const root = document.documentElement;
    if (savedTheme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, []);

  // ── Google Login ──────────────────────────────────────────────────────────
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const data = await res.json();
        const user: GoogleUser = {
          name: data.name || "",
          email: data.email || "",
          picture: data.picture || "",
        };
        setGoogleUser(user);
        setName(user.name);
      } catch {
        alert("Failed to fetch Google profile. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      alert("Google Sign-In was cancelled or failed.");
    },
  });

  const handleGoogleSignOut = () => {
    setGoogleUser(null);
    setName("");
  };

  const toggleConnection = (id: string) => {
    if (selectedConnections.includes(id)) {
      setSelectedConnections(selectedConnections.filter(c => c !== id));
    } else {
      setSelectedConnections([...selectedConnections, id]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: googleUser?.email }),
      }).finally(() => {
        navigate("/dashboard");
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F1F0FF] flex items-center justify-center p-6 relative font-sans overflow-hidden bg-grid-blueprint">

      {/* Background Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => {
          const size = 3 + (i % 3);
          const left = (i * 7.3) % 100;
          const speed = 7 + (i % 4);
          const delay = (i % 3) * 1.8;
          const colors = ["#FFFFFF", "#14F1D9", "#7C5CFC"];
          const color = colors[i % colors.length];
          const glowColor =
            color === "#FFFFFF"
              ? "rgba(255, 255, 255, 0.6)"
              : color === "#14F1D9"
              ? "rgba(20, 241, 217, 0.6)"
              : "rgba(124, 92, 252, 0.6)";
          return (
            <div
              key={i}
              className="custom-particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: "100%",
                backgroundColor: color,
                boxShadow: `0 0 10px ${glowColor}, 0 0 4px ${glowColor}`,
                animationDuration: `${speed}s`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* Ambient Orbs */}
      <div className="custom-orb left-1/3 top-1/4 -translate-x-1/2 pointer-events-none z-0" />
      <div className="custom-orb right-1/4 bottom-1/3 translate-x-1/2 pointer-events-none z-0 opacity-40 animate-[pulse_6s_infinite]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl shadow-2xl relative z-10"
      >
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-xl font-display font-bold">
            A<span className="text-[#14F1D9]">⚡</span>CTO
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? "w-6 bg-[#7C5CFC]" : "w-2 bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Identity ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="text-center">
                <span className="text-5xl mb-4 block">👋</span>
                <h2 className="text-3xl font-display font-bold mb-2">Welcome to ACTO</h2>
                <p className="text-sm text-[#9CA3AF]">
                  Let's set up your personal AI Chief Task Officer environment.
                </p>
              </div>

              {/* Google User Strip — shown after sign-in */}
              <AnimatePresence>
                {googleUser && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#14F1D9]/10 border border-[#14F1D9]/30"
                  >
                    <img
                      src={googleUser.picture}
                      alt={googleUser.name}
                      className="w-10 h-10 rounded-full border-2 border-[#14F1D9]/40 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#F1F0FF] truncate">{googleUser.name}</div>
                      <div className="text-xs text-[#9CA3AF] truncate">{googleUser.email}</div>
                    </div>
                    <button
                      onClick={handleGoogleSignOut}
                      className="text-xs text-[#9CA3AF] hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5 flex-shrink-0"
                      title="Switch account"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google Sign-In Button — hidden after sign-in */}
              {!googleUser && (
                <button
                  onClick={() => { setGoogleLoading(true); loginWithGoogle(); }}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white hover:bg-gray-50 text-[#3c4043] font-semibold text-sm transition-all duration-300 active:scale-95 shadow-lg shadow-black/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#7C5CFC" strokeWidth="4" />
                      <path className="opacity-75" fill="#7C5CFC" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 48 48" width="20" height="20" className="flex-shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  )}
                  {googleLoading ? "Signing in…" : "Continue with Google"}
                </button>
              )}

              {/* OR Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-[#9CA3AF] font-mono uppercase tracking-wider">
                  {googleUser ? "or edit name" : "or enter manually"}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs text-[#9CA3AF] uppercase tracking-wider font-mono">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun Mehta"
                  className="w-full px-4 py-3 rounded-2xl bg-[#0A0A0F] border border-white/10 text-[#F1F0FF] focus:outline-none focus:border-[#7C5CFC] placeholder:text-white/20 transition-colors"
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full py-4 bg-[#7C5CFC] hover:bg-[#A78BFA] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-300 active:scale-95 shadow-xl shadow-[#7C5CFC]/10"
              >
                Continue 🚀
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Connect Feeds ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <span className="text-5xl mb-4 block">🔌</span>
                <h2 className="text-3xl font-display font-bold mb-2">Connect Your Feeds</h2>
                <p className="text-sm text-[#9CA3AF]">
                  ACTO monitors your emails and calendar events to discover deadlines.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: "gmail", name: "Gmail Integration", desc: "Scan inbox for deadline updates", emoji: "📧" },
                  { id: "calendar", name: "Google Calendar", desc: "Read upcoming syncs & sync agendas", emoji: "📅" },
                  { id: "tasks", name: "Google Tasks", desc: "Keep task lists up-to-date", emoji: "📋" },
                ].map((conn) => (
                  <div
                    key={conn.id}
                    onClick={() => toggleConnection(conn.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between ${
                      selectedConnections.includes(conn.id)
                        ? "bg-[#7C5CFC]/10 border-[#7C5CFC]"
                        : "bg-[#0A0A0F] border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{conn.emoji}</span>
                      <div className="text-left">
                        <div className="text-sm font-semibold">{conn.name}</div>
                        <div className="text-xs text-[#9CA3AF]">{conn.desc}</div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        selectedConnections.includes(conn.id)
                          ? "bg-[#14F1D9] border-[#14F1D9] text-[#0A0A0F]"
                          : "border-white/20"
                      }`}
                    >
                      {selectedConnections.includes(conn.id) && "✓"}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 bg-[#7C5CFC] hover:bg-[#A78BFA] text-white font-semibold rounded-2xl transition-all duration-300 active:scale-95 shadow-xl shadow-[#7C5CFC]/10"
              >
                Verify Connections 🔐
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: Setup Complete ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <span className="text-5xl mb-4 block">⚡</span>
                <h2 className="text-3xl font-display font-bold mb-2">Setup Complete</h2>
                <p className="text-sm text-[#9CA3AF] mb-6">
                  Your AI Chief Task Officer is ready to deploy and monitor deadlines.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0A0A0F] border border-white/5 space-y-3 text-left">
                {googleUser && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#14F1D9]">✓</span>
                    <span className="text-sm font-mono text-[#9CA3AF]">Google Account: {googleUser.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[#14F1D9]">✓</span>
                  <span className="text-sm font-mono text-[#9CA3AF]">User Profile: {name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#14F1D9]">✓</span>
                  <span className="text-sm font-mono text-[#9CA3AF]">Google OAuth Scope: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#14F1D9]">✓</span>
                  <span className="text-sm font-mono text-[#9CA3AF]">AI Tone: Balanced-Professional</span>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 bg-gradient-to-r from-[#7C5CFC] to-[#14F1D9] hover:from-[#A78BFA] hover:to-[#14F1D9] text-[#0A0A0F] font-bold rounded-2xl transition-all duration-300 active:scale-95 shadow-xl"
              >
                Enter Dashboard 🚀
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
