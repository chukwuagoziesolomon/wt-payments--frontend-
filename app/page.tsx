"use client";
import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════
   WESTERN TREASURY  ·  Landing Page
   Next.js + Tailwind CSS  ·  Production-grade
   Sections: Nav · Hero · Trust Bar · Why Us · Stats · 
             Features · Live Demo · Integrations · 
             Developer Widget · How It Works · Pricing ·
             Testimonials · FAQ · CTA · Footer
═══════════════════════════════════════════════════════════ */

/* ─── GLOBAL STYLES ─── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { overflow-x: hidden; }

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #08050f; }
::-webkit-scrollbar-thumb { background: rgba(157,141,241,0.3); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #9d8df1; }

::selection { background: rgba(157,141,241,0.25); color: #fff; }

/* ── Keyframes ── */
@keyframes fadeUp    { from { opacity:0; transform:translateY(50px);  } to { opacity:1; transform:translateY(0);  } }
@keyframes fadeLeft  { from { opacity:0; transform:translateX(-60px); } to { opacity:1; transform:translateX(0); } }
@keyframes fadeRight { from { opacity:0; transform:translateX(60px);  } to { opacity:1; transform:translateX(0); } }
@keyframes scaleIn   { from { opacity:0; transform:scale(0.85);       } to { opacity:1; transform:scale(1);      } }

@keyframes spin      { to { transform: rotate(360deg); } }
@keyframes spinRev   { to { transform: rotate(-360deg); } }

@keyframes float1 { 0%,100% { transform: translateY(0) rotate(0deg); }    50% { transform: translateY(-18px) rotate(2deg); } }
@keyframes float2 { 0%,100% { transform: translateY(0) rotate(0deg); }    50% { transform: translateY(-12px) rotate(-2deg); } }
@keyframes float3 { 0%,100% { transform: translateY(-8px) rotate(-1deg); } 50% { transform: translateY(8px) rotate(1deg); } }

@keyframes morphBlob {
  0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  33%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  66%      { border-radius: 50% 40% 60% 30% / 40% 50% 60% 50%; }
}
@keyframes pulseRing {
  0%   { box-shadow: 0 0 0 0 rgba(157,141,241,0.4); }
  70%  { box-shadow: 0 0 0 14px rgba(157,141,241,0); }
  100% { box-shadow: 0 0 0 0 rgba(157,141,241,0); }
}
@keyframes shimmerX {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes marquee  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes marqRev  { from { transform: translateX(-50%); } to { transform: translateX(0); } }
@keyframes scanLine {
  0%   { top: 0%; }
  100% { top: 100%; }
}
@keyframes blink    { 0%,100% { opacity:1; } 50% { opacity:0; } }
@keyframes glitch1  {
  0%,100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
  20% { clip-path: inset(10% 0 60% 0); transform: translate(-4px, 1px); }
  40% { clip-path: inset(40% 0 30% 0); transform: translate(4px, -1px); }
  60% { clip-path: inset(70% 0 5%  0); transform: translate(-2px, 2px); }
  80% { clip-path: inset(20% 0 70% 0); transform: translate(3px, -2px); }
}
@keyframes gradientShift {
  0%   { background-position: 0%   50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0%   50%; }
}
@keyframes twinkle  { 0%,100% { opacity:0.1; transform:scale(1);   }  50% { opacity:0.6; transform:scale(1.4); } }
@keyframes borderFlow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes dashDraw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
@keyframes numberCount {
  from { opacity:0; transform: translateY(20px); }
  to   { opacity:1; transform: translateY(0); }
}
@keyframes scrollPip {
  0%,100% { top: 6px;  opacity: 1;   }
  50%     { top: 22px; opacity: 0.3; }
}
@keyframes ripple {
  0%   { transform:scale(0); opacity:0.6; }
  100% { transform:scale(4); opacity:0;   }
}
@keyframes neonFlicker {
  0%,19%,21%,23%,25%,54%,56%,100% { opacity:1; }
  20%,24%,55% { opacity:0.4; }
}
@keyframes particleDrift {
  0%   { transform: translateY(0) translateX(0) scale(1); opacity:0.6; }
  50%  { transform: translateY(-40px) translateX(15px) scale(1.2); opacity:0.3; }
  100% { transform: translateY(-80px) translateX(-10px) scale(0.8); opacity:0; }
}

/* ── Utility classes ── */
.font-display { font-family: 'Bricolage Grotesque', sans-serif; }
.font-mono    { font-family: 'JetBrains Mono', monospace; }

.text-shimmer {
  background: linear-gradient(90deg, #9d8df1 0%, #c084fc 30%, #b8a4f9 60%, #9d8df1 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmerX 5s linear infinite;
}

.glow-green  { text-shadow: 0 0 20px rgba(157,141,241,0.7), 0 0 40px rgba(157,141,241,0.3); }
.glow-violet { text-shadow: 0 0 20px rgba(157,141,241,0.7), 0 0 40px rgba(157,141,241,0.3); }
.glow-cyan   { text-shadow: 0 0 20px rgba(167,139,250,0.7),  0 0 40px rgba(167,139,250,0.3);  }

.glass {
  background: rgba(255,255,255,0.032);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.07);
}
.glass-green {
  background: rgba(157,141,241,0.06);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(157,141,241,0.14);
}
.glass-violet {
  background: rgba(157,141,241,0.06);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(157,141,241,0.14);
}

.card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.065);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
  position: relative;
  overflow: hidden;
}
.card::before {
  content:'';
  position:absolute; inset:0;
  background: linear-gradient(135deg, rgba(157,141,241,0.07), transparent 60%);
  opacity:0;
  transition: opacity 0.4s;
  pointer-events:none;
}
.card:hover::before { opacity:1; }
.card:hover {
  border-color: rgba(157,141,241,0.22);
  transform: translateY(-6px);
  box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(157,141,241,0.07);
}

