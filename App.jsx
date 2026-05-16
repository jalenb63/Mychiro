import { useState, useRef, useEffect } from "react";

const C = {
  bg: "#0A0E1A", surface: "#111827", card: "#161D2E", cardHover: "#1C2540",
  border: "#1E2D45", borderLight: "#253350", accent: "#3B82F6",
  accentGlow: "rgba(59,130,246,0.15)", accentDark: "#1D4ED8", teal: "#14B8A6",
  tealGlow: "rgba(20,184,166,0.15)", gold: "#F59E0B", goldGlow: "rgba(245,158,11,0.15)",
  coral: "#F43F5E", coralGlow: "rgba(244,63,94,0.12)", white: "#FFFFFF",
  text: "#E8EEFF", textSub: "#8899BB", textMuted: "#4A5A7A",
  green: "#10B981", greenGlow: "rgba(16,185,129,0.15)",const PROVIDERS = [
  { id: 1, name: "Dr. Alicia Monroe, DC", practice: "Align Spine & Wellness", specialties: ["Sciatica", "Disc Herniation", "Lower Back Pain"], distance: "1.2 mi", rating: 4.9, reviews: 312, availability: "Today 3pm", sponsored: true, avatar: "AM", color: C.accent },
  { id: 2, name: "Dr. Marcus Webb, DC CCSP", practice: "Webb Performance & Spine", specialties: ["Sports Injuries", "Posture", "Neck Pain", "Kyphosis"], distance: "2.7 mi", rating: 4.8, reviews: 198, availability: "Tomorrow 9am", sponsored: true, avatar: "MW", color: C.teal },
  { id: 3, name: "Dr. Priya Nair, DC", practice: "Nair Family Chiropractic", specialties: ["Lower Back Pain", "Sciatica", "Pediatric"], distance: "3.1 mi", rating: 4.7, reviews: 143, availability: "Thu 11am", sponsored: false, avatar: "PN", color: C.gold },
  { id: 4, name: "Dr. James Okafor, DC", practice: "Okafor Chiropractic Center", specialties: ["Disc Herniation", "Scoliosis", "Sciatica"], distance: "4.5 mi", rating: 4.6, reviews: 89, availability: "Fri 2pm", sponsored: false, avatar: "JO", color: "#8B5CF6" },
];

const PAIN_AREAS = ["Neck", "Upper Back", "Mid Back", "Lower Back", "Left Hip", "Right Hip", "Left Leg", "Right Leg", "Left Shoulder", "Right Shoulder", "Head"];
const QUICK_QS = ["Lower back pain every morning", "Shooting pain down my leg", "Stiff neck and crackling", "Bad posture concerns", "When to see a chiropractor?"];
const todayStr = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const timeNow = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });const SYSTEM_PROMPT = `You are MyChiro, a knowledgeable AI spinal health guide.
1. EDUCATE patients about spinal symptoms in plain, compassionate language.
2. TRIAGE: conservative care, chiropractic evaluation, or URGENT (red flags: bladder/bowel loss, trauma, progressive neuro loss, saddle anesthesia, fever with back pain).
3. Warm, concise, 3-4 short paragraphs. End with a clear action step.
4. NEVER diagnose. Say "this could be..." or "symptoms like yours often suggest..."
5. RED FLAGS: respond with urgency, tell them to seek emergency care immediately.
Tone: trusted health professional friend. Warm but precise.`;

async function askAI(messages) {
  const key = sessionStorage.getItem("mc_key") || "";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "x-api-key": key,
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });
  const raw = await res.text();
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error("Non-JSON response"); }
  if (!res.ok) throw new Error(data?.error?.message || `API error ${res.status}`);
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error("Empty response");
  return text;
}

function detectUrgency(t) {
  const l = t.toLowerCase();
  if (l.includes("emergency") || l.includes("911") || l.includes("bladder") || l.includes("bowel") || l.includes("immediately")) return "urgent";
  if (l.includes("chiropractor") || l.includes("appointment") || l.includes("evaluation")) return "chiro";
  return null;
}

const painColor = (n) => n <= 3 ? C.green : n <= 6 ? C.gold : C.coral;

};function SpineLogo({ size = 28 }) {
  const segs = 5;
  const sw = size * 0.45;
  const sh = size * 0.13;
  const gap = size * 0.07;
  const total = segs * sh + (segs - 1) * gap;
  const sx = (size - sw) / 2;
  const sy = (size - total) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {Array.from({ length: segs }).map((_, i) => (
        <rect key={i} x={sx} y={sy + i * (sh + gap)} width={sw} height={sh} rx={sh / 2}
          fill="url(#spineGrad)" opacity={1 - i * 0.1} />
      ))}
      <defs>
        <linearGradient id="spineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.accent} />
          <stop offset="100%" stopColor={C.teal} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Dots() {
  return (
    <div style={{ display: "flex", gap: 6, padding: "6px 2px", alignItems: "center" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, animation: `bop 1.3s ease-in-out ${i * 0.18}s infinite`, opacity: 0.8 }} />
      ))}
    </div>
  );
}

function Av({ initials, color, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: color + "22", border: `1.5px solid ${color}55`, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: size * 0.32, fontWeight: 700, flexShrink: 0, letterSpacing: 0.5 }}>
      {initials}
    </div>
  );
}

function Stars({ r }) {
  return (
    <span style={{ fontSize: 11, letterSpacing: 1 }}>
      <span style={{ color: C.gold }}>{"★".repeat(Math.floor(r))}</span>
      <span style={{ color: C.border }}>{"★".repeat(5 - Math.floor(r))}</span>
    </span>
  );
}

