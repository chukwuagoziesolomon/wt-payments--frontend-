"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API = "/backend";

function tokenHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") || localStorage.getItem("token") || "" : "";
  return { Authorization: `Bearer ${token}` };
}

type Wallet = {
  uniqueId: string;
  walletAddress: string;
  balance: number;
  currency: { symbol: string; name: string };
  cryptoNetwork: { name: string; networkType: string };
  status?: string;
};

type Settings = {
  auto_settlement_enabled: boolean;
  auto_settlement_time: string;
  payout_method: "wallet" | "bank";
  payout_wallet_id: string;
  payout_currency_id: string;
  payout_bank_account_no: string;
  payout_bank_name: string;
  payout_account_name: string;
  payout_bank_code: string;
  last_payout_at: string | null;
  last_payout_status: string | null;
};

export default function AutoSettlementPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState<Settings>({
    auto_settlement_enabled: false,
    auto_settlement_time: "18:00",
    payout_method: "wallet",
    payout_wallet_id: "",
    payout_currency_id: "",
    payout_bank_account_no: "",
    payout_bank_name: "",
    payout_account_name: "",
    payout_bank_code: "",
    last_payout_at: null,
    last_payout_status: null,
  });
  const [wallets, setWallets] = React.useState<Wallet[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [settingsRes, walletsRes] = await Promise.all([
          authFetch(`${API}/user/settings/general`, { headers: tokenHeaders(), cache: "no-store" }),
          authFetch(`${API}/user/wallets`, { headers: tokenHeaders(), cache: "no-store" }),
        ]);

        const settingsJson = await settingsRes.json().catch(() => ({}));
        const walletsJson = await walletsRes.json().catch(() => ({}));

        if (!settingsRes.ok || settingsJson.error) {
          throw new Error(settingsJson.data || settingsJson.message || "Failed to load auto-settlement settings");
        }

        if (!cancelled) {
          const s = settingsJson.result ?? settingsJson.data ?? {};
          setSettings((prev) => ({
            ...prev,
            auto_settlement_enabled: Boolean(s.auto_settlement_enabled),
            auto_settlement_time: s.auto_settlement_time || "18:00",
            payout_method: s.payout_method || "wallet",
            payout_wallet_id: s.payout_wallet_id || "",
            payout_currency_id: s.payout_currency_id || "",
            payout_bank_account_no: s.payout_bank_account_no || "",
            payout_bank_name: s.payout_bank_name || "",
            payout_account_name: s.payout_account_name || "",
            payout_bank_code: s.payout_bank_code || "",
            last_payout_at: s.last_payout_at || null,
            last_payout_status: s.last_payout_status || null,
          }));

          const walletsData = walletsJson.data ?? walletsJson.result ?? [];
          setWallets(Array.isArray(walletsData) ? walletsData : []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load auto-settlement settings.";
          setError(message);
          notify(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [notify]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, any> = {
        auto_settlement_enabled: settings.auto_settlement_enabled,
        auto_settlement_time: settings.auto_settlement_time,
        payout_method: settings.payout_method,
      };

      if (settings.payout_method === "wallet") {
        body.payout_wallet_id = settings.payout_wallet_id;
        body.payout_currency_id = settings.payout_currency_id;
      } else {
        body.payout_bank_account_no = settings.payout_bank_account_no;
        body.payout_bank_name = settings.payout_bank_name;
        body.payout_account_name = settings.payout_account_name;
        body.payout_bank_code = settings.payout_bank_code;
      }

      const res = await authFetch(`${API}/client/settings/general`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...tokenHeaders() },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        throw new Error(json.data || json.message || "Failed to save auto-settlement settings");
      }

      const saved = json.result ?? json.data ?? {};
      setSettings((prev) => ({
        ...prev,
        ...saved,
      }));
      notify("Auto-settlement settings saved");
    } catch (err: any) {
      const message = err.message || "Failed to save auto-settlement settings";
      setError(message);
      notify(message);
    } finally {
      setSaving(false);
    }
  };

  const activeWallets = wallets.filter((w) => (w.status || "").toLowerCase() !== "inactive");

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9d8df1]">Finance</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Auto-Settlement</h1>
            <p className="mt-1 text-sm text-muted-foreground">Configure automatic payout schedule and destination.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <SectionLoader message="Loading auto-settlement…" variant="bars" />
          </div>
        )}

        {error && !loading && (
          <Card className="bg-[#19191d] border-border">
            <CardContent className="py-12 text-center text-sm text-red-400">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && (
          <form onSubmit={handleSave} className="space-y-6">
            <Card className="bg-[#19191d] border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-white">General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.auto_settlement_enabled}
                    onChange={(e) => setSettings((prev) => ({ ...prev, auto_settlement_enabled: e.target.checked }))}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-[#9d8df1] focus:ring-[#9d8df1]"
                  />
                  <span className="text-sm text-white/70">Enable auto-settlement</span>
                </label>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Payout time (24h)</label>
                  <input
                    type="time"
                    value={settings.auto_settlement_time}
                    onChange={(e) => setSettings((prev) => ({ ...prev, auto_settlement_time: e.target.value }))}
                    disabled={!settings.auto_settlement_enabled}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1] disabled:opacity-50"
                  />
                </div>
              </CardContent>
            </Card>

            {settings.auto_settlement_enabled && (
              <Card className="bg-[#19191d] border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-white">Payout method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex rounded-lg bg-[#19191d] w-fit h-10 border border-white/[0.08]">
                    {(["wallet", "bank"] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        className={`px-4 rounded-lg text-sm font-semibold transition-colors duration-150 ${settings.payout_method === method ? "bg-[#23243a] text-white shadow-inner" : "bg-transparent text-muted-foreground"}`}
                        onClick={() => setSettings((prev) => ({ ...prev, payout_method: method }))}
                      >
                        {method === "wallet" ? "Crypto Wallet" : "Bank Transfer"}
                      </button>
                    ))}
                  </div>

                  {settings.payout_method === "wallet" && (
                    <div className="space-y-2">
                      <label className="block text-xs text-white/40">Destination wallet</label>
                      <select
                        value={settings.payout_wallet_id}
                        onChange={(e) => setSettings((prev) => ({ ...prev, payout_wallet_id: e.target.value, payout_currency_id: "" }))}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1]"
                      >
                        <option value="">Select wallet</option>
                        {activeWallets.map((wallet) => (
                          <option key={wallet.uniqueId} value={wallet.uniqueId}>
                            {wallet.cryptoNetwork?.name} — {wallet.walletAddress.slice(0, 8)}...{wallet.walletAddress.slice(-6)} ({wallet.currency?.symbol})
                          </option>
                        ))}
                      </select>
                      {settings.payout_wallet_id && (
                        <div className="space-y-2">
                          <label className="block text-xs text-white/40">Currency</label>
                          <select
                            value={settings.payout_currency_id}
                            onChange={(e) => setSettings((prev) => ({ ...prev, payout_currency_id: e.target.value }))}
                            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1]"
                          >
                            <option value="">Select currency</option>
                            {activeWallets
                              .filter((w) => w.uniqueId === settings.payout_wallet_id)
                              .map((w) => (
                                <option key={w.currency?.symbol} value={w.currency?.symbol}>
                                  {w.currency?.name} ({w.currency?.symbol})
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {settings.payout_method === "bank" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Bank name</label>
                        <input
                          type="text"
                          value={settings.payout_bank_name}
                          onChange={(e) => setSettings((prev) => ({ ...prev, payout_bank_name: e.target.value }))}
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1]"
                          placeholder="GTBank"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Account name</label>
                        <input
                          type="text"
                          value={settings.payout_account_name}
                          onChange={(e) => setSettings((prev) => ({ ...prev, payout_account_name: e.target.value }))}
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1]"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Bank code</label>
                        <input
                          type="text"
                          value={settings.payout_bank_code}
                          onChange={(e) => setSettings((prev) => ({ ...prev, payout_bank_code: e.target.value }))}
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1]"
                          placeholder="058"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Account number</label>
                        <input
                          type="text"
                          value={settings.payout_bank_account_no}
                          onChange={(e) => setSettings((prev) => ({ ...prev, payout_bank_account_no: e.target.value }))}
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1]"
                          placeholder="0123456789"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={saving} className="bg-[#9d8df1] text-white">
                {saving ? "Saving..." : "Save Auto-Settlement"}
              </Button>
            </div>
          </form>
        )}

        {!loading && !error && settings.last_payout_at && (
          <Card className="bg-[#19191d] border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white">Last payout</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-sm text-white/70">
              <Clock className="h-4 w-4 text-[#9d8df1]" />
              <span>
                {new Date(settings.last_payout_at).toLocaleString()} — Status:{" "}
                <StatusBadge status={settings.last_payout_status} />
              </span>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-white/40">-</span>;
  const lower = status.toLowerCase();
  const icon = lower === "completed" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : lower === "failed" ? <XCircle className="h-4 w-4 text-red-400" /> : <Loader2 className="h-4 w-4 text-amber-400" />;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
      lower === "completed" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : lower === "failed" ? "bg-red-500/15 text-red-400 border border-red-500/25" : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
    }`}>
      {icon}
      {status}
    </span>
  );
}
