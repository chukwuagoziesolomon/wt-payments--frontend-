"use client";

import { useEffect, useState } from "react";

type CkbMetrics = {
  ccc_identities_connected: number;
  ckb_payment_intents_created: number;
  ckb_payments_completed: number;
  fiber_payments_completed: number;
  ckb_payment_volume_fiat: number;
  ckb_currencies_used: number;
};

function token() {
  return typeof window === "undefined" ? "" : localStorage.getItem("authToken") || localStorage.getItem("token") || "";
}

export function CkbMetricsCard() {
  const [metrics, setMetrics] = useState<CkbMetrics | null>(null);

  useEffect(() => {
    fetch("/api/user/shop/ckb-metrics", { headers: { Authorization: `Bearer ${token()}` }, cache: "no-store" })
      .then((response) => response.json())
      .then((json) => setMetrics(json.result || json.data || null))
      .catch(() => undefined);
  }, []);

  if (!metrics) return null;

  const values: Array<[string, string | number]> = [
    ["CCC identities", metrics.ccc_identities_connected],
    ["CKB intents", metrics.ckb_payment_intents_created],
    ["CKB completed", metrics.ckb_payments_completed],
    ["Fiber completed", metrics.fiber_payments_completed],
    ["CKB volume", `NGN ${Number(metrics.ckb_payment_volume_fiat || 0).toLocaleString()}`],
    ["Currencies used", metrics.ckb_currencies_used],
  ];

  return (
    <section className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">CKB adoption</p><h2 className="mt-1 text-lg font-semibold text-white">CCC and CKB payment activity</h2></div>
        <span className="rounded-full border border-emerald-400/25 px-2 py-1 text-[10px] font-semibold text-emerald-300">CKB TESTNET</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {values.map(([label, value]) => <div key={label} className="rounded-xl border border-white/[0.06] bg-black/10 p-3"><p className="text-xs text-white/45">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>)}
      </div>
      <p className="mt-3 text-xs text-white/45">CCC provides identity. CKB/Fiber is the preferred settlement path; other chains remain payment adapters.</p>
    </section>
  );
}
