"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastProvider";
import { authFetch } from "@/lib/auth-fetch";
import { Plus, RefreshCw, ExternalLink, Copy, Check } from "lucide-react";

const API = "/backend";

type PaymentLink = {
  id: string;
  slug: string;
  title?: string;
  description?: string;
  amount?: number;
  currency?: string;
  usage_count?: number;
  order_count?: number;
  revenue?: number;
  is_active?: boolean;
  created_at?: string;
};

export default function PaymentLinksPage() {
  const { notify } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [links, setLinks] = React.useState<PaymentLink[]>([]);
  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    amount: "",
    currency: "NGN",
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/client/payment-links`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        throw new Error(json.data || json.message || "Failed to load payment links");
      }
      const data = json.result ?? json.data ?? [];
      setLinks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notify(err.message || "Failed to load payment links");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  React.useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    setCreating(true);
    try {
      const res = await authFetch(`${API}/client/payment-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          amount: Number(form.amount),
          currency: form.currency,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        throw new Error(json.data || json.message || "Failed to create payment link");
      }
      notify("Payment link created");
      setForm({ title: "", description: "", amount: "", currency: "NGN" });
      load();
    } catch (err: any) {
      notify(err.message || "Failed to create payment link");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async (slug: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${slug}`;
    await navigator.clipboard.writeText(url);
    notify("Link copied to clipboard");
  };

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9d8df1]">Payments</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Payment links</h1>
            <p className="mt-1 text-sm text-muted-foreground">Create and manage payment links for customers.</p>
          </div>
          <Button onClick={load} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </header>

        <Card className="bg-[#19191d] border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Create payment link</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <input
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1] lg:col-span-2"
                placeholder="Link title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
              <input
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1]"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
              <input
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1]"
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                required
              />
              <select
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#9d8df1]"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <div className="lg:col-span-5">
                <Button type="submit" disabled={creating} className="bg-[#9d8df1] text-white">
                  <Plus className="h-4 w-4 mr-2" /> {creating ? "Creating..." : "Create link"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[#19191d] border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Your links</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-white/35 text-center py-8">Loading links...</p>
            ) : links.length === 0 ? (
              <p className="text-sm text-white/35 text-center py-8">No payment links yet. Create one above.</p>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {links.map((link) => (
                  <div key={link.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm text-white">{link.title || link.slug}</p>
                      <p className="text-xs text-white/40">{link.slug}</p>
                      {link.description && <p className="text-xs text-white/35 mt-1">{link.description}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-white/60">
                        <p>{link.usage_count ?? 0} visits</p>
                        <p>{link.order_count ?? 0} orders · {(link.revenue || 0).toLocaleString()} {link.currency || "NGN"}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(link.slug)}
                        className="gap-1 text-xs"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/pay/${link.slug}`, "_blank")}
                        className="gap-1 text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
