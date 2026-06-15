"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { authFetch } from "@/lib/auth-fetch";
import { Eye, EyeOff, Copy, RefreshCw, Lock, ShieldCheck, Clock, AlertTriangle } from "lucide-react";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("authToken") || localStorage.getItem("token") || ""
    : "";
}

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${getToken()}`, ...extra };
}

/* Live countdown for test key expiry */
function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining("");
      setExpired(false);
      return;
    }
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Expired");
        setExpired(true);
        return;
      }
      setExpired(false);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return { remaining, expired };
}

export default function ApiKeysSection({ environment }: { environment: "test" | "live" }) {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [secretShown, setSecretShown] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [requiresVerification, setRequiresVerification] = useState(false);

  const isLive = environment === "live";
  const isTest = environment === "test";

  const { remaining, expired } = useCountdown(isTest ? expiresAt : null);

  const loadApiKey = useCallback(async () => {
    setLoading(true);
    setRequiresVerification(false);
    try {
      const res = await authFetch(
        `${API}/api/user/settings/api-key?environment=${environment.toUpperCase()}`,
        { headers: authHeaders() }
      );
      const json = await res.json().catch(() => ({}));

      // Backend returns { error: true, data: "...", code: 403, requires_verification: true }
      // requires_verification is at the root level, not under json.result.
      if (res.status === 403 || json.requires_verification === true) {
        setRequiresVerification(true);
        setPublicKey(null);
        setExpiresAt(null);
      } else if (res.ok && json.result) {
        const responseEnv = (json.result.environment || "").toUpperCase();
        const expectedEnv = environment.toUpperCase();
        // If we requested LIVE but got a TEST key back, the user isn't verified
        // (backend returns 200+TEST instead of 403 in this case).
        if (isLive && responseEnv && responseEnv !== expectedEnv) {
          setRequiresVerification(true);
          setPublicKey(null);
          setExpiresAt(null);
        } else {
          setPublicKey(json.result.public_key || null);
          setExpiresAt(json.result.expires_at || null);
          setPrivateKey(null);
          setSecretShown(false);
        }
      } else {
        setPublicKey(null);
        setExpiresAt(null);
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error loading API key");
    } finally {
      setLoading(false);
    }
  }, [environment]);

  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

  const handleGenerateKey = async () => {
    if (!confirm("Generating a new key pair will replace your current keys. Continue?")) return;
    setGenerating(true);
    try {
      const res = await authFetch(
        `${API}/api/user/settings/api-key?environment=${environment.toUpperCase()}`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );
      const json = await res.json().catch(() => ({}));

      // Backend returns { error: true, data: "...", code: 403, requires_verification: true }
      // requires_verification is at the root level, not under json.result.
      if (res.status === 403 || json.requires_verification === true) {
        setRequiresVerification(true);
        // Show the exact message from the backend if available
        notify(json.data || "Live API keys require a verified account");
      } else if (res.ok && json.result) {
        const responseEnv = (json.result.environment || "").toUpperCase();
        const expectedEnv = environment.toUpperCase();
        // If we requested LIVE but got a TEST key back, treat as unverified.
        if (isLive && responseEnv && responseEnv !== expectedEnv) {
          setRequiresVerification(true);
          notify("Your account must be verified before you can generate Live API keys.");
        } else {
          setPublicKey(json.result.public_key);
          setPrivateKey(json.result.private_key);
          setSecretShown(true);
          setExpiresAt(json.result.expires_at || null);
          notify("API keys generated successfully!");
        }
      } else {
        notify(json.data || "Failed to generate API key");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error generating API key");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    notify(`${label} copied!`);
  };

  /* Loading */
  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="bg-[#19191d] rounded-2xl p-8 border border-[#23242A] text-center text-muted-foreground">
          Loading {isLive ? "live" : "test"} API keys...
        </div>
      </div>
    );
  }

  /* Live gate — account not verified */
  if (isLive && requiresVerification) {
    return (
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="bg-[#19191d] rounded-2xl border border-[#23242A] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[#23242A]">
            <div>
              <h2 className="text-lg font-semibold text-white">API Keys</h2>
              <p className="text-sm text-muted-foreground mt-1">Live Mode</p>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/50">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              LIVE
            </span>
          </div>

          <div className="p-10 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#23242A] flex items-center justify-center">
              <Lock className="w-8 h-8 text-white/30" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base mb-2">Account Verification Required</h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Live API keys are only available to verified accounts. Complete account verification to unlock live mode and go into production.
              </p>
            </div>
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm text-left max-w-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Your account is not yet verified. Contact support or complete KYC to unlock live mode.</p>
            </div>
            <p className="text-xs text-muted-foreground">
              You can still use{" "}
              <span className="text-[#9d8df1] font-medium">Test Mode</span> to integrate and build.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* Main view */
  return (
    <div className="w-full max-w-5xl mx-auto mb-6">
      <div className="bg-[#19191d] rounded-2xl border border-[#23242A] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23242A]">
          <div>
            <h2 className="text-lg font-semibold text-white">API Keys</h2>
            <p className="text-sm text-muted-foreground mt-1">{isLive ? "Live Mode" : "Test Mode"}</p>
          </div>
          <div className="flex items-center gap-3">
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            )}
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                isLive
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-blue-400" : "bg-yellow-400"}`} />
              {isLive ? "LIVE" : "TEST"}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Test key expiry banner */}
          {isTest && expiresAt && (
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                expired
                  ? "bg-red-500/10 border-red-500/25 text-red-400"
                  : "bg-amber-500/10 border-amber-500/25 text-amber-400"
              }`}
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {expired ? (
                    "Test key has expired"
                  ) : (
                    <>
                      Test key expires in{" "}
                      <span className="font-mono text-white">{remaining}</span>
                    </>
                  )}
                </p>
                <p className="text-xs opacity-70 mt-0.5">
                  {expired
                    ? "Generate new test keys to continue testing."
                    : "Test API keys automatically expire every 2 hours."}
                </p>
              </div>
              {expired && (
                <button
                  onClick={handleGenerateKey}
                  disabled={generating}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {generating ? "..." : "Regenerate"}
                </button>
              )}
            </div>
          )}

          {/* No key state */}
          {!publicKey && !expired && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No API keys generated yet.
            </div>
          )}

          {/* Public Key */}
          {publicKey && !expired && (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Public Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={publicKey}
                  disabled
                  className="flex-1 bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white/50 focus:outline-none cursor-not-allowed font-mono text-sm"
                />
                <button
                  onClick={() => handleCopy(publicKey, "Public key")}
                  className="p-2.5 bg-[#23242A] hover:bg-[#2a2a32] rounded-lg transition-colors"
                  title="Copy public key"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Private Key — shown once only after generation */}
          {privateKey && secretShown && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-red-400">Private Key — Save Now</h3>
              </div>
              <p className="text-xs text-red-300/70 mb-3">
                This is your secret key. Copy and store it securely — it will <strong>not</strong> be shown again.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type={showSecret ? "text" : "password"}
                  value={privateKey}
                  disabled
                  className="flex-1 bg-[#11111a] border border-red-500/30 rounded-lg px-4 py-2.5 text-red-400 focus:outline-none cursor-not-allowed font-mono text-sm"
                />
                <button
                  onClick={() => setShowSecret((v) => !v)}
                  className="p-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  {showSecret ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4 text-red-400" />}
                </button>
                <button
                  onClick={() => handleCopy(privateKey, "Private key")}
                  className="p-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          )}

          {/* Generate / Regenerate button */}
          <div className="flex justify-end pt-2 border-t border-[#23242A]">
            <button
              onClick={handleGenerateKey}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all text-white"
              style={{
                background: generating ? "rgba(79,79,143,0.3)" : "linear-gradient(135deg,#9d8df1,#5b4dd4)",
                opacity: generating ? 0.6 : 1,
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Generating..." : publicKey ? "Regenerate Keys" : "Generate Keys"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