function GlowBtn({ children, onClick, disabled, variant = "primary", small, full, style: sx = {} }) {
  const variants = {
    primary: { background: `linear-gradient(135deg, ${C.accent}, ${C.teal})`, color: "#fff", boxShadow: `0 4px 24px rgba(59,130,246,0.35)` },
    ghost: { background: "transparent", color: C.textSub, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.coral, border: `1px solid ${C.coral}33` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ border: "none", borderRadius: 12, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: small ? 12 : 14, cursor: disabled ? "not-allowed" : "pointer", padding: small ? "7px 14px" : "12px 22px", opacity: disabled ? 0.4 : 1, width: full ? "100%" : undefined, transition: "all 0.2s", letterSpacing: 0.2, ...variants[variant], ...sx }}>
      {children}
    </button>
  );
}

function Tag({ children, active }) {
  return (
    <span style={{ background: active ? C.accentGlow : C.surface, color: active ? C.accent : C.textMuted, border: `1px solid ${active ? C.accent + "44" : C.border}`, borderRadius: 20, padding: "3px 11px", fontSize: 11, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, letterSpacing: 0.2 }}>
      {children}
    </span>
  );
}

function GlassCard({ children, style: sx = {}, glow }) {
  return (
    <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: glow ? `0 0 40px ${glow}` : "0 2px 20px rgba(0,0,0,0.3)", ...sx }}>
      {children}
    </div>
  );
}

function SectionHead({ children }) {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 18, letterSpacing: -0.3 }}>
      {children}
    </div>
  );
}
function SetupScreen({ onDone }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const save = () => {
    if (!key.trim().startsWith("sk-ant")) {
      setErr("Should start with sk-ant-");
      return;
    }
    sessionStorage.setItem("mc_key", key.trim());
    onDone();
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28 }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <SpineLogo size={32} />
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>MyChiro</span>
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: C.textMuted, marginBottom: 36, letterSpacing: 2, textTransform: "uppercase" }}>Owner Setup</div>
      <GlassCard style={{ width: "100%", maxWidth: 360, padding: 28 }} glow={C.accentGlow}>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 600, color: C.textSub, marginBottom: 10 }}>Claude API Key</div>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input type={show ? "text" : "password"} value={key} onChange={e => { setKey(e.target.value); setErr(""); }} placeholder="sk-ant-api03-..." style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 12, border: `1.5px solid ${err ? C.coral : C.borderLight}`, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.text, background: C.surface, outline: "none", boxSizing: "border-box" }} />
          <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: C.textMuted }}>{show ? "🙈" : "👁️"}</button>
        </div>
        {err && <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: C.coral, marginBottom: 12 }}>⚠️ {err}</div>}
        <GlowBtn full onClick={save} disabled={!key.trim()} style={{ padding: "14px 0", fontSize: 15, borderRadius: 14 }}>Activate MyChiro →</GlowBtn>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.textMuted, textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>Patients never see this screen.<br />Get your key at console.anthropic.com</div>
      </GlassCard>
    </div>
  );
}

