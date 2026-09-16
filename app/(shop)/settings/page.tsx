"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionLoader } from "@/components/ui/LoadingAnimator";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";
import { Truck } from "lucide-react";

const API = "/backend";

function tokenHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") || localStorage.getItem("token") || "" : "";
  return { Authorization: `Bearer ${token}` };
}

export default function ShopSettingsPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState({
    has_free_delivery: false,
    delivery_fee: "",
    free_delivery_threshold: "",
  });

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    async function load() {
      try {
        const res = await authFetch(`${API}/user/shop/delivery-settings`, { headers: tokenHeaders() });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.result) {
          if (!cancelled) {
            setSettings({
              has_free_delivery: Boolean(json.result.has_free_delivery),
              delivery_fee: json.result.delivery_fee != null ? String(json.result.delivery_fee) : "",
              free_delivery_threshold: json.result.free_delivery_threshold != null ? String(json.result.free_delivery_threshold) : "",
            });
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [notify]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        has_free_delivery: settings.has_free_delivery,
        delivery_fee: settings.delivery_fee === "" ? 0 : Number(settings.delivery_fee),
        free_delivery_threshold: settings.free_delivery_threshold === "" ? 0 : Number(settings.free_delivery_threshold),
      };
      const res = await authFetch(`${API}/user/shop/delivery-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...tokenHeaders() },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        notify("Delivery settings saved");
      } else {
        notify(json.data || json.message || "Failed to save delivery settings");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9d8df1]">Configuration</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Shop settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage delivery settings for your storefront.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <SectionLoader message="Loading settings…" variant="bars" />
          </div>
        ) : (
          <Card className="bg-[#19191d] border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.12)" }}>
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <CardTitle className="text-base font-semibold text-white">Delivery Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.has_free_delivery}
                    onChange={(e) => setSettings((prev) => ({ ...prev, has_free_delivery: e.target.checked }))}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-white/70">Enable free delivery</span>
                </label>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Delivery fee (NGN)</label>
                  <input
                    type="number"
                    value={settings.delivery_fee}
                    onChange={(e) => setSettings((prev) => ({ ...prev, delivery_fee: e.target.value }))}
                    disabled={settings.has_free_delivery}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-amber-500 disabled:opacity-50"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Free delivery threshold (NGN)</label>
                  <input
                    type="number"
                    value={settings.free_delivery_threshold}
                    onChange={(e) => setSettings((prev) => ({ ...prev, free_delivery_threshold: e.target.value }))}
                    disabled={settings.has_free_delivery}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-amber-500 disabled:opacity-50"
                    placeholder="0"
                  />
                  <p className="text-[11px] text-white/25 mt-1">Customers get free delivery when their order total meets this amount.</p>
                </div>
                <Button type="submit" disabled={saving} className="bg-[#9d8df1] text-white">
                  {saving ? "Saving..." : "Save Delivery Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