.btn-primary {
  position:relative; overflow:hidden;
  background: linear-gradient(135deg, #9d8df1, #5b4dd4);
  color: #f0eeff; font-weight:700; border-radius:10px;
  border:none; cursor:pointer;
  transition: transform 0.25s, box-shadow 0.25s;
  display:inline-flex; align-items:center; gap:8px;
}
.btn-primary::after {
  content:''; position:absolute; inset:0;
  background: linear-gradient(135deg, #c4b8f8, #9d8df1);
  opacity:0; transition:opacity 0.25s;
}
.btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(157,141,241,0.4); }
.btn-primary:hover::after { opacity:1; }
.btn-primary > * { position:relative; z-index:1; }
.btn-primary span { position:relative; z-index:1; }

.btn-ghost {
  background:transparent;
  border: 1px solid rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.75);
  border-radius:10px; cursor:pointer;
  transition: all 0.25s;
  display:inline-flex; align-items:center; gap:8px;
}
.btn-ghost:hover { border-color:rgba(157,141,241,0.5); color:#9d8df1; background:rgba(157,141,241,0.06); transform:translateY(-1px); }

.btn-outline-green {
  background:transparent;
  border: 1px solid rgba(157,141,241,0.35);
  color: #9d8df1; border-radius:10px; cursor:pointer;
  transition: all 0.25s;
  display:inline-flex; align-items:center; gap:8px;
}
.btn-outline-green:hover { background:rgba(157,141,241,0.1); border-color:#9d8df1; transform:translateY(-1px); box-shadow:0 4px 20px rgba(157,141,241,0.2); }

.pill {
  display:inline-flex; align-items:center; gap:7px;
  background: rgba(157,141,241,0.1);
  border: 1px solid rgba(157,141,241,0.22);
  border-radius:100px; padding: 5px 14px;
  font-size:12px; font-weight:600; color:#9d8df1;
  letter-spacing:0.3px;
}
.pill-violet {
  background: rgba(167,139,250,0.1);
  border-color: rgba(167,139,250,0.22);
  color: #a78bfa;
}

.pulse-dot {
  width:7px; height:7px; border-radius:50%;
  background:#9d8df1;
  animation: pulseRing 2s infinite;
}

.nav-item {
  color:rgba(255,255,255,0.6); font-size:14px; font-weight:500;
  cursor:pointer; transition:color 0.2s; display:flex; align-items:center; gap:4px;
  white-space:nowrap;
}
.nav-item:hover { color:#fff; }

.grid-bg {
  background-image:
    linear-gradient(rgba(79,79,143,0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79,79,143,0.08) 1px, transparent 1px);
  background-size: 64px 64px;
}

.noise-overlay {
  position:absolute; inset:0; pointer-events:none; z-index:1; opacity:0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}

.orbit-ring {
  position:absolute; border-radius:50%;
  border: 1px solid rgba(255,255,255,0.06);
  pointer-events:none;
}

.check-item {
  display:flex; align-items:flex-start; gap:12px;
}
.check-icon {
  width:20px; height:20px; border-radius:50%; flex-shrink:0; margin-top:2px;
  background:rgba(157,141,241,0.15);
  border: 1px solid rgba(157,141,241,0.3);
  display:flex; align-items:center; justify-content:center;
  font-size:9px; color:#9d8df1;
}

.ticker-row { display:flex; gap:0; width:max-content; }
.ticker-row:first-child  { animation: marquee 30s linear infinite; }
.ticker-row:nth-child(2) { animation: marqRev 28s linear infinite; }

.integration-logo {
  background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
  border-radius:14px; padding:20px 28px;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  transition:all 0.3s;
  cursor:pointer;
}
.integration-logo:hover { background:rgba(157,141,241,0.07); border-color:rgba(157,141,241,0.25); transform:translateY(-4px); }

.faq-item {
  border-bottom:1px solid rgba(255,255,255,0.06);
  overflow:hidden;
}

.pricing-card {
  border-radius:24px;
  padding:36px 32px;
  position:relative; overflow:hidden;
  transition:all 0.4s cubic-bezier(0.23,1,0.32,1);
}
.pricing-card:hover { transform:translateY(-8px); }

.feature-tag {
  display:inline-flex; align-items:center; gap:5px;
  font-size:11px; font-weight:600; padding:3px 10px; border-radius:100px;
}

.mock-window {
  border-radius:16px; overflow:hidden;
  border:1px solid rgba(255,255,255,0.08);
  box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(157,141,241,0.06);
}
.mock-titlebar {
  background:rgba(20,28,20,0.95); padding:10px 16px;
  display:flex; align-items:center; gap:7px;
  border-bottom:1px solid rgba(255,255,255,0.05);
}
.mock-dot { width:11px; height:11px; border-radius:50%; }

.stat-number {
  font-family:'Bricolage Grotesque', sans-serif;
  font-weight:800; line-height:1;
  animation: numberCount 0.8s ease both;
}

.scroll-cue { 
  width:26px; height:44px; border-radius:13px;
  border:2px solid rgba(157,141,241,0.35);
  position:relative; margin:0 auto;
}
.scroll-pip {
  width:4px; height:9px; border-radius:2px;
  background:#9d8df1; position:absolute;
  top:6px; left:50%; transform:translateX(-50%);
  animation: scrollPip 1.8s ease-in-out infinite;
}

.neon-border {
  border: 1px solid transparent;
  background:
    linear-gradient(rgba(7,12,7,1), rgba(7,12,7,1)) padding-box,
    linear-gradient(135deg, #9d8df1, #b8a4f9, #a78bfa, #9d8df1) border-box;
  background-size: auto, 300% 300%;
  animation: borderFlow 5s linear infinite;
}

.hero-number {
  position:absolute; font-family:'Bricolage Grotesque',sans-serif;
  font-weight:800; opacity:0.04; pointer-events:none; user-select:none;
  line-height:1; color:#fff;
}

.tag-row { display:flex; flex-wrap:wrap; gap:8px; }
.tag { 
  padding:4px 12px; border-radius:100px; font-size:11px; font-weight:600;
  background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
  color:rgba(255,255,255,0.5);
  transition:all 0.2s;
}
.tag:hover { background:rgba(157,141,241,0.1); border-color:rgba(157,141,241,0.3); color:#9d8df1; }

.cursor-glow {
  position:fixed; pointer-events:none; z-index:9999;
  width:300px; height:300px; border-radius:50%;
  background:radial-gradient(circle, rgba(157,141,241,0.06) 0%, transparent 70%);
  transform:translate(-50%,-50%);
  transition:all 0.1s ease;
}
`;

/* ─── HOOK: InView ─── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [vis, setVis] = useState<boolean>(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, vis] as [React.RefObject<HTMLDivElement>, boolean];
}

/* ─── HOOK: Mouse position ─── */
function useMouse() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  useEffect(() => {
    const h = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return pos;
}

/* ─── HOOK: Counter animation ─── */
function useCounter(target: number, duration: number = 1800, start: boolean = false): number {
  const [val, setVal] = useState<number>(0);
  useEffect(() => {
    if (!start) return;
    let raf: number | undefined;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { if (raf !== undefined) cancelAnimationFrame(raf); };
  }, [target, duration, start]);
  return val;
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0, dir = "up", style = {}, className = "" }: { children?: React.ReactNode; delay?: number; dir?: string; style?: React.CSSProperties; className?: string }) {
  const [ref, vis] = useInView();
  const from = dir === "left" ? "translateX(-50px)" : dir === "right" ? "translateX(50px)" : dir === "scale" ? "scale(0.9)" : "translateY(44px)";
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : from,
      transition: `opacity 0.9s cubic-bezier(0.23,1,0.32,1) ${delay}ms, transform 0.9s cubic-bezier(0.23,1,0.32,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Glow text ─── */
function G({ children, c = "#9d8df1", cls = "" }: { children?: ReactNode; c?: string; cls?: string }) {
  return (
    <span className={cls} style={{ color: c, textShadow: `0 0 24px ${c}77, 0 0 48px ${c}33` }}>
      {children}
    </span>
  );
}

/* ─── Star Rating ─── */
function Stars({ n = 5 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#9d8df1">
          <path d="M7 1l1.6 3.3 3.6.5-2.6 2.6.6 3.6L7 9.3l-3.2 1.7.6-3.6L1.8 4.8l3.6-.5z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Live Ticker ─── */
function Ticker({ items, reverse = false, speed = 28 }: { items: any[]; reverse?: boolean; speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{
        display: "flex", gap: 16, width: "max-content",
        animation: `${reverse ? "marqRev" : "marquee"} ${speed}s linear infinite`,
      }}>
        {doubled.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 18px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.065)",
            borderRadius: 100, whiteSpace: "nowrap",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: item.color + "22",
              border: `1.5px solid ${item.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: item.color,
            }}>
              {item.symbol}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{item.name}</span>
            <span style={{ fontSize: 12, color: item.up ? "#9d8df1" : "#f87171", fontWeight: 600 }}>
              {item.up ? "+" : ""}{item.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Mock Dashboard Window ─── */
function DashboardWindow() {
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const rows = [
    { name: "Bitcoin",  sym: "BTC", price: "$67,240",   change: "+2.41%", green: true,  vol: "$4.2M"  },
    { name: "Ethereum", sym: "ETH", price: "$3,540",    change: "+1.18%", green: true,  vol: "$2.1M"  },
    { name: "USD Wire", sym: "USD", price: "$50,000",   change: "Settled",green: true,  vol: "$50K"   },
    { name: "Solana",   sym: "SOL", price: "$182",      change: "-0.82%", green: false, vol: "$890K"  },
    { name: "USDC",     sym: "USDC",price: "$1.00",     change: "Stable", green: true,  vol: "$10M"   },
    { name: "Polygon",  sym: "MATIC",price:"$0.87",     change: "+3.22%", green: true,  vol: "$320K"  },
  ];
  const cards = [
    { label: "Total Balance", val: "$284,921", sub: "+4.2% today",   color: "#9d8df1" },
    { label: "Crypto",        val: "$142,450", sub: "6 assets",      color: "#b8a4f9" },
    { label: "Fiat",          val: "$142,471", sub: "3 currencies",  color: "#a78bfa" },
  ];
  return (
    <div className="mock-window" style={{ width: "100%", maxWidth: 520, background: "rgba(8,14,8,0.97)" }}>
      <div className="mock-titlebar">
        <div className="mock-dot" style={{ background: "#ff5f57" }} />
        <div className="mock-dot" style={{ background: "#febc2e" }} />
        <div className="mock-dot" style={{ background: "#7c6de8" }} />
        <div style={{ marginLeft: 8, fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "'JetBrains Mono',monospace" }}>
          western-treasury / dashboard
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {["Wallet","Payments","Analytics"].map(t => (
            <div key={t} style={{ padding:"3px 10px", borderRadius:6, background:"rgba(255,255,255,0.05)", fontSize:10, color:"rgba(255,255,255,0.4)" }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Balance cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "14px 14px 8px" }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${c.color}22`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: c.color, fontFamily: "'Bricolage Grotesque',sans-serif", lineHeight: 1 }}>{c.val}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Mini chart bar */}
      <div style={{ padding: "0 14px 8px", display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
        {[30,45,35,60,52,70,65,80,74,90,82,95,88,100,94].map((h,i) => (
          <div key={i} style={{
            flex: 1, borderRadius: "3px 3px 0 0",
            background: `linear-gradient(to top, #9d8df1${i % 3 === 0 ? "cc" : "55"}, #a78bfa22)`,
            height: `${h * 0.36}px`,
            transition: "height 0.3s",
          }} />
        ))}
      </div>

      {/* Table header */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", padding:"7px 14px", borderTop:"1px solid rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        {["Asset","Price","Change","Volume"].map(h => (
          <div key={h} style={{ fontSize:10, color:"rgba(255,255,255,0.28)", fontWeight:600, letterSpacing:"0.5px", textTransform:"uppercase" }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      {rows.map((r, i) => (
        <div key={r.sym} onMouseEnter={() => setActiveRow(i)} onMouseLeave={() => setActiveRow(null)}
          style={{
            display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", padding:"10px 14px",
            borderBottom:"1px solid rgba(255,255,255,0.03)",
            background: activeRow === i ? "rgba(157,141,241,0.04)" : "transparent",
            transition:"background 0.2s", cursor:"pointer",
          }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:26,height:26,borderRadius:"50%",background:`rgba(157,141,241,0.12)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#9d8df1" }}>{r.sym[0]}</div>
            <div>
              <div style={{ fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.85)" }}>{r.name}</div>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.28)" }}>{r.sym}</div>
            </div>
          </div>
          <div style={{ fontSize:12,color:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center" }}>{r.price}</div>
          <div style={{ fontSize:11,fontWeight:600,display:"flex",alignItems:"center",color:r.green?"#9d8df1":"#f87171" }}>{r.change}</div>
          <div style={{ fontSize:11,color:"rgba(255,255,255,0.35)",display:"flex",alignItems:"center" }}>{r.vol}</div>
        </div>
      ))}

      {/* Footer */}
      <div style={{ padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:10,color:"rgba(255,255,255,0.25)" }}>Last updated: just now</div>
        <div style={{ display:"flex",gap:6 }}>
          {["Send","Receive","Swap"].map(a => (
            <div key={a} style={{ padding:"4px 12px",borderRadius:6,background:"rgba(157,141,241,0.1)",border:"1px solid rgba(157,141,241,0.2)",fontSize:10,fontWeight:600,color:"#9d8df1",cursor:"pointer" }}>{a}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Orbit Visual ─── */
function OrbitVisual() {
  // FIX: Stable animation values — no Math.random() in render
  const floatAnims = ["float1", "float2", "float3", "float1"];
  const floatDurs  = ["3s", "4s", "3.5s", "5s"];

  return (
    <div style={{ position:"relative", width:360, height:360, margin:"0 auto" }}>
      {/* Rings */}
      {[320,240,160].map((s,i) => (
        <div key={s} style={{
          position:"absolute", borderRadius:"50%",
          width:s, height:s,
          top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          border:`1px solid rgba(157,141,241,${0.06 + i*0.03})`,
          animation:`${i%2===0?"spin":"spinRev"} ${30+i*10}s linear infinite`,
        }}>
          {i === 0 && <div style={{ position:"absolute",top:-7,left:"50%",transform:"translateX(-50%)",width:14,height:14,borderRadius:"50%",background:"#9d8df1",boxShadow:"0 0 14px #9d8df1" }} />}
          {i === 1 && <div style={{ position:"absolute",bottom:-6,right:20,width:12,height:12,borderRadius:"50%",background:"#b8a4f9",boxShadow:"0 0 12px #b8a4f9" }} />}
          {i === 2 && <div style={{ position:"absolute",top:10,right:-5,width:10,height:10,borderRadius:"50%",background:"#a78bfa",boxShadow:"0 0 10px #a78bfa" }} />}
        </div>
      ))}
      {/* Center */}
      <div style={{
        position:"absolute", top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:96,height:96,borderRadius:22,
        background:"linear-gradient(135deg, rgba(157,141,241,0.25), rgba(157,141,241,0.2))",
        border:"1px solid rgba(157,141,241,0.35)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:38, backdropFilter:"blur(20px)",
        boxShadow:"0 0 60px rgba(157,141,241,0.2), inset 0 0 30px rgba(157,141,241,0.05)",
        animation:"morphBlob 7s ease-in-out infinite",
      }}>💎</div>
      {/* Floating asset badges — FIX: stable animation values */}
      {[
        {label:"BTC",  pct:"+2.4%", c:"#f7931a", top:30,  left:-20,  animIdx:0},
        {label:"ETH",  pct:"+1.1%", c:"#627eea", bottom:50,right:-25, animIdx:1},
        {label:"USDC", pct:"Stable",c:"#2775ca", bottom:0, left:20,   animIdx:2},
        {label:"SOL",  pct:"+5.3%", c:"#9945ff", top:80,  right:10,  animIdx:3},
      ].map(b => (
        <div key={b.label} className="glass" style={{
          position:"absolute",
          ...(b.top    !== undefined ? { top:    b.top    } : {}),
          ...(b.bottom !== undefined ? { bottom: b.bottom } : {}),
          ...(b.left   !== undefined ? { left:   b.left   } : {}),
          ...(b.right  !== undefined ? { right:  b.right  } : {}),
          padding:"9px 14px", borderRadius:12,
          display:"flex",alignItems:"center",gap:8, zIndex:2,
          animation:`${floatAnims[b.animIdx]} ${floatDurs[b.animIdx]} ease-in-out infinite`,
        }}>
          <div style={{ width:26,height:26,borderRadius:"50%",background:b.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:b.c }}>{b.label[0]}</div>
          <div>
            <div style={{ fontSize:12,fontWeight:700,color:"#fff" }}>{b.label}</div>
            <div style={{ fontSize:10,color:b.c,fontWeight:600 }}>{b.pct}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Pricing Card ─── */
function PricingCard({ plan, price, desc, features, cta, highlight, color, delay }: any) {
  return (
    <Reveal delay={delay}>
      <div className={`pricing-card ${highlight ? "neon-border" : "glass"}`}
        style={{
          background: highlight
            ? "linear-gradient(145deg, rgba(157,141,241,0.09), rgba(7,12,7,0.97))"
            : "rgba(255,255,255,0.022)",
        }}>
        {highlight && (
          <div style={{ position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",
            background:"linear-gradient(135deg,#9d8df1,#5b4dd4)",
            padding:"4px 18px",borderRadius:"0 0 12px 12px",
            fontSize:11,fontWeight:700,color:"#f0eeff",letterSpacing:"0.5px" }}>
            MOST POPULAR
          </div>
        )}
        <div style={{ marginBottom:8 }}>
          <span style={{ fontSize:12,fontWeight:700,color:color,textTransform:"uppercase",letterSpacing:"1px" }}>{plan}</span>
        </div>
        <div style={{ display:"flex",alignItems:"baseline",gap:4,marginBottom:8 }}>
          <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:48,fontWeight:800,color:"#fff",lineHeight:1 }}>{price}</span>
          {price !== "Custom" && <span style={{ fontSize:14,color:"rgba(255,255,255,0.4)" }}>/mo</span>}
        </div>
        <p style={{ fontSize:14,color:"rgba(255,255,255,0.5)",marginBottom:28,lineHeight:1.6 }}>{desc}</p>
        <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:32 }}>
          {features.map((f: any) => (
            <div key={f} className="check-item">
              <div className="check-icon">✓</div>
              <span style={{ fontSize:14,color:"rgba(255,255,255,0.65)" }}>{f}</span>
            </div>
          ))}
        </div>
        <button className={highlight ? "btn-primary" : "btn-ghost"} style={{ width:"100%",justifyContent:"center",padding:"13px 24px",fontSize:14 }}>
          <span>{cta}</span>
        </button>
      </div>
    </Reveal>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ q, a, delay }: any) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Reveal delay={delay}>
      <div className="faq-item" onClick={() => setOpen(!open)} style={{ cursor:"pointer", padding:"22px 0" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:16 }}>
          <span style={{ fontSize:16,fontWeight:600,color:open?"#9d8df1":"rgba(255,255,255,0.85)",transition:"color 0.2s" }}>{q}</span>
          <div style={{
            width:30,height:30,borderRadius:8,flexShrink:0,
            background:open?"rgba(157,141,241,0.15)":"rgba(255,255,255,0.05)",
            border:`1px solid ${open?"rgba(157,141,241,0.3)":"rgba(255,255,255,0.08)"}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            transition:"all 0.3s", transform:open?"rotate(45deg)":"none",
            fontSize:16, color:open?"#9d8df1":"rgba(255,255,255,0.5)",
          }}>+</div>
        </div>
        <div style={{
          maxHeight: open ? 200 : 0,
          overflow:"hidden",
          transition:"max-height 0.4s cubic-bezier(0.23,1,0.32,1)",
        }}>
          <p style={{ fontSize:15,color:"rgba(255,255,255,0.5)",lineHeight:1.75,paddingTop:14 }}>{a}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* ══════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════ */
export default function WesternTreasury() {
  const mouse = useMouse();
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [statRef, statVis] = useInView(0.4);
  const c1 = useCounter(2400, 2000, statVis);
  const c2 = useCounter(40000, 2200, statVis);
  const c3 = useCounter(9998, 2000, statVis);
  const c4 = useCounter(180, 1800, statVis);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navScrolled = scrollY > 30;

  /* ── DATA ── */
  const currencies = [
    { symbol:"₿",  name:"Bitcoin",  color:"#f7931a", change:2.41,  up:true  },
    { symbol:"Ξ",  name:"Ethereum", color:"#627eea", change:1.18,  up:true  },
    { symbol:"◎",  name:"Solana",   color:"#9945ff", change:5.32,  up:true  },
    { symbol:"$",  name:"USDT",     color:"#26a17b", change:0.01,  up:true  },
    { symbol:"●",  name:"USDC",     color:"#2775ca", change:0.00,  up:true  },
    { symbol:"Ⓑ",  name:"BNB",      color:"#f3ba2f", change:0.88,  up:false },
    { symbol:"◈",  name:"AVAX",     color:"#e84142", change:1.22,  up:false },
    { symbol:"⬡",  name:"OP",       color:"#ff0420", change:3.40,  up:true  },
    { symbol:"Ⓐ",  name:"ARB",      color:"#12aaff", change:2.15,  up:true  },
    { symbol:"◆",  name:"MATIC",    color:"#8247e5", change:4.10,  up:true  },
    { symbol:"Ð",  name:"Dogecoin", color:"#c2a633", change:0.55,  up:false },
    { symbol:"X",  name:"XRP",      color:"#346aa9", change:1.90,  up:true  },
  ];

  const features = [
    {
      title:"Unified Dashboard",
      subtitle:"Everything in one view",
      desc:"Manage all your crypto and fiat transactions in one elegant, secure platform. Real-time updates across 180+ countries with instant settlement notifications.",
      icon:"◈", color:"#9d8df1",
      tags:["Real-time","Multi-currency","Auto-reconcile"],
      stats:[{ label:"Avg. load time", val:"0.3s" },{ label:"Uptime", val:"99.98%" }],
    },
    {
      title:"Real-time Wallet",
      subtitle:"Full custody, full control",
      desc:"Track your crypto and fiat balances instantly. Accurate live prices, automatic portfolio rebalancing, and detailed transaction history at your fingertips.",
      icon:"⚡", color:"#b8a4f9",
      tags:["Non-custodial","Multi-sig","Hardware key"],
      stats:[{ label:"Assets supported", val:"200+" },{ label:"Settlement time", val:"< 2s" }],
    },
    {
      title:"API-Powered Payments",
      subtitle:"Built for developers",
      desc:"Automate transactions seamlessly. Our RESTful API and webhooks integrate with any stack. Process millions of transactions per day with full idempotency.",
      icon:"⚙", color:"#a78bfa",
      tags:["REST API","Webhooks","SDKs"],
      stats:[{ label:"API latency", val:"< 80ms" },{ label:"TPS", val:"10,000+" }],
    },
    {
      title:"Global Settlements",
      subtitle:"No borders, no friction",
      desc:"Send and receive across 180+ countries instantly. Automatic currency conversion at best-available rates. SWIFT, SEPA, ACH, and on-chain all in one place.",
      icon:"🌐", color:"#c084fc",
      tags:["180+ countries","Best rates","Auto-convert"],
      stats:[{ label:"Avg. settlement", val:"< 4 hrs" },{ label:"FX spread", val:"0.5%" }],
    },
  ];

  const integrations = [
    { name:"Stripe",    icon:"Ⓢ",  color:"#635bff" },
    { name:"Shopify",   icon:"⬡",  color:"#96bf48" },
    { name:"Plaid",     icon:"Ⓟ",  color:"#62d9d1" },
    { name:"Coinbase",  icon:"◉",  color:"#0052ff" },
    { name:"Twilio",    icon:"Ⓣ",  color:"#f22f46" },
    { name:"Slack",     icon:"❖",  color:"#4a154b" },
    { name:"Zapier",    icon:"⚡",  color:"#ff4a00" },
    { name:"AWS",       icon:"☁",  color:"#ff9900" },
    { name:"Notion",    icon:"Ⓝ",  color:"#fff" },
    { name:"HubSpot",   icon:"Ⓗ",  color:"#ff7a59" },
    { name:"QuickBooks",icon:"Ⓠ",  color:"#2ca01c" },
    { name:"Xero",      icon:"Ⓧ",  color:"#13b5ea" },
  ];

  const testimonials = [
    {
      name:"Okorie Esther", role:"CEO, GreenFlow", avatar:"OE", color:"#9d8df1", stars:5,
      quote:"Western Treasury made it effortless for us to accept both crypto and fiat. Our international customers now pay seamlessly and payments are 3× faster.",
    },
    {
      name:"Laura Chen", role:"COO, Switchlab Mobility", avatar:"LC", color:"#b8a4f9", stars:5,
      quote:"Managing crypto and fiat in one dashboard saves us hours weekly. It's transparent, secure, and genuinely built for serious business growth.",
    },
    {
      name:"Michael Ade", role:"CTO, TrxAge Solution", avatar:"MA", color:"#a78bfa", stars:5,
      quote:"As a developer, the API is exceptional. Clean docs, fast response times, and the webhook system is rock-solid. Automated payments were live in under an hour.",
    },
    {
      name:"Sofia Brennan", role:"Finance Director, Nomad Labs", avatar:"SB", color:"#c084fc", stars:5,
      quote:"The FX rates are genuinely competitive and the settlement speed is unmatched. We saved 18% on international transfer costs in the first month alone.",
    },
    {
      name:"Kwame Asante", role:"Founder, ChainPay Africa", avatar:"KA", color:"#f43f5e", stars:5,
      quote:"Finally a platform built for emerging markets. The local currency support and low fees have helped us scale across 12 African countries.",
    },
    {
      name:"Yuki Tanaka", role:"Head of Ops, NeoRetail", avatar:"YT", color:"#a78bfa", stars:5,
      quote:"Onboarding took 15 minutes. The unified dashboard replaced three separate tools we were using. The ROI was immediate and unmistakable.",
    },
  ];

  const faqs = [
    { q:"What currencies and blockchains do you support?", a:"Western Treasury supports 200+ cryptocurrencies across all major blockchains including Bitcoin, Ethereum, Solana, BNB Chain, Polygon, Avalanche, and more. For fiat, we support 80+ currencies via SWIFT, SEPA, ACH, and local payment rails." },
    { q:"How long does it take to get started?", a:"Account setup takes under 5 minutes. For businesses requiring KYB verification, the process typically completes within 1–2 business days. You can start using the sandbox immediately." },
    { q:"Is my money safe on Western Treasury?", a:"We employ bank-grade 256-bit encryption, multi-signature wallets, hardware security modules, and real-time fraud detection. Customer funds are held in segregated accounts and insured up to $250,000." },
    { q:"Can I integrate Western Treasury with my existing stack?", a:"Absolutely. We offer REST APIs, GraphQL, SDKs for Node.js, Python, Go, Ruby, and PHP, plus no-code integrations with Zapier, Make, Shopify, WooCommerce, and 50+ other platforms." },
    { q:"What are your transaction fees?", a:"Fees start at 0.5% for crypto transactions and 1.2% for fiat with volume discounts. Enterprise plans include custom pricing and dedicated settlement rails. There are no hidden fees." },
    { q:"Do you offer 24/7 support?", a:"Yes. All plans include 24/7 email support. Growth and Enterprise plans include live chat, phone support, and a dedicated account manager for mission-critical operations." },
  ];

  // FIX: Stable mock transaction data — computed once with useMemo, not on every render
  const mockTransactions = useMemo(() => (
    Array.from({ length: 5 }, (_, j) => ({
      id: 10000 + j * 9871 % 90000,
      amount: (100 + j * 1847.33).toFixed(2),
    }))
  ), []);

  const codeLines = [
    { indent:0, tokens:[{t:"comment",v:"// Initialize Western Treasury SDK"}] },
    { indent:0, tokens:[{t:"kw",v:"import"},{t:"txt",v:" { WesternTreasury } "},{t:"kw",v:"from"},{t:"str",v:" '@western/sdk'"}] },
    { indent:0, tokens:[] },
    { indent:0, tokens:[{t:"kw",v:"const"},{t:"txt",v:" client = "},{t:"fn",v:"new"},{t:"txt",v:" WesternTreasury({"}] },
    { indent:1, tokens:[{t:"prop",v:"apiKey"},{t:"txt",v:": process.env."},{t:"env",v:"WT_API_KEY"}] },
    { indent:0, tokens:[{t:"txt",v:"});"}] },
    { indent:0, tokens:[] },
    { indent:0, tokens:[{t:"comment",v:"// Accept a payment in 3 lines"}] },
    // FIX: Removed the double comma that was here
    { indent:0, tokens:[{t:"kw",v:"const"},{t:"txt",v:" payment = "},{t:"kw",v:"await"},{t:"txt",v:" client.payments."},{t:"fn",v:"create"},{t:"txt",v:"({"}] },
    { indent:1, tokens:[{t:"prop",v:"amount"},{t:"txt",v:": "},{t:"num",v:"4200"}] },
    { indent:1, tokens:[{t:"prop",v:"currency"},{t:"txt",v:": "},{t:"str",v:"'USDC'"}] },
    { indent:1, tokens:[{t:"prop",v:"network"},{t:"txt",v:": "},{t:"str",v:"'ethereum'"}] },
    { indent:1, tokens:[{t:"prop",v:"webhook"},{t:"txt",v:": "},{t:"str",v:"'https://api.yourapp.com/wh'"}] },
    { indent:0, tokens:[{t:"txt",v:"});"}] },
    { indent:0, tokens:[] },
    { indent:0, tokens:[{t:"fn",v:"console"},{t:"txt",v:"."},{t:"fn",v:"log"},{t:"txt",v:"(payment."},{t:"prop",v:"checkoutUrl"},{t:"txt",v:")"}] },
    { indent:0, tokens:[{t:"comment",v:"// → https://pay.western.io/p_xK9m2..."}] },
  ];

  const tokenColor: Record<string, string> = { kw:"#b8a4f9", fn:"#a78bfa", str:"#c084fc", prop:"#9d8df1", num:"#9d8df1", env:"#f43f5e", comment:"rgba(255,255,255,0.3)", txt:"rgba(255,255,255,0.75)" };

  return (
    <div style={{ background:"#08050f", color:"#ede8fd", fontFamily:"'Bricolage Grotesque',sans-serif", minHeight:"100vh", position:"relative", overflowX:"hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mouse.x, top: mouse.y }} />

      {/* ════════════════════════════════════
          NAVBAR
      ════════════════════════════════════ */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:200,
        background: navScrolled ? "rgba(5,8,10,0.88)" : "transparent",
        backdropFilter: navScrolled ? "blur(24px) saturate(180%)" : "none",
        borderBottom: navScrolled ? "1px solid rgba(255,255,255,0.055)" : "none",
        transition:"all 0.4s cubic-bezier(0.23,1,0.32,1)",
        padding:"0 6%",
      }}>
        <div style={{ maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:70 }}>
          {/* Logo */}
          <div style={{ display:"flex",alignItems:"center",gap:11 }}>
            <div style={{ width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#9d8df1,#5b4dd4)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,color:"#f0eeff",boxShadow:"0 0 20px #9d8df155", fontFamily:"'Bricolage Grotesque',sans-serif" }}>W</div>
            <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:17,letterSpacing:"-0.5px" }}>
              Western<span style={{ color:"#9d8df1" }}>Treasury</span>
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display:"flex",alignItems:"center",gap:34 }}>
            {[["Use Case"],["Security Overview"],["Developer","▾"],["Resources","▾"],["Company","▾"]].map(([label,arrow]) => (
              <div key={label} className="nav-item">
                {label}{arrow && <span style={{ fontSize:10,opacity:0.5 }}>{arrow}</span>}
              </div>
            ))}
          </div>

          {/* FIX: Links styled correctly — using style prop instead of conflicting className */}
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <Link href="/login" style={{
              fontSize:14, padding:"9px 22px", display:"inline-flex", alignItems:"center", gap:8,
              background:"transparent", border:"1px solid rgba(255,255,255,0.14)",
              color:"rgba(255,255,255,0.75)", borderRadius:10, cursor:"pointer", textDecoration:"none",
              transition:"all 0.25s",
            }}>Log In</Link>
            <Link href="/signup" style={{
              fontSize:14, padding:"9px 22px", display:"inline-flex", alignItems:"center", gap:8,
              background:"linear-gradient(135deg,#9d8df1,#5b4dd4)",
              color:"#f0eeff", fontWeight:700, borderRadius:10, cursor:"pointer", textDecoration:"none",
              transition:"transform 0.25s, box-shadow 0.25s",
            }}>
              Get Started Free <span style={{ fontSize:16 }}>→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="grid-bg" style={{ position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",paddingTop:70,overflow:"hidden" }}>
        <div className="noise-overlay" />

        {/* Background blobs */}
        <div style={{ position:"absolute",width:800,height:800,borderRadius:"50%",background:"radial-gradient(circle,rgba(157,141,241,0.07) 0%,transparent 70%)",top:"-20%",left:"40%",pointerEvents:"none",animation:"morphBlob 10s ease-in-out infinite" }} />
        <div style={{ position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(157,141,241,0.05) 0%,transparent 70%)",bottom:"-10%",right:"-5%",pointerEvents:"none" }} />

        {/* Decorative big numbers */}
        <span className="hero-number" style={{ fontSize:320,bottom:-40,left:-20,transform:"none" }}>W</span>

        <div style={{ maxWidth:1280,margin:"0 auto",padding:"60px 6%",width:"100%",position:"relative",zIndex:2,display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center" }}>
          {/* Left */}
          <div>
            {/* Badge */}
            <div style={{ opacity:0,animation:"fadeLeft 0.8s ease 0.1s both" }}>
              <div className="pill" style={{ marginBottom:28 }}>
                <div className="pulse-dot" />
                Trusted by 40,000+ businesses worldwide
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-display" style={{
              fontSize:"clamp(38px,5vw,70px)",fontWeight:800,lineHeight:1.05,letterSpacing:"-2.5px",
              marginBottom:24,
              opacity:0,animation:"fadeLeft 0.9s ease 0.2s both",
            }}>
              Seamlessly manage{" "}
              <G c="#9d8df1">crypto</G>
              {" "}and{" "}
              <G c="#b8a4f9">fiat</G>
              {" "}payments to grow your business.
            </h1>

            <p style={{ fontSize:18,color:"rgba(255,255,255,0.52)",maxWidth:500,lineHeight:1.75,marginBottom:40,opacity:0,animation:"fadeLeft 0.9s ease 0.3s both" }}>
              A secure platform that unifies crypto and fiat for fast global payments, smart financial management, and unstoppable business growth.
            </p>

            {/* CTA Row */}
            <div style={{ display:"flex",gap:14,flexWrap:"wrap",marginBottom:52,opacity:0,animation:"fadeLeft 0.9s ease 0.4s both" }}>
              <button className="btn-primary" style={{ fontSize:16,padding:"15px 36px",borderRadius:12 }}>
                <span>Start for Free</span>
                <span style={{ fontSize:18 }}>→</span>
              </button>
              <button className="btn-ghost" style={{ fontSize:16,padding:"15px 32px",borderRadius:12,display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12 }}>▶</div>
                Watch 2-min demo
              </button>
            </div>

            {/* Social proof */}
            <div style={{ display:"flex",alignItems:"center",gap:16,opacity:0,animation:"fadeLeft 0.9s ease 0.5s both" }}>
              <div style={{ display:"flex" }}>
                {["#9d8df1","#b8a4f9","#a78bfa","#c084fc","#f43f5e"].map((c,i) => (
                  <div key={c} style={{ width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${c}33,${c}22)`,border:`2px solid #08050f`,marginLeft:i?-10:0,boxShadow:`0 0 8px ${c}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:c }}>
                    {["OK","LC","MA","SB","KA"][i]}
                  </div>
                ))}
              </div>
              <div>
                <Stars n={5} />
                <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2 }}>4.9/5 from 2,400+ reviews</div>
              </div>
            </div>
          </div>

          {/* Right — Dashboard */}
          <div style={{ position:"relative",opacity:0,animation:"fadeRight 1s ease 0.35s both" }}>
            <DashboardWindow />
            {/* Notification badges */}
            <div className="glass-green" style={{ position:"absolute",top:-18,right:-10,padding:"10px 18px",borderRadius:14,display:"flex",alignItems:"center",gap:9,animation:"float1 4s ease-in-out infinite" }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:"#9d8df1",animation:"pulseRing 2s infinite" }} />
              <span style={{ fontSize:12,fontWeight:700,color:"#9d8df1" }}>Payment received · $4,200</span>
            </div>
            <div className="glass-violet" style={{ position:"absolute",bottom:-14,left:-16,padding:"10px 18px",borderRadius:14,display:"flex",alignItems:"center",gap:9,animation:"float2 5s ease-in-out 1s infinite" }}>
              <span style={{ fontSize:14 }}>⚡</span>
              <span style={{ fontSize:12,fontWeight:700,color:"#b8a4f9" }}>Instant settlement active</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:"absolute",bottom:32,left:"50%",transform:"translateX(-50%)",opacity:0.45,animation:"fadeUp 1s ease 1.2s both" }}>
          <div className="scroll-cue"><div className="scroll-pip" /></div>
          <div style={{ fontSize:10,textAlign:"center",marginTop:8,color:"rgba(255,255,255,0.3)",letterSpacing:1 }}>SCROLL</div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CURRENCY MARQUEE
      ════════════════════════════════════ */}
      <div style={{ borderTop:"1px solid rgba(157,141,241,0.08)",borderBottom:"1px solid rgba(157,141,241,0.08)",background:"rgba(157,141,241,0.025)",padding:"14px 0",overflow:"hidden" }}>
        <div style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:"2px",textTransform:"uppercase",textAlign:"center",marginBottom:10 }}>Supported Currencies & Networks</div>
        <Ticker items={currencies} speed={35} />
      </div>

      {/* ════════════════════════════════════
          TRUST BAR
      ════════════════════════════════════ */}
      <section style={{ padding:"48px 6%",borderBottom:"1px solid rgba(255,255,255,0.045)" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center",marginBottom:32 }}>
              <span style={{ fontSize:13,color:"rgba(255,255,255,0.3)",letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:600 }}>
                Trusted by leading companies worldwide
              </span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:48,flexWrap:"wrap" }}>
              {["GreenFlow","Switchlab","TrxAge","Nomad Labs","ChainPay","NeoRetail"].map(n => (
                <div key={n} style={{ fontSize:18,fontWeight:800,color:"rgba(255,255,255,0.15)",letterSpacing:"-0.5px",transition:"color 0.3s",cursor:"default",fontFamily:"'Bricolage Grotesque',sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.color="rgba(255,255,255,0.55)"}
                  onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.15)"}
                >{n}</div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════ */}
      <section style={{ padding:"120px 6%",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(157,141,241,0.06) 0%,transparent 70%)",top:"10%",left:"-8%",pointerEvents:"none" }} />
        <div style={{ maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:100,alignItems:"center" }}>
          <Reveal dir="left">
            <div className="pill" style={{ marginBottom:28 }}>Why Choose Us</div>
            <h2 className="font-display" style={{ fontSize:"clamp(30px,3.5vw,52px)",fontWeight:800,lineHeight:1.08,letterSpacing:"-2px",marginBottom:22 }}>
              Built for <G c="#9d8df1">Trust</G>,<br />Built for <G c="#b8a4f9">Business</G>
            </h2>
            <p style={{ fontSize:17,color:"rgba(255,255,255,0.5)",lineHeight:1.8,marginBottom:36 }}>
              We bring crypto and fiat together in one secure platform, making payments simpler, faster, and more reliable. From global settlements to easy automation, everything is designed to help your business grow with confidence.
            </p>
            <div style={{ display:"flex",flexDirection:"column",gap:14,marginBottom:40 }}>
              {[
                "Zero setup fees — cancel anytime",
                "Bank-grade AES-256 encryption at rest & in transit",
                "Multi-sig wallets with hardware security modules",
                "24/7 live support from real humans",
                "PCI DSS Level 1 certified & SOC 2 Type II audited",
              ].map(item => (
                <div key={item} className="check-item">
                  <div className="check-icon">✓</div>
                  <span style={{ fontSize:15,color:"rgba(255,255,255,0.65)" }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:12 }}>
              <button className="btn-primary" style={{ fontSize:15,padding:"12px 28px" }}>
                <span>Get Started Free</span>
              </button>
              <button className="btn-ghost" style={{ fontSize:15,padding:"12px 24px" }}>Learn More →</button>
            </div>
          </Reveal>

          <Reveal dir="right" delay={150}>
            <OrbitVisual />
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════
          STATS
      ════════════════════════════════════ */}
      <section style={{ padding:"80px 6%",background:"rgba(255,255,255,0.012)",borderTop:"1px solid rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <div ref={statRef} style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24 }}>
            {[
              { val:`$${c1 >= 2400 ? "2.4" : (c1/1000).toFixed(1)}B+`, label:"Volume Processed",   color:"#9d8df1", delay:0   },
              { val:`${c2 >= 40000 ? "40K" : Math.floor(c2/1000)+"K"}+`, label:"Active Businesses",color:"#b8a4f9", delay:100 },
              { val:`${c3 >= 9998 ? "99.98" : (c3/100).toFixed(0)}%`,  label:"Uptime SLA",         color:"#a78bfa", delay:200 },
              { val:`${c4}+`,                                            label:"Countries Supported",color:"#c084fc", delay:300 },
            ].map((s) => (
              <Reveal key={s.label} delay={s.delay} dir="scale">
                <div className="card" style={{ padding:"36px 28px",textAlign:"center" }}>
                  <div className="stat-number" style={{ fontSize:"clamp(32px,4vw,52px)",color:s.color,marginBottom:8,animationDelay:`${s.delay}ms` }}>{s.val}</div>
                  <div style={{ fontSize:14,color:"rgba(255,255,255,0.45)",fontWeight:500 }}>{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FEATURES — Interactive
      ════════════════════════════════════ */}
      <section style={{ padding:"120px 6%",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,0.04) 0%,transparent 70%)",top:"30%",right:"-10%",pointerEvents:"none" }} />
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <Reveal style={{ textAlign:"center",marginBottom:72 }}>
            <div className="pill" style={{ marginBottom:20 }}>Core Features</div>
            <h2 className="font-display" style={{ fontSize:"clamp(30px,4vw,56px)",fontWeight:800,lineHeight:1.08,letterSpacing:"-2px" }}>
              The tools your <G c="#b8a4f9">business</G> needs<br />
              to <G c="#9d8df1">scale payments</G> globally.
            </h2>
          </Reveal>

          {/* Tab selectors */}
          <Reveal delay={100} style={{ display:"flex",gap:8,marginBottom:48,flexWrap:"wrap",justifyContent:"center" }}>
            {features.map((f, i) => (
              <button key={f.title} onClick={() => setActiveFeature(i)}
                style={{
                  padding:"10px 22px",borderRadius:100,fontSize:14,fontWeight:600,cursor:"pointer",
                  background: activeFeature === i ? f.color+"22" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${activeFeature === i ? f.color+"55" : "rgba(255,255,255,0.08)"}`,
                  color: activeFeature === i ? f.color : "rgba(255,255,255,0.55)",
                  transition:"all 0.3s",
                }}>
                {f.icon} {f.title}
              </button>
            ))}
          </Reveal>

          {/* Active feature panel */}
          {features.map((f, i) => (
            <div key={f.title} style={{
              display: activeFeature === i ? "grid" : "none",
              gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center",
            }}>
              {/* Left — info */}
              <div>
                <div className="pill" style={{ marginBottom:20,background:`rgba(157,141,241,0.06)` }}>
                  <span style={{ fontSize:16 }}>{f.icon}</span> {f.subtitle}
                </div>
                <h3 className="font-display" style={{ fontSize:"clamp(24px,3vw,42px)",fontWeight:800,letterSpacing:"-1.5px",marginBottom:18,lineHeight:1.1 }}>
                  <G c={f.color}>{f.title}</G>
                </h3>
                <p style={{ fontSize:17,color:"rgba(255,255,255,0.52)",lineHeight:1.8,marginBottom:28 }}>{f.desc}</p>
                <div className="tag-row" style={{ marginBottom:28 }}>
                  {f.tags.map(t => <div key={t} className="tag">{t}</div>)}
                </div>
                <div style={{ display:"flex",gap:16 }}>
                  {f.stats.map(s => (
                    <div key={s.label} style={{ padding:"14px 20px",background:`${f.color}0f`,border:`1px solid ${f.color}22`,borderRadius:12 }}>
                      <div style={{ fontSize:22,fontWeight:800,color:f.color,fontFamily:"'Bricolage Grotesque',sans-serif" }}>{s.val}</div>
                      <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right — mock UI */}
              <div>
                <div className="mock-window" style={{ background:"rgba(8,14,8,0.95)" }}>
                  <div className="mock-titlebar">
                    <div className="mock-dot" style={{ background:"#ff5f57" }} />
                    <div className="mock-dot" style={{ background:"#febc2e" }} />
                    <div className="mock-dot" style={{ background:"#7c6de8" }} />
                    <span style={{ marginLeft:10,fontSize:11,color:"rgba(255,255,255,0.25)",fontFamily:"'JetBrains Mono',monospace" }}>{f.title.toLowerCase().replace(/ /g,"-")}.tsx</span>
                  </div>
                  <div style={{ padding:20 }}>
                    {/* Feature-specific mini UI */}
                    <div style={{ marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                      <span style={{ fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.6)" }}>{f.title} Overview</span>
                      <div style={{ padding:"3px 10px",borderRadius:6,background:`${f.color}18`,border:`1px solid ${f.color}33`,fontSize:10,fontWeight:700,color:f.color }}>LIVE</div>
                    </div>
                    {/* FIX: Use stable mockTransactions instead of Math.random() */}
                    {mockTransactions.map((tx) => (
                      <div key={tx.id} style={{
                        display:"flex",alignItems:"center",justifyContent:"space-between",
                        padding:"10px 12px",marginBottom:4,borderRadius:8,
                        background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.04)",
                      }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <div style={{ width:22,height:22,borderRadius:6,background:`${f.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:f.color }}>Ⓦ</div>
                          <span style={{ fontSize:12,color:"rgba(255,255,255,0.6)" }}>Transaction #{tx.id}</span>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <span style={{ fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.8)" }}>${tx.amount}</span>
                          <div style={{ padding:"2px 8px",borderRadius:20,background:"rgba(157,141,241,0.15)",fontSize:9,fontWeight:700,color:"#9d8df1" }}>Success</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Feature cards grid (always visible) */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginTop:60 }}>
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i*80}>
                <div className="card" style={{ padding:"28px 24px",cursor:"pointer",borderColor:activeFeature===i?`${f.color}33`:undefined }}
                  onClick={() => setActiveFeature(i)}>
                  <div style={{ width:48,height:48,borderRadius:13,background:`${f.color}18`,border:`1px solid ${f.color}2f`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:16,boxShadow:`0 0 20px ${f.color}18` }}>
                    {f.icon}
                  </div>
                  <h4 className="font-display" style={{ fontSize:16,fontWeight:700,marginBottom:8,color:"#fff" }}>{f.title}</h4>
                  <p style={{ fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.65 }}>{f.desc.slice(0,90)}…</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          INTEGRATIONS
      ════════════════════════════════════ */}
      <section style={{ padding:"100px 6%",background:"rgba(255,255,255,0.01)",borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <Reveal style={{ textAlign:"center",marginBottom:64 }}>
            <div className="pill pill-violet" style={{ marginBottom:20 }}>Integrations</div>
            <h2 className="font-display" style={{ fontSize:"clamp(28px,3.5vw,50px)",fontWeight:800,letterSpacing:"-1.8px",lineHeight:1.08 }}>
              Connects with your <G c="#a78bfa">entire stack</G>
            </h2>
            <p style={{ fontSize:17,color:"rgba(255,255,255,0.45)",maxWidth:520,margin:"16px auto 0",lineHeight:1.7 }}>
              50+ native integrations. REST API + webhooks for everything else.
            </p>
          </Reveal>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:14 }}>
            {integrations.map((ig, i) => (
              <Reveal key={ig.name} delay={i*40}>
                <div className="integration-logo">
                  <div style={{ width:40,height:40,borderRadius:10,background:`${ig.color}18`,border:`1px solid ${ig.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:ig.color }}>{ig.icon}</div>
                  <span style={{ fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.55)" }}>{ig.name}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} style={{ textAlign:"center",marginTop:40 }}>
            <span style={{ fontSize:14,color:"rgba(255,255,255,0.35)" }}>+ 40 more integrations · </span>
            <span style={{ fontSize:14,color:"#9d8df1",cursor:"pointer",fontWeight:600 }}>View all →</span>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════
          DEVELOPER SECTION
      ════════════════════════════════════ */}
      <section style={{ padding:"120px 6%",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(157,141,241,0.06) 0%,transparent 70%)",bottom:"-5%",left:"50%",transform:"translateX(-50%)",pointerEvents:"none" }} />
        <div style={{ maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center" }}>
          {/* Code panel */}
          <Reveal dir="left">
            <div style={{ position:"relative" }}>
              <div style={{
                background:"rgba(4,8,4,0.95)",
                border:"1px solid rgba(157,141,241,0.14)",
                borderRadius:18,overflow:"hidden",
                boxShadow:"0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(157,141,241,0.06)",
              }}>
                {/* Titlebar */}
                <div style={{ background:"rgba(10,17,10,0.95)",padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ width:11,height:11,borderRadius:"50%",background:"#ff5f57" }} />
                  <div style={{ width:11,height:11,borderRadius:"50%",background:"#febc2e" }} />
                  <div style={{ width:11,height:11,borderRadius:"50%",background:"#7c6de8" }} />
                  <div style={{ marginLeft:10,fontSize:11,color:"rgba(255,255,255,0.28)",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",gap:12 }}>
                    <span>payment.js</span>
                    <span style={{ opacity:0.4 }}>×</span>
                    <span style={{ color:"rgba(157,141,241,0.6)" }}>terminal</span>
                  </div>
                  {/* Scan line */}
                  <div style={{ marginLeft:"auto",display:"flex",gap:6 }}>
                    {["JS","TS","PY"].map(l => (
                      <div key={l} style={{ padding:"2px 8px",borderRadius:4,background:"rgba(255,255,255,0.05)",fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:"'JetBrains Mono',monospace" }}>{l}</div>
                    ))}
                  </div>
                </div>
                {/* Code */}
                <div style={{ padding:"22px 24px",fontFamily:"'JetBrains Mono',monospace",fontSize:12.5,lineHeight:1.9,position:"relative",overflow:"hidden" }}>
                  {/* Animated scan line */}
                  <div style={{ position:"absolute",left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(157,141,241,0.15),transparent)",animation:"scanLine 4s linear infinite",pointerEvents:"none" }} />
                  {/* Line numbers + code */}
                  {codeLines.map((line, li) => (
                    <div key={li} style={{ display:"flex",gap:20 }}>
                      <span style={{ color:"rgba(255,255,255,0.15)",userSelect:"none",minWidth:18,textAlign:"right",fontSize:11 }}>{li+1}</span>
                      <div style={{ paddingLeft: line.indent * 20 }}>
                        {/* FIX: filter out null/undefined tokens before mapping */}
                        {(line.tokens || []).filter(Boolean).map((tok, ti) => (
                          <span key={ti} style={{ color: tokenColor[tok.t] || "#fff" }}>{tok.v}</span>
                        ))}
                        {li === codeLines.length - 1 && (
                          <span style={{ borderRight:"2px solid #9d8df1",animation:"blink 1s step-end infinite",marginLeft:1 }}> </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Terminal output */}
                <div style={{ background:"rgba(0,0,0,0.4)",borderTop:"1px solid rgba(255,255,255,0.05)",padding:"12px 24px" }}>
                  <div style={{ display:"flex",gap:8,marginBottom:6 }}>
                    {["bash","node","npm"].map(t => (
                      <div key={t} style={{ padding:"2px 10px",borderRadius:4,background:"rgba(255,255,255,0.05)",fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:"'JetBrains Mono',monospace" }}>{t}</div>
                    ))}
                  </div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11 }}>
                    <span style={{ color:"#9d8df1" }}>✓</span><span style={{ color:"rgba(255,255,255,0.45)",marginLeft:8 }}>Payment created: </span><span style={{ color:"#a78bfa" }}>p_xK9m2nPqRs7tUvW</span>
                  </div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,marginTop:4 }}>
                    <span style={{ color:"#9d8df1" }}>✓</span><span style={{ color:"rgba(255,255,255,0.45)",marginLeft:8 }}>Checkout URL ready · </span><span style={{ color:"rgba(255,255,255,0.3)" }}>200 OK · 67ms</span>
                  </div>
                </div>
              </div>

              {/* SDK badges */}
              <div style={{ display:"flex",gap:8,marginTop:16,flexWrap:"wrap" }}>
                {["Node.js","Python","Go","Ruby","PHP","Java"].map(sdk => (
                  <div key={sdk} style={{ padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",fontSize:12,color:"rgba(255,255,255,0.5)",fontFamily:"'JetBrains Mono',monospace" }}>{sdk}</div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right text */}
          <Reveal dir="right" delay={150}>
            <div className="pill pill-violet" style={{ marginBottom:28 }}>Widget Integration</div>
            <h2 className="font-display" style={{ fontSize:"clamp(28px,3.2vw,48px)",fontWeight:800,lineHeight:1.08,letterSpacing:"-1.8px",marginBottom:22 }}>
              Developer-Friendly<br /><G c="#b8a4f9">Payment Widget</G>
            </h2>
            <p style={{ fontSize:17,color:"rgba(255,255,255,0.5)",lineHeight:1.8,marginBottom:36 }}>
              Drop in a single script tag and start accepting crypto and fiat payments in minutes. Full REST API, GraphQL, webhooks, and SDKs for every major language. Sandbox environment included.
            </p>
            <div style={{ display:"flex",flexDirection:"column",gap:14,marginBottom:36 }}>
              {[
                { icon:"🔑", label:"API-first design with full idempotency" },
                { icon:"📦", label:"SDKs for Node, Python, Go, Ruby, PHP, Java" },
                { icon:"🔔", label:"Real-time webhooks with automatic retries" },
                { icon:"🧪", label:"Full sandbox with test card & crypto support" },
              ].map(item => (
                <div key={item.label} className="check-item">
                  <div style={{ width:32,height:32,borderRadius:9,background:"rgba(157,141,241,0.12)",border:"1px solid rgba(157,141,241,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>{item.icon}</div>
                  <span style={{ fontSize:15,color:"rgba(255,255,255,0.65)",lineHeight:1.5,marginTop:4 }}>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:12 }}>
              <button className="btn-primary" style={{ fontSize:14,padding:"12px 26px" }}>
                <span>View Docs</span>
              </button>
              <button className="btn-outline-green" style={{ fontSize:14,padding:"12px 22px",borderColor:"rgba(157,141,241,0.35)",color:"#b8a4f9" }}>
                API Reference →
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════ */}
      <section style={{ padding:"100px 6%",background:"rgba(255,255,255,0.01)",borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <Reveal style={{ textAlign:"center",marginBottom:72 }}>
            <div className="pill" style={{ marginBottom:20 }}>How It Works</div>
            <h2 className="font-display" style={{ fontSize:"clamp(28px,3.5vw,52px)",fontWeight:800,letterSpacing:"-2px",lineHeight:1.08 }}>
              Start accepting payments with{" "}
              <G c="#9d8df1">Western Treasury</G><br />in minutes.
            </h2>
          </Reveal>

          <div style={{ position:"relative" }}>
            {/* Connecting dotted line */}
            <div style={{ position:"absolute",top:52,left:"16%",right:"16%",height:1,background:"linear-gradient(90deg,#9d8df133,#b8a4f944,#a78bfa33)",zIndex:0,display:"flex",alignItems:"center" }}>
              <div style={{ width:"100%",height:1,backgroundImage:"repeating-linear-gradient(90deg,rgba(157,141,241,0.35) 0,rgba(157,141,241,0.35) 8px,transparent 8px,transparent 16px)" }} />
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:28,position:"relative",zIndex:1 }}>
              {[
                { n:"01", icon:"🏢", title:"Sign Up & Connect", desc:"Create your account in under 5 minutes. Complete business verification, set up your secure dashboard, and connect your bank account or crypto wallet." },
                { n:"02", icon:"💳", title:"Accept Crypto & Fiat", desc:"Start receiving payments globally — crypto and fiat on one unified platform. Generate payment links, embed the widget, or call the API directly." },
                { n:"03", icon:"📈", title:"Track, Settle & Grow", desc:"Monitor wallets in real time, automate settlements to your bank, analyze performance with built-in analytics, and scale confidently." },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i*120}>
                  <div className="card" style={{ padding:"40px 32px",textAlign:"center" }}>
                    <div style={{ width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#9d8df122,#9d8df108)",border:"1px solid rgba(157,141,241,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px",fontSize:18 }}>{s.icon}</div>
                    <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:13,fontWeight:700,color:"rgba(157,141,241,0.5)",letterSpacing:"1px",marginBottom:16 }}>{s.n}</div>
                    <div style={{ width:48,height:3,borderRadius:2,background:"linear-gradient(90deg,#9d8df1,#a78bfa)",margin:"0 auto 20px" }} />
                    <h3 className="font-display" style={{ fontSize:20,fontWeight:700,marginBottom:14,color:"#fff" }}>{s.title}</h3>
                    <p style={{ fontSize:14,color:"rgba(255,255,255,0.48)",lineHeight:1.75 }}>{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          PRICING
      ════════════════════════════════════ */}
      <section style={{ padding:"120px 6%",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(157,141,241,0.05) 0%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none" }} />
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <Reveal style={{ textAlign:"center",marginBottom:72 }}>
            <div className="pill" style={{ marginBottom:20 }}>Pricing</div>
            <h2 className="font-display" style={{ fontSize:"clamp(28px,3.5vw,52px)",fontWeight:800,letterSpacing:"-2px",lineHeight:1.08 }}>
              Transparent pricing,<br /><G c="#9d8df1">no surprises</G>
            </h2>
            <p style={{ fontSize:17,color:"rgba(255,255,255,0.45)",maxWidth:480,margin:"16px auto 0",lineHeight:1.7 }}>
              Start free. Scale as you grow. No setup fees, no hidden charges.
            </p>
          </Reveal>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24,position:"relative",zIndex:1 }}>
            <PricingCard
              plan="Starter" price="$0" color="#9d8df1"
              desc="Perfect for new businesses exploring crypto & fiat payments."
              features={["Up to $10K/mo volume","Basic dashboard","5 API keys","Email support","1 team member","Sandbox environment"]}
              cta="Get Started Free" highlight={false} delay={0}
            />
            <PricingCard
              plan="Growth" price="$49" color="#b8a4f9"
              desc="For scaling businesses that need more power and integrations."
              features={["Up to $500K/mo volume","Advanced analytics","Unlimited API keys","Priority support","10 team members","Webhooks & automation","Custom checkout branding","White-label invoices"]}
              cta="Start 14-day Trial" highlight={true} delay={120}
            />
            <PricingCard
              plan="Enterprise" price="Custom" color="#a78bfa"
              desc="Custom limits, dedicated support, and enterprise-grade compliance."
              features={["Unlimited volume","Custom FX rates","Dedicated account manager","SLA 99.99% uptime","SOC 2 & PCI reports","Custom integrations","On-premise option","24/7 phone support"]}
              cta="Contact Sales →" highlight={false} delay={240}
            />
          </div>

          <Reveal delay={300} style={{ textAlign:"center",marginTop:48 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:24,flexWrap:"wrap" }}>
              {["No credit card required","Cancel anytime","Free migration assistance"].map(t => (
                <div key={t} style={{ display:"flex",alignItems:"center",gap:6,fontSize:13,color:"rgba(255,255,255,0.4)" }}>
                  <span style={{ color:"#9d8df1" }}>✓</span> {t}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════ */}
      <section style={{ padding:"100px 6%",background:"rgba(255,255,255,0.01)",borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <Reveal style={{ textAlign:"center",marginBottom:64 }}>
            <div className="pill" style={{ marginBottom:20 }}>Testimonials</div>
            <h2 className="font-display" style={{ fontSize:"clamp(28px,3.5vw,52px)",fontWeight:800,letterSpacing:"-2px",lineHeight:1.08 }}>
              See what our <G c="#9d8df1">clients</G> say
            </h2>
          </Reveal>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i*80}>
                <div className="card" style={{ padding:"30px 26px" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                    <Stars />
                    <div style={{ fontSize:11,color:"rgba(255,255,255,0.25)",fontFamily:"'JetBrains Mono',monospace" }}>Verified</div>
                  </div>
                  <p style={{ fontSize:15,color:"rgba(255,255,255,0.62)",lineHeight:1.75,marginBottom:24,fontStyle:"italic" }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${t.color}33,${t.color}11)`,border:`2px solid ${t.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:t.color }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize:14,fontWeight:700,color:"#fff" }}>{t.name}</div>
                      <div style={{ fontSize:12,color:"rgba(255,255,255,0.38)",marginTop:1 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FAQ
      ════════════════════════════════════ */}
      <section style={{ padding:"100px 6%" }}>
        <div style={{ maxWidth:820,margin:"0 auto" }}>
          <Reveal style={{ textAlign:"center",marginBottom:64 }}>
            <div className="pill" style={{ marginBottom:20 }}>FAQ</div>
            <h2 className="font-display" style={{ fontSize:"clamp(28px,3.5vw,50px)",fontWeight:800,letterSpacing:"-1.8px",lineHeight:1.08 }}>
              Frequently asked <G c="#9d8df1">questions</G>
            </h2>
          </Reveal>
          {faqs.map((f, i) => (
            <FAQItem key={f.q} q={f.q} a={f.a} delay={i*60} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA
      ════════════════════════════════════ */}
      <section style={{ padding:"80px 6%",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",width:800,height:800,borderRadius:"50%",background:"radial-gradient(circle,rgba(157,141,241,0.07) 0%,transparent 65%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none",animation:"morphBlob 10s ease-in-out infinite" }} />
        <div style={{ maxWidth:800,margin:"0 auto",position:"relative",zIndex:2 }}>
          <Reveal dir="scale">
            <div className="neon-border" style={{ borderRadius:28,padding:"70px 60px",textAlign:"center",background:"linear-gradient(145deg,rgba(157,141,241,0.06),rgba(5,8,10,0.97))" }}>
              <div style={{ fontSize:56,marginBottom:20,animation:"float1 3s ease-in-out infinite" }}>🚀</div>
              <h2 className="font-display" style={{ fontSize:"clamp(30px,4.5vw,58px)",fontWeight:800,lineHeight:1.05,letterSpacing:"-2.5px",marginBottom:18 }}>
                Get started with{" "}
                <G c="#9d8df1">Western Treasury</G>
                {" "}today!
              </h2>
              <p style={{ fontSize:17,color:"rgba(255,255,255,0.48)",marginBottom:40,lineHeight:1.7,maxWidth:480,margin:"0 auto 40px" }}>
                Join 40,000+ businesses already growing with our platform. Zero setup fees, no contracts, cancel anytime.
              </p>
              <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
                <button className="btn-ghost" style={{ fontSize:16,padding:"14px 32px" }}>Log In</button>
                <button className="btn-primary" style={{ fontSize:16,padding:"14px 36px" }}>
                  <span>Get Started for Free</span>
                  <span style={{ fontSize:18 }}>→</span>
                </button>
              </div>
              <div style={{ marginTop:28,display:"flex",alignItems:"center",justifyContent:"center",gap:24,flexWrap:"wrap" }}>
                {["No credit card","Free forever plan","Setup in 5 minutes"].map(t => (
                  <div key={t} style={{ display:"flex",alignItems:"center",gap:6,fontSize:13,color:"rgba(255,255,255,0.35)" }}>
                    <span style={{ color:"#9d8df1" }}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)",padding:"60px 6% 32px" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          {/* Top row */}
          <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:40,marginBottom:60 }}>
            {/* Brand */}
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
                <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#9d8df1,#5b4dd4)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#f0eeff" }}>W</div>
                <span className="font-display" style={{ fontWeight:800,fontSize:16,letterSpacing:"-0.5px" }}>Western<span style={{ color:"#9d8df1" }}>Treasury</span></span>
              </div>
              <p style={{ fontSize:14,color:"rgba(255,255,255,0.38)",lineHeight:1.75,maxWidth:240,marginBottom:20 }}>
                The unified platform for crypto and fiat payment management.
              </p>
              <div style={{ display:"flex",gap:10 }}>
                {["𝕏","in","⬛","○"].map(s => (
                  <div key={s} style={{ width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"rgba(255,255,255,0.4)",cursor:"pointer",transition:"all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(157,141,241,0.4)"; e.currentTarget.style.color="#9d8df1"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}
                  >{s}</div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              { title:"Product",    links:["Dashboard","Wallet","Payments","Analytics","API"] },
              { title:"Company",    links:["About Us","Careers","Blog","Press","Contact"] },
              { title:"Legal",      links:["Privacy Policy","Terms of Service","AML Policy","Cookie Policy","Licenses"] },
              { title:"Resources",  links:["Documentation","API Reference","Status Page","Changelog","Community"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.35)",letterSpacing:"1.2px",textTransform:"uppercase",marginBottom:16 }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ fontSize:14,color:"rgba(255,255,255,0.42)",marginBottom:10,cursor:"pointer",transition:"color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#9d8df1"}
                    onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.42)"}
                  >{l}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.04)",paddingTop:24,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
            <div style={{ fontSize:13,color:"rgba(255,255,255,0.22)" }}>© 2025 WesternTreasury Inc. All rights reserved.</div>
            <div style={{ display:"flex",gap:24 }}>
              {["Privacy","Terms","Cookies"].map(l => (
                <span key={l} style={{ fontSize:13,color:"rgba(255,255,255,0.3)",cursor:"pointer",transition:"color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color="#9d8df1"}
                  onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.3)"}
                >{l}</span>
              ))}
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,color:"rgba(255,255,255,0.25)" }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:"#9d8df1",animation:"pulseRing 2s infinite" }} />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}