function Welcome({ onEnter }) {
  const [name, setName] = useState("");
  const [step, setStep] = useState("home");

  if (step === "home") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20%", left: "-20%", width: "140%", height: "140%", background: "radial-gradient(ellipse at 40% 30%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(20,184,166,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <SpineLogo size={44} />
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 38, fontWeight: 800, color: C.text, letterSpacing: -1 }}>MyChiro</span>
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: C.textSub, textAlign: "center", marginBottom: 52, lineHeight: 1.7, maxWidth: 280 }}>
        Your intelligent spinal health guide.<br />Understand your pain. Find expert care.
      </div>
      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <GlowBtn full onClick={() => setStep("patient")} style={{ padding: "16px 0", fontSize: 16, borderRadius: 16 }}>Get Started</GlowBtn>
        <GlowBtn full variant="ghost" onClick={() => onEnter({ name: "Provider", role: "provider" })} style={{ padding: "16px 0", fontSize: 15, borderRadius: 16, border: `1px solid ${C.border}` }}>I'm a Chiropractor →</GlowBtn>
      </div>
      <div style={{ position: "absolute", bottom: 28, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.textMuted, textAlign: "center" }}>Not a substitute for professional medical advice</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 24, display: "flex", flexDirection: "column" }}>
      <button onClick={() => setStep("home")} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSub, alignSelf: "flex-start", marginBottom: 28, fontSize: 22 }}>←</button>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: -0.5 }}>What's your name?</div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.textSub, marginBottom: 32 }}>So I can personalize your experience.</div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="First name" style={{ width: "100%", padding: "16px 18px", borderRadius: 14, border: `1.5px solid ${C.borderLight}`, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 16, color: C.text, background: C.surface, outline: "none", boxSizing: "border-box", marginBottom: 24 }} />
      <GlowBtn full onClick={() => onEnter({ name: name.trim() || "there", role: "patient" })} style={{ padding: "16px 0", fontSize: 16, borderRadius: 16 }}>Continue →</GlowBtn>
    </div>function Chat({ userName, onNav, setLastTopic }) {
  const [msgs, setMsgs] = useState([{
    role: "assistant",
    content: `Hi ${userName}! I'm your MyChiro AI guide. Tell me what's going on — back pain, neck stiffness, posture issues, or anything spine-related. I'll help you understand it and figure out your next step. 💙`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [urgency, setUrgency] = useState(null);
  const [err, setErr] = useState("");
  const bottom = useRef(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const send = async (text) => {
    const t = text.trim();
    if (!t || loading) return;
    setInput(""); setLastTopic(t); setErr(""); setUrgency(null);
    const next = [...msgs, { role: "user", content: t }];
    setMsgs(next);
    setLoading(true);
    try {
      const reply = await askAI(next.map(m => ({ role: m.role, content: m.content })));
      setMsgs([...next, { role: "assistant", content: reply }]);
      setUrgency(detectUrgency(reply));
    } catch(e) {
      setErr(e.message);
      setMsgs([...next, { role: "assistant", content: "I'm having trouble connecting right now. Please try again." }]);
    }
    setLoading(false);
  };

  const banner = urgency === "urgent"
    ? { bg: C.coralGlow, border: C.coral, icon: "🚨", msg: "This may need urgent medical attention. Please seek emergency care immediately.", btn: false }
    : urgency === "chiro"
    ? { bg: C.accentGlow, border: C.accent, icon: "🩺", msg: "A chiropractic evaluation is recommended.", btn: true }
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 8px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16, animation: "fadeUp 0.3s ease" }}>
            {m.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: 10, background: C.accentGlow, border: `1px solid ${C.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0, marginTop: 2 }}>
                <SpineLogo size={18} />
              </div>
            )}
            <div style={{ maxWidth: "80%", padding: "13px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? `linear-gradient(135deg, ${C.accent}, ${C.teal})` : C.card, color: C.text, fontSize: 14, lineHeight: 1.7, border: m.role === "assistant" ? `1px solid ${C.border}` : "none", whiteSpace: "pre-wrap", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 400, boxShadow: m.role === "user" ? "0 4px 20px rgba(59,130,246,0.25)" : "none" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: C.accentGlow, border: `1px solid ${C.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0 }}>
              <SpineLogo size={18} />
            </div>
            <div style={{ padding: "13px 16px", background: C.card, borderRadius: "18px 18px 18px 4px", border: `1px solid ${C.border}` }}>
              <Dots />
            </div>
          </div>
        )}
        {banner && (
          <div style={{ background: banner.bg, border: `1px solid ${banner.border}44`, borderRadius: 14, padding: "13px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, animation: "fadeUp 0.3s ease" }}>
            <span style={{ fontSize: 18 }}>{banner.icon}</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: C.text, fontWeight: 500, flex: 1 }}>{banner.msg}</span>
            {banner.btn && <GlowBtn small onClick={() => onNav("find")}>Find Care →</GlowBtn>}
          </div>
        )}
        {err && <div style={{ background: C.coralGlow, border: `1px solid ${C.coral}44`, borderRadius: 10, padding: "8px 14px", marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.coral }}>⚠️ {err}</div>}
        <div ref={bottom} />
      </div>
      {msgs.length <= 1 && (
        <div style={{ padding: "0 16px 12px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
            {QUICK_QS.map(q => (
              <button key={q} onClick={() => send(q)} style={{ whiteSpace: "nowrap", background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "9px 16px", fontSize: 12, fontFamily: "'Plus Jakarta Sans',sans-serif", color: C.textSub, cursor: "pointer", fontWeight: 500 }}>{q}</button>
            ))}
          </div>
        </div>
      )}
      <div style={{ padding: "10px 16px 18px", background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: C.card, borderRadius: 16, padding: "12px 14px", border: `1px solid ${C.borderLight}` }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Describe your symptoms..." rows={1} style={{ flex: 1, background: "transparent", border: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.text, lineHeight: 1.5, maxHeight: 100, overflowY: "auto", resize: "none", outline: "none" }} />
          <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{ width: 36, height: 36, borderRadius: 10, background: !input.trim() || loading ? C.border : `linear-gradient(135deg,${C.accent},${C.teal})`, border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>↑</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: C.textMuted, marginTop: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Not a substitute for professional medical advice</div>
      </div>
    </div>
  );
}

  );
}
function Find({ onBook, lastTopic }) {
  const [booking, setBooking] = useState(null);
  const [search, setSearch] = useState("");
  const [hov, setHov] = useState(null);
  if (booking) return <Booking provider={booking} onBack={() => setBooking(null)} onConfirm={slot => { onBook({ provider: booking, slot }); setBooking(null); }} />;

  const filtered = PROVIDERS.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.specialties.some(s => s.toLowerCase().includes(search.toLowerCase())));

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%", background: C.bg }}>
      <SectionHead>Find a Chiropractor</SectionHead>
      <div style={{ display: "flex", gap: 10, background: C.card, borderRadius: 14, padding: "11px 14px", border: `1px solid ${C.border}`, marginBottom: 16, alignItems: "center" }}>
        <span style={{ fontSize: 16, color: C.textMuted }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Condition, specialty, or name..." style={{ flex: 1, border: "none", background: "transparent", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.text, outline: "none" }} />
      </div>
      {lastTopic && (
        <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: C.accent, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          ✦ Matching for: "{lastTopic}"
        </div>
      )}
      {filtered.map(p => {
        const match = lastTopic && p.specialties.some(s => lastTopic.toLowerCase().includes(s.toLowerCase().split(" ")[0]));
        return (
          <div key={p.id} onMouseEnter={() => setHov(p.id)} onMouseLeave={() => setHov(null)}
            style={{ background: hov === p.id ? C.cardHover : C.card, border: `1px solid ${p.sponsored ? C.gold + "44" : C.border}`, borderRadius: 20, padding: "18px 18px", marginBottom: 14, position: "relative", transform: hov === p.id ? "translateY(-2px)" : "none", boxShadow: hov === p.id ? "0 12px 40px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.2)", transition: "all 0.22s" }}>
            {p.sponsored && (
              <div style={{ position: "absolute", top: 14, right: 16, background: C.goldGlow, border: `1px solid ${C.gold}55`, color: C.gold, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, padding: "3px 10px", borderRadius: 20, fontFamily: "'Plus Jakarta Sans',sans-serif", textTransform: "uppercase" }}>Featured</div>
            )}
            <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              <Av initials={p.avatar} color={p.color} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 8 }}>{p.practice}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {p.specialties.map(s => <Tag key={s} active={match && lastTopic.toLowerCase().includes(s.toLowerCase().split(" ")[0])}>{s}</Tag>)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Stars r={p.rating} /><span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: C.textMuted }}>{p.rating} ({p.reviews})</span></div>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: C.textMuted }}>📍 {p.distance}</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: C.green, fontWeight: 600 }}>● {p.availability}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <GlowBtn onClick={() => setBooking(p)} style={{ flex: 1, borderRadius: 12 }}>Book Appointment</GlowBtn>
              <GlowBtn variant="ghost" small style={{ borderRadius: 12 }}>📞 Call</GlowBtn>
            </div>
          </div>
        );
      })}
      <GlassCard style={{ background: `linear-gradient(135deg, ${C.accent}18, ${C.teal}18)`, border: `1px solid ${C.accent}33`, padding: "22px 20px", marginTop: 4 }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 6 }}>Are you a chiropractor?</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: C.textSub, lineHeight: 1.6, marginBottom: 16 }}>Get featured to patients searching for your specialties.</div>
        <GlowBtn style={{ borderRadius: 12 }}>Get Featured →</GlowBtn>
      </GlassCard>
    </div>
  );
}

