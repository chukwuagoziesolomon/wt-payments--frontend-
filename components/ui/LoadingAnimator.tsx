"use client";
import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// ANIMATION KEYFRAMES (injected once)
// ─────────────────────────────────────────────
const ANIM_CSS = `
  @keyframes wt-spin      { to { transform: rotate(360deg); } }
  @keyframes wt-spinRev   { to { transform: rotate(-360deg); } }
  @keyframes wt-pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
  @keyframes wt-shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes wt-fadeIn    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes wt-morphBlob {
    0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}
    33%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}
    66%{border-radius:50% 40% 60% 30%/40% 50% 60% 50%}
  }
  @keyframes wt-glowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(157,141,241,0.5)} 50%{box-shadow:0 0 0 18px rgba(157,141,241,0)} }
  @keyframes wt-ringExpand {
    0%{transform:scale(0.8);opacity:0.8}
    100%{transform:scale(1.6);opacity:0}
  }
  @keyframes wt-dotBounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
  @keyframes wt-countUp   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  .wt-skeleton-bg {
    background: linear-gradient(90deg,
      rgba(255,255,255,0.04) 0%,
      rgba(157,141,241,0.12) 40%,
      rgba(255,255,255,0.04) 80%
    );
    background-size: 400px 100%;
    animation: wt-shimmer 1.8s ease-in-out infinite;
  }
`;

let styleInjected = false;
function StyleInjector() {
  useEffect(() => {
    if (styleInjected) return;
    styleInjected = true;
    const el = document.createElement("style");
    el.textContent = ANIM_CSS;
    document.head.appendChild(el);
  }, []);
  return null;
}

