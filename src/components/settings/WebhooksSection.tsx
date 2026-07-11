"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { authFetch } from "@/lib/auth-fetch";
import { Eye, EyeOff, Copy, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${getToken()}`, ...extra };
}

export default function WebhooksSection() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [liveUrl, setLiveUrl] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [signingSecret, setSigningSecret] = useState<string | null>(null);
  const [hasSigningSecret, setHasSigningSecret] = useState(false);
  const [secretShown, setSecretShown] = useState(false);

  const [testResults, setTestResults] = useState<{
    live?: { reachable: boolean; status_code?: number; error?: string };
    test?: { reachable: boolean; status_code?: number; error?: string };
  }>({});

  useEffect(() => {
    loadWebhookConfig();
  }, []);

  const loadWebhookConfig = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/user/settings/webhook`, {
        headers: authHeaders(),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.result) {
        setLiveUrl(json.result.live?.url || "");
        setTestUrl(json.result.test?.url || "");
        setHasSigningSecret(json.result.has_signing_secret || false);
      } else {
        notify(json.data || "Failed to load webhook config");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error loading webhook config");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUrl = async (environment: "LIVE" | "TEST") => {
    const url = environment === "LIVE" ? liveUrl : testUrl;

    if (!url) {
      notify("Please enter a webhook URL");
      return;
    }

    if (!url.startsWith("https://")) {
      notify("Webhook URL must use HTTPS");
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch(`${API}/user/settings/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ url, environment }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        notify(`${environment} webhook URL saved!`);
      } else {
        notify(json.data || "Failed to save webhook URL");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error saving webhook URL");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async (environment: "LIVE" | "TEST") => {
    setTesting(true);
    try {
      const res = await authFetch(`${API}/user/settings/webhook/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ environment }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.result) {
        setTestResults((prev) => ({ ...prev, [environment.toLowerCase()]: json.result }));
        notify(
          json.result.reachable
            ? `${environment} webhook is reachable ✓`
            : `${environment} webhook is not reachable`
        );
      } else {
        notify(json.data || "Failed to test webhook");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error testing webhook");
      }
    } finally {
      setTesting(false);
    }
  };

  const handleGenerateSecret = async () => {
    if (!confirm("Generating a new signing secret will invalidate the old one. Continue?")) return;

    setGenerating(true);
    try {
      const res = await authFetch(`${API}/user/settings/webhook/secret/generate`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.result) {
        setSigningSecret(json.result.signing_secret);
        setSecretShown(true);
        setHasSigningSecret(true);
        notify("Signing secret generated! Copy it now.");
      } else {
        notify(json.data || "Failed to generate signing secret");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error generating signing secret");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    notify(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="bg-[#19191d] rounded-2xl p-8 border border-[#23242A] text-center py-12 text-muted-foreground">
          Loading webhook configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mb-6 space-y-6">
      {/* Webhook URLs */}
      <div className="bg-[#19191d] rounded-2xl p-8 border border-[#23242A]">
        <h2 className="text-lg font-semibold text-white mb-6 pb-4 border-b border-[#23242A]">
          Webhook URLs
        </h2>

        {/* LIVE Environment */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/50">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              LIVE
            </span>
          </div>
          <label className="block text-sm text-muted-foreground mb-2">Webhook URL (HTTPS only)</label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://myapp.com/webhook"
              className="flex-1 bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1] placeholder-muted-foreground"
            />
            <button
              onClick={() => handleSaveUrl("LIVE")}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg font-semibold transition-all"
              style={{
                background: saving ? "rgba(79,79,143,0.3)" : "linear-gradient(135deg,#9d8df1,#5b4dd4)",
                color: "#fff",
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          {testResults.live && (
            <div
              className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                testResults.live.reachable
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {testResults.live.reachable ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {testResults.live.reachable
                ? `Reachable (${testResults.live.status_code})`
                : `Not reachable${testResults.live.error ? `: ${testResults.live.error}` : ""}`}
            </div>
          )}
          <button
            onClick={() => handleTestWebhook("LIVE")}
            disabled={testing || !liveUrl}
            className="mt-3 px-4 py-2 text-sm border border-[#23242A] rounded-lg text-muted-foreground hover:text-white hover:border-[#9d8df1] transition-colors disabled:opacity-50"
          >
            Test Connection
          </button>
        </div>

        {/* TEST Environment */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              TEST
            </span>
          </div>
          <label className="block text-sm text-muted-foreground mb-2">Webhook URL (HTTPS only)</label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://myapp.com/webhook"
              className="flex-1 bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1] placeholder-muted-foreground"
            />
            <button
              onClick={() => handleSaveUrl("TEST")}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg font-semibold transition-all"
              style={{
                background: saving ? "rgba(79,79,143,0.3)" : "linear-gradient(135deg,#9d8df1,#5b4dd4)",
                color: "#fff",
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          {testResults.test && (
            <div
              className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                testResults.test.reachable
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {testResults.test.reachable ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {testResults.test.reachable
                ? `Reachable (${testResults.test.status_code})`
                : `Not reachable${testResults.test.error ? `: ${testResults.test.error}` : ""}`}
            </div>
          )}
          <button
            onClick={() => handleTestWebhook("TEST")}
            disabled={testing || !testUrl}
            className="mt-3 px-4 py-2 text-sm border border-[#23242A] rounded-lg text-muted-foreground hover:text-white hover:border-[#9d8df1] transition-colors disabled:opacity-50"
          >
            Test Connection
          </button>
        </div>
      </div>

      {/* Signing Secret */}
      <div className="bg-[#19191d] rounded-2xl p-8 border border-[#23242A]">
        <h2 className="text-lg font-semibold text-white mb-6 pb-4 border-b border-[#23242A]">
          Signing Secret
        </h2>

        {hasSigningSecret && !signingSecret && (
          <p className="text-sm text-muted-foreground mb-4">
            ✓ You have a signing secret. Generate a new one to rotate it.
          </p>
        )}

        {signingSecret && secretShown && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-amber-400">⚠️ Signing Secret (Save Now)</h3>
            </div>
            <p className="text-xs text-amber-300/80 mb-3">
              Save this securely in your `.env` file as `WT_WEBHOOK_SECRET` — it will not be shown again.
            </p>
            <div className="flex items-center gap-2">
              <input
                type={showSecret ? "text" : "password"}
                value={signingSecret}
                disabled
                className="flex-1 bg-[#11111a] border border-amber-500/30 rounded-lg px-4 py-2.5 text-amber-400 focus:outline-none cursor-not-allowed font-mono text-sm"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-2.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
              >
                {showSecret ? (
                  <EyeOff className="w-4 h-4 text-amber-400" />
                ) : (
                  <Eye className="w-4 h-4 text-amber-400" />
                )}
              </button>
              <button
                onClick={() => handleCopy(signingSecret, "Signing secret")}
                className="p-2.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-[#23242A]">
          <button
            onClick={handleGenerateSecret}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all"
            style={{
              background: generating ? "rgba(79,79,143,0.3)" : "linear-gradient(135deg,#9d8df1,#5b4dd4)",
              color: "#fff",
              opacity: generating ? 0.6 : 1,
              cursor: generating ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw className="w-4 h-4" />
            {generating ? "Generating..." : "Generate / Rotate Secret"}
          </button>
        </div>
      </div>
    </div>
  );
}