function Booking({ provider, onBack, onConfirm }) {
  const days = ["Mon May 19","Tue May 20","Wed May 21","Thu May 22","Fri May 23"];
  const times = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"];
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [done, setDone] = useState(false);

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32, textAlign: "center", background: C.bg }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: C.greenGlow, border: `1px solid ${C.green}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 20 }}>✓</div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8 }}>Appointment Booked!</div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.textSub, marginBottom: 6 }}>{provider.name}</div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: C.accent, fontWeight: 700, marginBottom: 36 }}>{day} · {time}</div>
      <GlowBtn onClick={() => onConfirm({ day, time })}>Back to Providers</GlowBtn>
    </div>
  );

  return (
    <div style={{ overflowY: "auto", height: "100%", padding: 16, background: C.bg }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.textSub, marginBottom: 18 }}>←</button>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 24 }}>
        <Av initials={provider.avatar} color={provider.color} size={52} />
        <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 16, fontWeight: 700, color: C.text }}>{provider.name}</div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: C.textMuted }}>{provider.practice}</div></div>
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Select a Day</div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 24, paddingBottom: 4 }}>
        {days.map(d => <button key={d} onClick={() => setDay(d)} style={{ whiteSpace: "nowrap", padding: "11px 16px", borderRadius: 12, border: `1.5px solid ${day===d ? C.accent : C.border}`, background: day===d ? C.accentGlow : C.card, color: day===d ? C.accent : C.textSub, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{d}</button>)}
      </div>
      {day && <>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Select a Time</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 24 }}>
          {times.map(t => <button key={t} onClick={() => setTime(t)} style={{ padding: "11px 0", borderRadius: 12, border: `1.5px solid ${time===t ? C.accent : C.border}`, background: time===t ? C.accentGlow : C.card, color: time===t ? C.accent : C.textSub, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{t}</button>)}
        </div>
      </>}
      {time && <GlowBtn full onClick={() => setDone(true)} style={{ padding: "15px 0", fontSize: 15, borderRadius: 16 }}>Confirm Appointment</GlowBtn>}
    </div>
  );
}
function Journal() {
  const [entries, setEntries] = useState([]);
  const [adding, setAdding] = useState(false);
  const [area, setArea] = useState("");
  const [pain, setPain] = useState(5);
  const [notes, setNotes] = useState("");

  const save = () => {
    if (!area) return;
    setEntries(e => [{ id: Date.now(), area, pain, notes, date: todayStr(), time: timeNow() }, ...e]);
    setArea(""); setPain(5); setNotes(""); setAdding(false);
  };

  return (
    <div style={{ overflowY: "auto", height: "100%", padding: 16, background: C.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionHead>Symptom Journal</SectionHead>
        <GlowBtn small onClick={() => setAdding(a => !a)}>{adding ? "Cancel" : "+ Log"}</GlowBtn>
      </div>
      {adding && (
        <GlassCard style={{ padding: 20, marginBottom: 18, border: `1px solid ${C.accent}33` }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Pain Area</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {PAIN_AREAS.map(a => <button key={a} onClick={() => setArea(a)} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${area===a ? C.accent : C.border}`, background: area===a ? C.accentGlow : C.surface, color: area===a ? C.accent : C.textSub, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{a}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Pain Level: <span style={{ color: painColor(pain) }}>{pain}/10</span></div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <button key={n} onClick={() => setPain(n)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: pain===n ? painColor(n) : C.surface, color: pain===n ? "#fff" : C.textMuted, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{n}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What triggered it? What helps?" rows={3} style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1px solid ${C.border}`, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.text, background: C.surface, outline: "none", resize: "none", boxSizing: "border-box" }} />
          </div>
          <GlowBtn full onClick={save}>Save Entry</GlowBtn>
        </GlassCard>
      )}
      {entries.length === 0 && !adding && (
        <div style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.4 }}>📓</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>No entries yet</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.textMuted }}>Log symptoms to track patterns over time.</div>
        </div>
      )}
      {entries.map(e => (
        <GlassCard key={e.id} style={{ padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>{e.area}</div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.textMuted, marginTop: 2 }}>{e.date} · {e.time}</div></div>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: painColor(e.pain) + "22", border: `1px solid ${painColor(e.pain)}44`, display: "flex", alignItems: "center", justifyContent: "center", color: painColor(e.pain), fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 16 }}>{e.pain}</div>
          </div>
          {e.notes && <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{e.notes}</div>}
        </GlassCard>
      ))}
    </div>
  );
}