// ─────────────────────────────────────────────
// 1. PAGE LOADER — Full-screen splash
// ─────────────────────────────────────────────
export function PageLoader({
  onComplete,
  duration = 2400,
  label = "Loading",
}: {
  onComplete?: () => void;
  duration?: number;
  label?: string;
}) {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 0.85), 1);
      const eased = 1 - Math.pow(1 - p, 2.5);
      setCount(Math.floor(eased * 100));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const exitTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onComplete?.(), 600);
    }, duration);
    return () => { cancelAnimationFrame(frame); clearTimeout(exitTimer); };
  }, [duration, onComplete]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#08050f",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: leaving ? 0 : 1,
      transform: leaving ? "scale(1.04)" : "scale(1)",
      transition: "opacity 0.6s cubic-bezier(0.23,1,0.32,1), transform 0.6s cubic-bezier(0.23,1,0.32,1)",
      overflow: "hidden",
    }}>
      <StyleInjector />

      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(79,79,143,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(79,79,143,0.07) 1px,transparent 1px)",
        backgroundSize: "56px 56px",
      }} />

      {/* Ambient glow */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(157,141,241,0.1) 0%,transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        animation: "wt-morphBlob 6s ease-in-out infinite", pointerEvents: "none",
      }} />

      {/* Orbit rings */}
      <div style={{ position: "relative", width: 120, height: 120, marginBottom: 40 }}>
        {[0, 0.5, 1].map((delay) => (
          <div key={delay} style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "1px solid rgba(157,141,241,0.25)",
            animation: `wt-ringExpand 2.4s cubic-bezier(0.4,0,0.6,1) ${delay}s infinite`,
          }} />
        ))}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1px solid rgba(157,141,241,0.12)",
          animation: "wt-spin 8s linear infinite",
        }}>
          <div style={{ position: "absolute", top: -5, left: "50%", transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: "#9d8df1", boxShadow: "0 0 12px #9d8df1" }} />
        </div>
        <div style={{
          position: "absolute", inset: 14, borderRadius: "50%",
          border: "1px solid rgba(184,164,249,0.15)",
          animation: "wt-spinRev 5s linear infinite",
        }}>
          <div style={{ position: "absolute", bottom: -4, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#b8a4f9", boxShadow: "0 0 10px #b8a4f9" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg,#9d8df1,#5b4dd4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 22, color: "#f0eeff",
            boxShadow: "0 0 30px rgba(157,141,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
            animation: "wt-glowPulse 2.5s ease-in-out infinite",
          }}>W</div>
        </div>
      </div>

      <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px", color: "#fff", marginBottom: 8, animation: "wt-fadeIn 0.7s ease 0.3s both" }}>
        Western<span style={{ color: "#9d8df1" }}>Treasury</span>
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 40, animation: "wt-fadeIn 0.7s ease 0.5s both" }}>
        Unified crypto &amp; fiat payments
      </div>

      <div style={{ width: 220, animation: "wt-fadeIn 0.7s ease 0.6s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9d8df1", fontFamily: "monospace", animation: "wt-countUp 0.2s ease" }}>{count}%</span>
        </div>
        <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${count}%`, background: "linear-gradient(90deg,#5b4dd4,#9d8df1,#b8a4f9)", borderRadius: 999, transition: "width 0.08s linear", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)", backgroundSize: "200% 100%", animation: "wt-shimmer 1.2s linear infinite" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {[
            { label: "Auth",   done: count > 20 },
            { label: "Assets", done: count > 50 },
            { label: "Wallet", done: count > 75 },
            { label: "Ready",  done: count >= 100 },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.done ? "#9d8df1" : "rgba(255,255,255,0.12)", boxShadow: s.done ? "0 0 8px #9d8df1" : "none", transition: "all 0.4s ease" }} />
              <span style={{ fontSize: 9, color: s.done ? "rgba(157,141,241,0.7)" : "rgba(255,255,255,0.2)", transition: "color 0.4s" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. ROUTE LOADER — Top progress bar
// Used in layout via <RouteLoaderBar />
// ─────────────────────────────────────────────
export function RouteLoaderBar() {
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pathRef = useRef<string>("");

  const start = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFading(false);
    setActive(true);
    let w = 0;
    timerRef.current = setInterval(() => {
      w = w < 70 ? w + Math.random() * 12 : w < 90 ? w + Math.random() * 2 : w;
      setWidth(Math.min(w, 92));
    }, 180);
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setWidth(100);
    setTimeout(() => {
      setFading(true);
      setTimeout(() => { setActive(false); setWidth(0); setFading(false); }, 400);
    }, 250);
  };

  useEffect(() => {
    // Poll pathname via window.location to detect App Router navigations
    const check = () => {
      const current = window.location.pathname;
      if (current !== pathRef.current) {
        if (pathRef.current !== "") start();
        pathRef.current = current;
        // Finish after a short delay (page render time)
        setTimeout(finish, 600);
      }
    };
    pathRef.current = window.location.pathname;
    const id = setInterval(check, 120);
    return () => clearInterval(id);
  }, []);

  if (!active) return <StyleInjector />;

  return (
    <>
      <StyleInjector />
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
        height: 3, pointerEvents: "none",
        opacity: fading ? 0 : 1, transition: "opacity 0.4s ease",
      }}>
        <div style={{
          height: "100%", width: `${width}%`,
          background: "linear-gradient(90deg, #5b4dd4, #9d8df1, #c4b8f8)",
          borderRadius: "0 2px 2px 0",
          transition: "width 0.18s ease",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)", backgroundSize: "200% 100%", animation: "wt-shimmer 1s linear infinite" }} />
        </div>
        <div style={{
          position: "absolute", right: `${100 - width}%`, top: "50%",
          transform: "translate(50%,-50%)",
          width: 8, height: 8, borderRadius: "50%",
          background: "#9d8df1",
          boxShadow: "0 0 12px 4px rgba(157,141,241,0.8)",
          transition: "right 0.18s ease",
        }} />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// 3. SKELETON CARD — Content placeholder
// ─────────────────────────────────────────────
type SkeletonVariant = "dashboard" | "transaction" | "stats" | "profile";

export function SkeletonCard({ variant = "dashboard", count = 1 }: { variant?: SkeletonVariant; count?: number }) {
  const SkEl = ({ w = "100%", h = 14, r = 8, mb = 0 }: { w?: string | number; h?: number; r?: number; mb?: number }) => (
    <div className="wt-skeleton-bg" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
  );

  const Dashboard = () => (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 20, padding: 24, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "14px 16px" }}>
            <SkEl w="50%" h={10} mb={8} />
            <SkEl w="80%" h={20} r={6} />
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}>
          {[30, 50, 38, 65, 55, 78, 70, 85, 76, 90, 80, 95].map((h, i) => (
            <div key={i} className="wt-skeleton-bg" style={{ flex: 1, height: `${h * 0.5}px`, borderRadius: "3px 3px 0 0" }} />
          ))}
        </div>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SkEl w={28} h={28} r={14} mb={0} />
            <div><SkEl w={80} h={10} mb={5} /><SkEl w={50} h={8} r={6} /></div>
          </div>
          <div style={{ textAlign: "right" }}><SkEl w={60} h={10} mb={5} /><SkEl w={40} h={8} r={6} /></div>
        </div>
      ))}
    </div>
  );

  const Transaction = () => (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SkEl w={40} h={40} r={12} mb={0} />
        <div><SkEl w={120} h={12} mb={7} /><SkEl w={80} h={9} r={6} /></div>
      </div>
      <div style={{ textAlign: "right" }}><SkEl w={70} h={12} mb={7} /><SkEl w={50} h={20} r={100} /></div>
    </div>
  );

  const Stats = () => (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 20, padding: "28px 24px", textAlign: "center" }}>
      <SkEl w="40%" h={10} r={6} mb={14} />
      <SkEl w="70%" h={40} r={8} mb={8} />
      <SkEl w="55%" h={9} r={6} />
    </div>
  );

  const Profile = () => (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 20, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <SkEl w={52} h={52} r={26} mb={0} />
        <div style={{ flex: 1 }}><SkEl w="60%" h={14} mb={8} /><SkEl w="40%" h={10} r={6} /></div>
      </div>
      {[100, 80, 90, 70].map((w, i) => <SkEl key={i} w={`${w}%`} h={11} r={6} mb={i < 3 ? 10 : 0} />)}
    </div>
  );

  const maps: Record<SkeletonVariant, React.FC> = { dashboard: Dashboard, transaction: Transaction, stats: Stats, profile: Profile };
  const Component = maps[variant] || Dashboard;

  return (
    <>
      <StyleInjector />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: count }).map((_, i) => <Component key={i} />)}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// 4. BUTTON SPINNER — Inline button loading
// ─────────────────────────────────────────────
type ButtonVariant = "primary" | "ghost" | "outline";

export function ButtonSpinner({
  loading = false,
  children,
  onClick,
  disabled,
  style = {},
  variant = "primary",
  className = "",
}: {
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  variant?: ButtonVariant;
  className?: string;
}) {
  const base: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: "linear-gradient(135deg,#9d8df1,#5b4dd4)", color: "#f0eeff", border: "none" },
    ghost:   { background: "transparent", color: "#9d8df1", border: "1px solid rgba(157,141,241,0.35)" },
    outline: { background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.14)" },
  };

  return (
    <>
      <StyleInjector />
      <button
        onClick={onClick}
        disabled={loading || disabled}
        className={className}
        style={{
          position: "relative", overflow: "hidden",
          ...base[variant],
          borderRadius: 10, padding: "12px 28px",
          fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.25s", opacity: loading ? 0.85 : 1,
          minWidth: 140,
          ...style,
        }}
      >
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)", backgroundSize: "200% 100%", animation: "wt-shimmer 1.2s linear infinite" }} />
        )}
        {loading && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "wt-spin 0.8s linear infinite", flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
        <span style={{ opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}>
          {loading ? "Processing…" : children}
        </span>
      </button>
    </>
  );
}

// ─────────────────────────────────────────────
// 5. SECTION LOADER — Mid-page spinner
// ─────────────────────────────────────────────
type SectionVariant = "orbit" | "dots" | "bars" | "ring";

export function SectionLoader({
  message = "Loading…",
  variant = "orbit",
  height = 220,
}: {
  message?: string;
  variant?: SectionVariant;
  height?: number;
}) {
  const Orbit = () => (
    <div style={{ position: "relative", width: 64, height: 64 }}>
      {[0, 1].map((i) => (
        <div key={i} style={{
          position: "absolute", inset: i * 10, borderRadius: "50%",
          border: `1px solid rgba(157,141,241,${0.15 + i * 0.1})`,
          animation: `${i % 2 === 0 ? "wt-spin" : "wt-spinRev"} ${2 + i}s linear infinite`,
        }}>
          <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 8 - i * 2, height: 8 - i * 2, borderRadius: "50%", background: i === 0 ? "#9d8df1" : "#b8a4f9", boxShadow: `0 0 8px ${i === 0 ? "#9d8df1" : "#b8a4f9"}` }} />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#9d8df1,#5b4dd4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#f0eeff" }}>W</div>
      </div>
    </div>
  );

  const Dots = () => (
    <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: `rgba(157,141,241,${1 - i * 0.2})`, animation: `wt-dotBounce 1.4s ease-in-out ${i * 0.16}s infinite both` }} />
      ))}
    </div>
  );

  const Bars = () => (
    <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 36 }}>
      {[0.6, 0.9, 1, 0.7, 0.8, 0.5, 0.95].map((h, i) => (
        <div key={i} style={{ width: 6, borderRadius: 3, background: "linear-gradient(to top,#5b4dd4,#9d8df1)", height: `${h * 100}%`, animation: `wt-pulse 1.2s ease-in-out ${i * 0.12}s infinite` }} />
      ))}
    </div>
  );

  const Ring = () => (
    <div style={{ position: "relative", width: 52, height: 52 }}>
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ animation: "wt-spin 1.2s linear infinite" }}>
        <circle cx="26" cy="26" r="22" stroke="rgba(157,141,241,0.12)" strokeWidth="3" />
        <path d="M26 4a22 22 0 0 1 22 22" stroke="url(#wt-ring-g)" strokeWidth="3" strokeLinecap="round" />
        <defs>
          <linearGradient id="wt-ring-g" x1="26" y1="4" x2="48" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9d8df1" />
            <stop offset="1" stopColor="#5b4dd4" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💎</div>
    </div>
  );

  const map: Record<SectionVariant, React.FC> = { orbit: Orbit, dots: Dots, bars: Bars, ring: Ring };
  const Visual = map[variant] || Orbit;

  return (
    <>
      <StyleInjector />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height, gap: 18, animation: "wt-fadeIn 0.4s ease" }}>
        <Visual />
        {message && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", fontWeight: 500, letterSpacing: "0.3px" }}>{message}</div>}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// 6. OVERLAY LOADER — Modal / card overlay
// ─────────────────────────────────────────────
export function OverlayLoader({
  visible = false,
  message = "Please wait…",
}: {
  visible?: boolean;
  message?: string;
}) {
  if (!visible) return null;
  return (
    <>
      <StyleInjector />
      <div style={{
        position: "absolute", inset: 0, zIndex: 50,
        background: "rgba(8,5,15,0.88)",
        backdropFilter: "blur(8px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        borderRadius: "inherit", gap: 16,
        animation: "wt-fadeIn 0.3s ease",
      }}>
        <div style={{ position: "relative", width: 56, height: 56 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(157,141,241,0.15)" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#9d8df1", borderRightColor: "#b8a4f9", animation: "wt-spin 0.9s linear infinite" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#9d8df1,#5b4dd4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#f0eeff" }}>W</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{message}</div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// 7. HOOK: usePageLoader
// ─────────────────────────────────────────────
export function usePageLoader(initialState = true) {
  const [isLoading, setIsLoading] = useState(initialState);
  return {
    isLoading,
    startLoading: () => setIsLoading(true),
    stopLoading:  () => setIsLoading(false),
  };
}

// ─────────────────────────────────────────────
// 8. STYLE INJECTOR (export for manual usage)
// ─────────────────────────────────────────────
export { StyleInjector };