function Posture() {
  const [checks, setChecks] = useState([]);
  const [checking, setChecking] = useState(false);
  const [scores, setScores] = useState({});
  const items = [
    { id: "ears", label: "Ears over shoulders", icon: "👂" },
    { id: "screen", label: "Screen at eye level", icon: "🖥️" },
    { id: "feet", label: "Feet flat on floor", icon: "🦶" },
    { id: "lumbar", label: "Lumbar support active", icon: "🪑" },
    { id: "shoulders", label: "Shoulders relaxed", icon: "🧘" },
    { id: "chin", label: "No forward head posture", icon: "🙅" },
  ];
  const saveCheck = () => {
    const pct = Math.round((Object.values(scores).filter(Boolean).length / items.length) * 100);
    setChecks(c => [{ id: Date.now(), date: todayStr(), time: timeNow(), pct }, ...c]);
    setScores({}); setChecking(false);
  };
  const sc = (p) => p >= 80 ? C.green : p >= 60 ? C.gold : C.coral;
  const avg = checks.length ? Math.round(checks.reduce((s,c) => s+c.pct, 0) / checks.length) : 0;

  return (
    <div style={{ overflowY: "auto", height: "100%", padding: 16, background: C.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionHead>Posture Tracker</SectionHead>
        <GlowBtn small onClick={() => setChecking(c => !c)}>{checking ? "Cancel" : "Check Now"}</GlowBtn>
      </div>
      {checking && (
        <GlassCard style={{ padding: 20, marginBottom: 18, border: `1px solid ${C.accent}33` }}>
          {items.map(item => (
            <div key={item.id} onClick={() => setScores(s => ({ ...s, [item.id]: !s[item.id] }))} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: 12, border: `1px solid ${scores[item.id] ? C.accent + "55" : C.border}`, background: scores[item.id] ? C.accentGlow : C.surface, marginBottom: 8, cursor: "pointer", transition: "all 0.18s" }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${scores[item.id] ? C.accent : C.border}`, background: scores[item.id] ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, flexShrink: 0 }}>{scores[item.id] ? "✓" : ""}</div>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 600, color: scores[item.id] ? C.text : C.textSub }}>{item.icon} {item.label}</span>
            </div>
          ))}
          <div style={{ textAlign: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 14, color: C.accent, margin: "10px 0 16px" }}>Score: {Object.values(scores).filter(Boolean).length}/{items.length}</div>
          <GlowBtn full onClick={saveCheck}>Save Check-In</GlowBtn>
        </GlassCard>
      )}
      {checks.length === 0 && !checking && (
        <div style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.4 }}>🧍</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>No checks yet</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.textMuted }}>Run a check-in to start tracking your posture.</div>
        </div>
      )}
      {checks.length > 0 && (
        <GlassCard style={{ padding: "18px 20px", marginBottom: 14, background: sc(avg) + "12", border: `1px solid ${sc(avg)}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: sc(avg) + "22", border: `2px solid ${sc(avg)}55`, display: "flex", alignItems: "center", justifyContent: "center", color: sc(avg), fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800 }}>{avg}%</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: C.textSub, lineHeight: 1.7 }}>{avg >= 80 ? "Excellent posture habits." : avg >= 60 ? "Room to improve." : "Posture may be contributing to your pain."}</div>
          </div>
        </GlassCard>
      )}
      {checks.map(c => (
        <GlassCard key={c.id} style={{ padding: "14px 18px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 600, color: C.text }}>{c.date}</div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.textMuted }}>{c.time}</div></div>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: sc(c.pct) + "22", border: `1px solid ${sc(c.pct)}44`, display: "flex", alignItems: "center", justifyContent: "center", color: sc(c.pct), fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 15 }}>{c.pct}%</div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
function Journal() {
  const [entries, setEntries] = useState([]);
  const [adding, setAdding] = useState(false);
  const [area, setArea] = useState("");
  const [pain, setPain] = useState(5);
  const [notes, setNotes] = useState("");

  const save = () => {
    if (!area) return;
    setEntries(e => [{ id: Date.now(), area, pain, notes, date: todayStr(), time: timeNow() }, ...e]);
    setArea(""); setPain(5); setNotes(""); setAdding(false);
  };

  return (
    <div style={{ overflowY: "auto", height: "100%", padding: 16, background: C.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionHead>Symptom Journal</SectionHead>
        <GlowBtn small onClick={() => setAdding(a => !a)}>{adding ? "Cancel" : "+ Log"}</GlowBtn>
      </div>
      {adding && (
        <GlassCard style={{ padding: 20, marginBottom: 18, border: `1px solid ${C.accent}33` }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Pain Area</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {PAIN_AREAS.map(a => <button key={a} onClick={() => setArea(a)} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${area===a ? C.accent : C.border}`, background: area===a ? C.accentGlow : C.surface, color: area===a ? C.accent : C.textSub, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{a}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Pain Level: <span style={{ color: painColor(pain) }}>{pain}/10</span></div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <button key={n} onClick={() => setPain(n)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: pain===n ? painColor(n) : C.surface, color: pain===n ? "#fff" : C.textMuted, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{n}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What triggered it? What helps?" rows={3} style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1px solid ${C.border}`, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.text, background: C.surface, outline: "none", resize: "none", boxSizing: "border-box" }} />
          </div>
          <GlowBtn full onClick={save}>Save Entry</GlowBtn>
        </GlassCard>
      )}
      {entries.length === 0 && !adding && (
        <div style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.4 }}>📓</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>No entries yet</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.textMuted }}>Log symptoms to track patterns over time.</div>
        </div>
      )}
      {entries.map(e => (
        <GlassCard key={e.id} style={{ padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>{e.area}</div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.textMuted, marginTop: 2 }}>{e.date} · {e.time}</div></div>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: painColor(e.pain) + "22", border: `1px solid ${painColor(e.pain)}44`, display: "flex", alignItems: "center", justifyContent: "center", color: painColor(e.pain), fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 16 }}>{e.pain}</div>
          </div>
          {e.notes && <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{e.notes}</div>}
        </GlassCard>
      ))}
    </div>
  );
}

function Posture() {
  const [checks, setChecks] = useState([]);
  const [checking, setChecking] = useState(false);
  const [scores, setScores] = useState({});
  const items = [
    { id: "ears", label: "Ears over shoulders", icon: "👂" },
    { id: "screen", label: "Screen at eye level", icon: "🖥️" },
    { id: "feet", label: "Feet flat on floor", icon: "🦶" },
    { id: "lumbar", label: "Lumbar support active", icon: "🪑" },
    { id: "shoulders", label: "Shoulders relaxed", icon: "🧘" },
    { id: "chin", label: "No forward head posture", icon: "🙅" },
  ];
  const saveCheck = () => {
    const pct = Math.round((Object.values(scores).filter(Boolean).length / items.length) * 100);
    setChecks(c => [{ id: Date.now(), date: todayStr(), time: timeNow(), pct }, ...c]);
    setScores({}); setChecking(false);
  };
  const sc = (p) => p >= 80 ? C.green : p >= 60 ? C.gold : C.coral;
  const avg = checks.length ? Math.round(checks.reduce((s,c) => s+c.pct, 0) / checks.length) : 0;

  return (
    <div style={{ overflowY: "auto", height: "100%", padding: 16, background: C.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionHead>Posture Tracker</SectionHead>
        <GlowBtn small onClick={() => setChecking(c => !c)}>{checking ? "Cancel" : "Check Now"}</GlowBtn>
      </div>
      {checking && (
        <GlassCard style={{ padding: 20, marginBottom: 18, border: `1px solid ${C.accent}33` }}>
          {items.map(item => (
            <div key={item.id} onClick={() => setScores(s => ({ ...s, [item.id]: !s[item.id] }))} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: 12, border: `1px solid ${scores[item.id] ? C.accent + "55" : C.border}`, background: scores[item.id] ? C.accentGlow : C.surface, marginBottom: 8, cursor: "pointer", transition: "all 0.18s" }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${scores[item.id] ? C.accent : C.border}`, background: scores[item.id] ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, flexShrink: 0 }}>{scores[item.id] ? "✓" : ""}</div>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 600, color: scores[item.id] ? C.text : C.textSub }}>{item.icon} {item.label}</span>
            </div>
          ))}
          <div style={{ textAlign: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 14, color: C.accent, margin: "10px 0 16px" }}>Score: {Object.values(scores).filter(Boolean).length}/{items.length}</div>
          <GlowBtn full onClick={saveCheck}>Save Check-In</GlowBtn>
        </GlassCard>
      )}
      {checks.length === 0 && !checking && (
        <div style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.4 }}>🧍</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>No checks yet</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.textMuted }}>Run a check-in to start tracking your posture.</div>
        </div>
      )}
      {checks.length > 0 && (
        <GlassCard style={{ padding: "18px 20px", marginBottom: 14, background: sc(avg) + "12", border: `1px solid ${sc(avg)}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: sc(avg) + "22", border: `2px solid ${sc(avg)}55`, display: "flex", alignItems: "center", justifyContent: "center", color: sc(avg), fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800 }}>{avg}%</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: C.textSub, lineHeight: 1.7 }}>{avg >= 80 ? "Excellent posture habits." : avg >= 60 ? "Room to improve." : "Posture may be contributing to your pain."}</div>
          </div>
        </GlassCard>
      )}
      {checks.map(c => (
        <GlassCard key={c.id} style={{ padding: "14px 18px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 600, color: C.text }}>{c.date}</div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.textMuted }}>{c.time}</div></div>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: sc(c.pct) + "22", border: `1px solid ${sc(c.pct)}44`, display: "flex", alignItems: "center", justifyContent: "center", color: sc(c.pct), fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 15 }}>{c.pct}%</div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
function Journal() {
  const [entries, setEntries] = useState([]);
  const [adding, setAdding] = useState(false);
  const [area, setArea] = useState("");
  const [pain, setPain] = useState(5);
  const [notes, setNotes] = useState("");

  const save = () => {
    if (!area) return;
    setEntries(e => [{ id: Date.now(), area, pain, notes, date: todayStr(), time: timeNow() }, ...e]);
    setArea(""); setPain(5); setNotes(""); setAdding(false);
  };

  return (
    <div style={{ overflowY: "auto", height: "100%", padding: 16, background: C.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionHead>Symptom Journal</SectionHead>
        <GlowBtn small onClick={() => setAdding(a => !a)}>{adding ? "Cancel" : "+ Log"}</GlowBtn>
      </div>
      {adding && (
        <GlassCard style={{ padding: 20, marginBottom: 18, border: `1px solid ${C.accent}33` }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Pain Area</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {PAIN_AREAS.map(a => <button key={a} onClick={() => setArea(a)} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${area===a ? C.accent : C.border}`, background: area===a ? C.accentGlow : C.surface, color: area===a ? C.accent : C.textSub, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{a}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Pain Level: <span style={{ color: painColor(pain) }}>{pain}/10</span></div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <button key={n} onClick={() => setPain(n)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: pain===n ? painColor(n) : C.surface, color: pain===n ? "#fff" : C.textMuted, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{n}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What triggered it? What helps?" rows={3} style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1px solid ${C.border}`, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.text, background: C.surface, outline: "none", resize: "none", boxSizing: "border-box" }} />
          </div>
          <GlowBtn full onClick={save}>Save Entry</GlowBtn>
        </GlassCard>
      )}
      {entries.length === 0 && !adding && (
        <div style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.4 }}>📓</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>No entries yet</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.textMuted }}>Log symptoms to track patterns over time.</div>
        </div>
      )}
      {entries.map(e => (
        <GlassCard key={e.id} style={{ padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>{e.area}</div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.textMuted, marginTop: 2 }}>{e.date} · {e.time}</div></div>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: painColor(e.pain) + "22", border: `1px solid ${painColor(e.pain)}44`, display: "flex", alignItems: "center", justifyContent: "center", color: painColor(e.pain), fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 16 }}>{e.pain}</div>
          </div>
          {e.notes && <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{e.notes}</div>}
        </GlassCard>
      ))}
    </div>
  );
}

function Posture() {
  const [checks, setChecks] = useState([]);
  const [checking, setChecking] = useState(false);
  const [scores, setScores] = useState({});
  const items = [
    { id: "ears", label: "Ears over shoulders", icon: "👂" },
    { id: "screen", label: "Screen at eye level", icon: "🖥️" },
    { id: "feet", label: "Feet flat on floor", icon: "🦶" },
    { id: "lumbar", label: "Lumbar support active", icon: "🪑" },
    { id: "shoulders", label: "Shoulders relaxed", icon: "🧘" },
    { id: "chin", label: "No forward head posture", icon: "🙅" },
  ];
  const saveCheck = () => {
    const pct = Math.round((Object.values(scores).filter(Boolean).length / items.length) * 100);
    setChecks(c => [{ id: Date.now(), date: todayStr(), time: timeNow(), pct }, ...c]);
    setScores({}); setChecking(false);
  };
  const sc = (p) => p >= 80 ? C.green : p >= 60 ? C.gold : C.coral;
  const avg = checks.length ? Math.round(checks.reduce((s,c) => s+c.pct, 0) / checks.length) : 0;

  return (
    <div style={{ overflowY: "auto", height: "100%", padding: 16, background: C.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionHead>Posture Tracker</SectionHead>
        <GlowBtn small onClick={() => setChecking(c => !c)}>{checking ? "Cancel" : "Check Now"}</GlowBtn>
      </div>
      {checking && (
        <GlassCard style={{ padding: 20, marginBottom: 18, border: `1px solid ${C.accent}33` }}>
          {items.map(item => (
            <div key={item.id} onClick={() => setScores(s => ({ ...s, [item.id]: !s[item.id] }))} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: 12, border: `1px solid ${scores[item.id] ? C.accent + "55" : C.border}`, background: scores[item.id] ? C.accentGlow : C.surface, marginBottom: 8, cursor: "pointer", transition: "all 0.18s" }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${scores[item.id] ? C.accent : C.border}`, background: scores[item.id] ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, flexShrink: 0 }}>{scores[item.id] ? "✓" : ""}</div>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 600, color: scores[item.id] ? C.text : C.textSub }}>{item.icon} {item.label}</span>
            </div>
          ))}
          <div style={{ textAlign: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 14, color: C.accent, margin: "10px 0 16px" }}>Score: {Object.values(scores).filter(Boolean).length}/{items.length}</div>
          <GlowBtn full onClick={saveCheck}>Save Check-In</GlowBtn>
        </GlassCard>
      )}
      {checks.length === 0 && !checking && (
        <div style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.4 }}>🧍</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>No checks yet</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.textMuted }}>Run a check-in to start tracking your posture.</div>
        </div>
      )}
      {checks.length > 0 && (
        <GlassCard style={{ padding: "18px 20px", marginBottom: 14, background: sc(avg) + "12", border: `1px solid ${sc(avg)}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: sc(avg) + "22", border: `2px solid ${sc(avg)}55`, display: "flex", alignItems: "center", justifyContent: "center", color: sc(avg), fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800 }}>{avg}%</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: C.textSub, lineHeight: 1.7 }}>{avg >= 80 ? "Excellent posture habits." : avg >= 60 ? "Room to improve." : "Posture may be contributing to your pain."}</div>
          </div>
        </GlassCard>
      )}
      {checks.map(c => (
        <GlassCard key={c.id} style={{ padding: "14px 18px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 600, color: C.text }}>{c.date}</div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.textMuted }}>{c.time}</div></div>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: sc(c.pct) + "22", border: `1px solid ${sc(c.pct)}44`, display: "flex", alignItems: "center", justifyContent: "center", color: sc(c.pct), fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 15 }}>{c.pct}%</div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
function Profile({ user, onLogout, appointments }) {
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: 16, background: C.bg }}>
      <SectionHead>Profile</SectionHead>
      <GlassCard style={{ padding: "22px 20px", marginBottom: 16, background: `linear-gradient(135deg, ${C.accent}14, ${C.teal}10)`, border: `1px solid ${C.accent}33` }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 58, height: 58, borderRadius: 18, background: `linear-gradient(135deg,${C.accent},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, fontWeight: 800, boxShadow: "0 8px 24px rgba(59,130,246,0.35)" }}>
            {user.name.slice(0,1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>{user.name}</div>
            <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}44`, color: C.accent, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, display: "inline-block", marginTop: 4 }}>Patient</div>
          </div>
        </div>
      </GlassCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        {[{ label: "Appointments", value: appointments.length, icon: "🗓", color: C.accent }, { label: "AI Status", value: "Active", icon: "💙", color: C.teal }].map(s => (
          <GlassCard key={s.label} style={{ padding: "16px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>
      {appointments.length > 0 && (
        <>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Upcoming</div>
          {appointments.map((a,i) => (
            <GlassCard key={i} style={{ padding: "14px 18px", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Av initials={a.provider.avatar} color={a.provider.color} size={40} />
                <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, color: C.text }}>{a.provider.name}</div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: C.accent, fontWeight: 600 }}>{a.slot.day} · {a.slot.time}</div></div>
              </div>
            </GlassCard>
          ))}
        </>
      )}
      {["Notifications", "Privacy Policy", "Terms of Service", "About MyChiro"].map(item => (
        <GlassCard key={item} style={{ padding: "15px 18px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: C.textSub }}>{item}</span>
          <span style={{ color: C.textMuted, fontSize: 18 }}>›</span>
        </GlassCard>
      ))}
      <GlowBtn variant="danger" full onClick={onLogout} style={{ marginTop: 18, padding: "14px 0", fontSize: 14, borderRadius: 14 }}>Sign Out</GlowBtn>
      <div style={{ textAlign: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: C.textMuted, marginTop: 18, lineHeight: 1.6 }}>MyChiro v1.0 · Not a substitute for professional medical advice.</div>
    </div>
  );
}

export default function App() {
  const [apiReady, setApiReady] = useState(() => {
    try { const k = sessionStorage.getItem("mc_key"); return !!(k && k.startsWith("sk-ant")); } catch { return false; }
  });
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("chat");
  const [appointments, setAppointments] = useState([]);
  const [lastTopic, setLastTopic] = useState("");

  const NAV = [
    { id: "chat", label: "AI Chat", icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke={active ? C.accent : C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    )},
    { id: "find", label: "Find", icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke={active ? C.accent : C.textMuted} strokeWidth="2"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke={active ? C.accent : C.textMuted} strokeWidth="2"/></svg>
    )},
    { id: "journal", label: "Journal", icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke={active ? C.accent : C.textMuted} strokeWidth="2" strokeLinecap="round"/></svg>
    )},
    { id: "posture", label: "Posture", icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2a2 2 0 100 4 2 2 0 000-4zM12 8v4m0 0l-2 4m2-4l2 4m-2 0v4" stroke={active ? C.accent : C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    )},
    { id: "profile", label: "Profile", icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={active ? C.accent : C.textMuted} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke={active ? C.accent : C.textMuted} strokeWidth="2"/></svg>
    )},
  ];

  if (!apiReady) return <SetupScreen onDone={() => setApiReady(true)} />;
  if (!user) return <Welcome onEnter={setUser} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${C.bg};-webkit-font-smoothing:antialiased;}
        @keyframes bop{0%,80%,100%{transform:translateY(0);opacity:0.8}40%{transform:translateY(-6px);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px;}
        textarea{resize:none;}
        textarea:focus,input:focus{outline:none;}
        input::placeholder,textarea::placeholder{color:${C.textMuted};}
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>
        <div style={{ padding: "14px 18px 12px", background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <SpineLogo size={28} />
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>MyChiro</span>
          <div style={{ marginLeft: "auto", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: C.textMuted }}>Hi, {user.name} 👋</div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {tab === "chat" && <Chat userName={user.name} onNav={setTab} lastTopic={lastTopic} setLastTopic={setLastTopic} />}
          {tab === "find" && <Find onBook={a => setAppointments(p => [a,...p])} lastTopic={lastTopic} />}
          {tab === "journal" && <Journal />}
          {tab === "posture" && <Posture />}
          {tab === "profile" && <Profile user={user} onLogout={() => setUser(null)} appointments={appointments} />}
        </div>
        <div style={{ display: "flex", background: C.surface, borderTop: `1px solid ${C.border}`, padding: "10px 0 12px", flexShrink: 0 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
              {n.icon(tab === n.id)}
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, fontWeight: tab === n.id ? 700 : 500, color: tab === n.id ? C.accent : C.textMuted }}>{n.label}</span>
              {tab === n.id && <div style={{ width: 18, height: 2.5, borderRadius: 2, background: `linear-gradient(90deg,${C.accent},${C.teal})`, marginTop: 1 }} />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

