"use client";

import React, { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { authFetch } from "@/lib/auth-fetch";
import {
  Send,
  Plus,
  RefreshCw,
  X,
  Globe,
  Loader2,
  Sparkles,
  Store,
  ImageIcon,
  Palette,
  ExternalLink,
  Zap,
  Package,
  CreditCard,
  Bot,
} from "lucide-react";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("authToken") || localStorage.getItem("token") || ""
    : "";
}

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${getToken()}`, ...extra };
}

function sanitizeShopUrls(shop: Record<string, any>): Record<string, any> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const replaceLocalhost = (url: string | null | undefined): string | null | undefined => {
    if (!url || typeof url !== "string") return url;
    if (/https?:\/\/localhost(:\d+)?\//i.test(url)) {
      return url.replace(/https?:\/\/[^\/]+/, origin);
    }
    return url;
  };

  const sanitized = { ...shop };
  if (sanitized.shop_url) sanitized.shop_url = replaceLocalhost(sanitized.shop_url);
  if (sanitized.storefront_url) sanitized.storefront_url = replaceLocalhost(sanitized.storefront_url);
  if (sanitized.preview?.url) sanitized.preview = { ...sanitized.preview, url: replaceLocalhost(sanitized.preview.url) };
  if (sanitized.preview?.iframe_src) sanitized.preview = { ...sanitized.preview, iframe_src: replaceLocalhost(sanitized.preview.iframe_src) };

  return sanitized;
}

type Shop = {
  id: string;
  business_name: string;
  subdomain: string;
  shop_url: string;
  storefront_url?: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  theme_config: Record<string, any>;
  status: "draft" | "published";
  currency: string;
  shop_type?: string;
  template?: string;
  features?: Record<string, any>;
  customization_access?: {
    required: boolean;
    paid: boolean;
    paid_at: string | null;
    payment_reference_id: string | null;
  };
  payment_gateway?: {
    enabled: boolean;
    payment_link_id: string | null;
    checkout_url: string | null;
  };
  preview?: {
    url: string;
    iframe_src: string;
    is_live: boolean;
  };
  created_at?: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

function ShopPreviewModal({
  shop,
  onClose,
}: {
  shop: Shop;
  onClose: () => void;
}) {
  const preview = shop.preview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-6xl max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden bg-[#111119] flex flex-col">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-lg font-semibold text-white">Shop Preview</h3>
            <p className="text-xs text-white/40">Preview your storefront before sharing it publicly.</p>
          </div>
          <div className="flex items-center gap-2">
            {preview?.url && (
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-white/[0.05] hover:bg-white/[0.08] transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in new tab
              </a>
            )}
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[360px] bg-[#0c0c12]">
          {preview?.is_live && preview.iframe_src ? (
            <iframe
              src={preview.iframe_src}
              title={`${shop.business_name || "Shop"} preview`}
              className="w-full h-[70vh] min-h-[360px] border-0"
            />
          ) : (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center px-6 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-white/[0.04] border border-white/[0.06]">
                <Globe className="w-7 h-7 text-white/45" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Publish your shop to preview it</h4>
              <p className="text-sm text-white/45 max-w-md leading-relaxed">
                This shop preview is not live yet. Once the shop is published, the live storefront will appear here inside the modal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Create Shop Modal ─── */

function CreateShopModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (shop: Shop) => void;
}) {
  const { notify } = useToast();
  const [creating, setCreating] = useState(false);
  const [selection, setSelection] = useState<"default" | "customized">("default");
  const [form, setForm] = useState({
    business_name: "",
    subdomain: "",
    description: "",
    currency: "NGN",
    primaryColor: "#9d8df1",
    accentColor: "#f59e0b",
    shop_type: "default",
    template: "yanga-default",
  });

  const templates = [
    { value: "yanga-default", label: "Default Shop", desc: "Basic storefront with essential features" },
    { value: "fashion-store", label: "Fashion Store", desc: "Optimized for fashion/apparel with lookbooks" },
    { value: "digital-goods", label: "Digital Goods", desc: "For digital products and online services" },
    { value: "service-booking", label: "Service Booking", desc: "For service-based businesses" },
    { value: "ai-custom", label: "AI Custom", desc: "Fully AI-generated custom storefront", paid: true },
  ];

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40);

  const handleBusinessNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      business_name: value,
      subdomain:
        prev.subdomain === "" || prev.subdomain === autoSlug(prev.business_name)
          ? autoSlug(value)
          : prev.subdomain,
    }));
  };

  const handleSubdomainChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      subdomain: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const handleTemplateChange = (templateValue: string) => {
    const isCustom = templateValue === "ai-custom";
    setForm((prev) => ({
      ...prev,
      template: templateValue,
      shop_type: isCustom ? "ai_custom" : "default",
    }));
    setSelection(isCustom ? "customized" : "default");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name.trim()) { notify("Business name is required"); return; }
    if (!form.subdomain.trim()) { notify("Subdomain is required"); return; }
    setCreating(true);
    try {
      const res = await authFetch(`${API}/user/shop`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          business_name: form.business_name,
          subdomain: form.subdomain,
          description: form.description,
          currency: form.currency,
          template: form.template,
          shop_type: form.shop_type,
          theme_config: {
            primaryColor: form.primaryColor,
            accentColor: form.accentColor,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result) {
        notify("Shop created successfully!");
        onCreate(json.result);
      } else {
        notify(json.data || json.message || "Failed to create shop");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error creating shop");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-5xl max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] rounded-3xl border border-white/[0.08] shadow-2xl overflow-y-auto overscroll-contain"
        style={{ background: "linear-gradient(145deg,#1a1a24 0%,#15151f 100%)" }}
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#9d8df1,#5b4dd4,#7c3aed)" }} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)" }}>
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Create Your Shop</h2>
              <p className="text-xs text-white/40">Set up your online storefront</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all self-end sm:self-auto">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Choose Template</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((tpl) => {
                const active = form.template === tpl.value;
                return (
                  <button
                    key={tpl.value}
                    type="button"
                    onClick={() => handleTemplateChange(tpl.value)}
                    className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? tpl.paid
                          ? "border-amber-400/70 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.22)]"
                          : "border-[#9d8df1]/70 bg-[#9d8df1]/10 shadow-[0_0_0_1px_rgba(157,141,241,0.25)]"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.18] hover:bg-white/[0.05]"
                    }`}
                  >
                    {tpl.paid && (
                      <span className="absolute right-3 top-3 rounded-full border border-amber-400/30 bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                        Paid
                      </span>
                    )}
                    <div className="flex items-start gap-2.5">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold ${active ? (tpl.paid ? "bg-amber-400/15 text-amber-200" : "bg-[#9d8df1]/15 text-[#c7bfff]") : "bg-white/[0.06] text-white/60"}`}>
                        {templates.indexOf(tpl) + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{tpl.label}</h3>
                        <p className="text-xs text-white/45 leading-relaxed mt-0.5">{tpl.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-white/25">
              {form.template === "ai-custom"
                ? "AI custom mode is premium and requires payment unlock before AI customization features are used."
                : "Default mode launches the standard shop experience immediately."}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Business Name *</label>
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => handleBusinessNameChange(e.target.value)}
              placeholder="e.g., Adaeze Fabrics"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#9d8df1]/60 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Subdomain *</label>
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-[#9d8df1]/60 transition-all">
              <input
                type="text"
                value={form.subdomain}
                onChange={(e) => handleSubdomainChange(e.target.value)}
                placeholder="adaeze-fabrics"
                className="flex-1 bg-transparent px-4 py-3 text-white text-sm focus:outline-none"
              />
              <span className="px-3 py-3 text-xs text-white/30 border-l border-white/[0.06] bg-white/[0.03] whitespace-nowrap">.yourdomain.com</span>
            </div>
            <p className="text-xs text-white/25">Lowercase letters, numbers, and hyphens only</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe what you sell..."
              rows={3}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#9d8df1]/60 transition-all placeholder:text-white/20 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#9d8df1]/60 transition-all"
            >
              <option value="NGN">NGN - Nigerian Naira</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="KES">KES - Kenyan Shilling</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Brand Colors</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3">
                <span className="w-8 h-8 rounded-lg border border-white/10" style={{ background: form.primaryColor }} />
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Primary</p>
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="mt-1 h-8 w-full bg-transparent cursor-pointer"
                  />
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3">
                <span className="w-8 h-8 rounded-lg border border-white/10" style={{ background: form.accentColor }} />
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Accent</p>
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setForm((p) => ({ ...p, accentColor: e.target.value }))}
                    className="mt-1 h-8 w-full bg-transparent cursor-pointer"
                  />
                </div>
              </label>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl" style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.accentColor})` }} />
              <div>
                <p className="text-sm text-white font-medium">Live brand preview</p>
                <p className="text-xs text-white/35">Your shop button, highlight, and theme accents will use these colors.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-medium text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: creating ? "rgba(91,77,212,0.4)" : selection === "customized" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#9d8df1,#5b4dd4)" }}
            >
              {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Sparkles className="w-4 h-4" /> Create {templates.find(t => t.value === form.template)?.label || "Shop"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function ShopBuilderPage() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingReply, setStreamingReply] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeDraft, setThemeDraft] = useState({
    primaryColor: "#9d8df1",
    accentColor: "#f59e0b",
  });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadShopData(); }, []);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingReply]);
  useEffect(() => {
    if (!shop) return;
    setThemeDraft({
      primaryColor: shop.theme_config?.primaryColor || "#9d8df1",
      accentColor: shop.theme_config?.accentColor || "#f59e0b",
    });
  }, [shop]);

  const loadShopData = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/user/shop`, { headers: authHeaders() });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result) {
        setShop(sanitizeShopUrls(json.result) as Shop);
        loadConversationHistory();
      } else {
        setShop(null);
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error loading shop data");
    } finally {
      setLoading(false);
    }
  };

  const loadConversationHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await authFetch(`${API}/user/shop/ai/history`, { headers: authHeaders() });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result?.messages) setMessages(json.result.messages);
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") console.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !shop || sending) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSending(true);
    setStreamingReply("");
    try {
      const res = await fetch(`${API}/user/shop/ai/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ message: userMessage }),
      });
      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}));
        notify(json.data || json.message || "Failed to chat with AI");
        setMessages((prev) => prev.slice(0, -1));
        setSending(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reply = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(event.slice(6));
            if (parsed.type === "token") {
              reply += parsed.content;
              setStreamingReply(reply);
            } else if (parsed.type === "action" && parsed.action?.action === "update_theme") {
              notify("Theme updated by AI!");
              loadShopData();
            } else if (parsed.type === "error") {
              notify(parsed.message || "AI error occurred");
            }
          } catch { /* skip */ }
        }
      }
      if (reply) setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error sending message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
      setStreamingReply("");
    }
  };

  const handleResetMemory = async () => {
    if (!confirm("Reset conversation history? The AI will start fresh.")) return;
    try {
      const res = await authFetch(`${API}/user/shop/ai/memory`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) { setMessages([]); notify("Conversation history cleared"); }
      else notify("Failed to reset conversation");
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error resetting conversation");
    }
  };

  const handleSaveTheme = async () => {
    if (!shop) return;
    setSavingTheme(true);
    try {
      const res = await authFetch(`${API}/user/shop`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          theme_config: {
            ...(shop.theme_config || {}),
            primaryColor: themeDraft.primaryColor,
            accentColor: themeDraft.accentColor,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result) {
        setShop((prev) => (prev ? { ...prev, ...json.result } : prev));
        notify("Theme updated");
      } else {
        notify(json.data || json.message || "Failed to update theme");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error updating theme");
    } finally {
      setSavingTheme(false);
    }
  };

  const handleImageUpload = async (file: File, type: "logo" | "banner", setUploading: (v: boolean) => void) => {
    const maxMB = type === "banner" ? 10 : 5;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { notify("Please upload a JPG, PNG, or WebP image"); return; }
    if (file.size > maxMB * 1024 * 1024) { notify(`Image must be under ${maxMB}MB`); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append(type, file);
      const res = await authFetch(`${API}/user/shop/${type}`, { method: "POST", headers: authHeaders(), body: form });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result) {
        setShop((prev) => (prev ? { ...prev, ...json.result } : prev));
        notify(`${type === "logo" ? "Logo" : "Banner"} updated!`);
      } else { notify(json.data || json.message || `Failed to upload ${type}`); }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify(`Error uploading ${type}`);
    } finally {
      setUploading(false);
    }
  };

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)", boxShadow: "0 0 40px rgba(157,141,241,0.3)" }}>
            <Store className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">Loading your shop</p>
            <p className="text-white/40 text-sm">Fetching your storefront data...</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {[0, 0.15, 0.3].map((d) => (
              <span key={d} className="w-2 h-2 rounded-full bg-[#9d8df1] animate-bounce" style={{ animationDelay: `${d}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* Empty state */
  if (!shop) {
    return (
      <div className="min-h-screen bg-[#0e0e10] p-4 sm:p-8">
        <div className="max-w-5xl mx-auto pt-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)" }}>
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Shop Builder</h1>
              <p className="text-white/40 text-xs">AI-powered storefront creator</p>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/[0.06]" style={{ background: "linear-gradient(135deg,#13101e 0%,#0f0e1a 40%,#0d1020 100%)" }}>
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#9d8df1 0%,#5b4dd4 50%,transparent 70%)" }} />
            <div className="relative z-10 p-8 sm:p-14 text-center">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center" style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)", boxShadow: "0 0 60px rgba(157,141,241,0.35)" }}>
                  <Store className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -right-2 -top-2 w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Launch Your Online Shop</h2>
              <p className="text-white/50 text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                Create a professional storefront in minutes. Powered by AI — just describe your vision and watch it come to life.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 max-w-2xl mx-auto">
                {[
                  { icon: Bot, label: "AI Design", desc: "Describe & deploy" },
                  { icon: Globe, label: "Custom Domain", desc: "Your own URL" },
                  { icon: Package, label: "Products", desc: "Unlimited items" },
                  { icon: CreditCard, label: "Crypto Payments", desc: "Multi-chain" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="rounded-2xl border border-white/[0.06] p-4 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="w-9 h-9 rounded-xl mx-auto mb-2.5 flex items-center justify-center" style={{ background: "rgba(157,141,241,0.15)" }}>
                      <Icon className="w-4 h-4 text-[#9d8df1]" />
                    </div>
                    <p className="text-white text-xs font-semibold">{label}</p>
                    <p className="text-white/35 text-xs mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-white text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)", boxShadow: "0 8px 32px rgba(91,77,212,0.45)" }}
              >
                <Sparkles className="w-5 h-5" /> Create Your Shop
              </button>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <CreateShopModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(newShop) => { setShop(newShop); setShowCreateModal(false); }}
          />
        )}
      </div>
    );
  }

  /* Shop page */
  const themeColor = shop.theme_config?.primaryColor || "#9d8df1";
  const isCustomizingPaid = Boolean(shop.customization_access?.paid);
  const customizationRequired = Boolean(shop.customization_access?.required);
  const hasThemeConfig = Object.keys(shop.theme_config || {}).length > 0;
  const isAiCustomShop = shop.shop_type === "ai_custom";
  const chatLocked = isAiCustomShop && customizationRequired && !isCustomizingPaid;
  // Use best available URL; fall back to constructing from subdomain for shops
  // created before the backend URL-generation fix
  const resolveShopUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const candidates = [
      shop.preview?.url,
      shop.storefront_url,
      shop.shop_url,
      shop.subdomain ? `${origin}/shop/${shop.subdomain}` : "",
    ].filter(Boolean);

    for (const url of candidates) {
      if (!/https?:\/\/localhost(:\d+)?\//i.test(url || "")) return url;
    }
    return candidates[candidates.length - 1] || "";
  };

  const shopPreviewUrl = resolveShopUrl();
  const shopPreviewIframe = shop.preview?.iframe_src || shop.preview?.url || shop.storefront_url || shopPreviewUrl;
  const isPreviewLive = Boolean(shop.preview?.is_live) || Boolean(shop.storefront_url) || Boolean(shop.shop_url) || Boolean(shop.subdomain);
  const openCreateModalLabel = shop ? "Launch New Shop" : "Create Shop";
  const suggestions = [
    "Make it look modern and minimal",
    "Use dark blue and gold theme",
    "Give it a luxury premium feel",
    "Make it bold and colorful",
    "Add a clean white theme",
  ];

  return (
    <div className="min-h-screen bg-[#0e0e10]">
      {showCreateModal && (
        <CreateShopModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(newShop) => { setShop(newShop); setShowCreateModal(false); }}
        />
      )}
      {showPreviewModal && shop && (
        <ShopPreviewModal
          shop={shop}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "logo", setUploadingLogo); e.target.value = ""; }} />
      <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "banner", setUploadingBanner); e.target.value = ""; }} />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/[0.05]" style={{ background: "linear-gradient(135deg,#13101e 0%,#0f0e1a 50%,#0e0e10 100%)" }}>
        <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: themeColor }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none" style={{ background: "#9d8df1" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group flex-shrink-0">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 flex items-center justify-center"
                  style={{ borderColor: `${themeColor}50`, background: shop.logo_url ? undefined : `linear-gradient(135deg,${themeColor}30,${themeColor}10)` }}
                >
                  {shop.logo_url
                    ? <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-black" style={{ color: themeColor }}>{(shop.business_name || "S").charAt(0)}</span>
                  }
                </div>
                <button onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}
                  className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingLogo ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <ImageIcon className="w-4 h-4 text-white" />}
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{shop.business_name}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    shop.status === "published"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${shop.status === "published" ? "bg-emerald-400" : "bg-amber-400"}`} />
                    {shop.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Globe className="w-3.5 h-3.5 text-white/30" />
                  {shopPreviewUrl ? (
                    <a href={shopPreviewUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-white/55 hover:text-[#9d8df1] transition-colors flex items-center gap-1 group break-all">
                      {shopPreviewUrl}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <button onClick={loadShopData} className="flex items-center gap-1.5 text-sm text-amber-400/70 hover:text-amber-300 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Click to refresh shop URL
                    </button>
                  )}
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-white/30">{shop.currency}</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              {[
                { label: "AI Powered", icon: Zap, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                { label: "Real-time Updates", icon: Sparkles, color: "#9d8df1", bg: "rgba(157,141,241,0.1)" },
              ].map(({ label, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06]" style={{ background: bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-xs text-white/60">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Shop Builder</p>
            <h2 className="text-xl font-semibold text-white">Build the default or custom version of your storefront</h2>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={shopPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isPreviewLive ? "text-white bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20" : "text-white/40 bg-white/[0.04] border border-white/[0.06] pointer-events-none"}`}
            >
              <ExternalLink className="w-4 h-4" />
              {isPreviewLive ? "Open Live Shop" : "Shop Not Live Yet"}
            </a>
            <button
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/[0.05] hover:bg-white/[0.08] transition-all"
            >
              <Globe className="w-4 h-4" />
              Preview Shop
            </button>
            <button
              onClick={loadShopData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/[0.05] hover:bg-white/[0.08] transition-all"
              title="Re-fetch shop data to get the latest URL"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${themeColor}, ${shop.theme_config?.accentColor || "#f59e0b"})`, boxShadow: "0 8px 28px rgba(0,0,0,0.28)" }}
            >
              <Plus className="w-4 h-4" />
              {openCreateModalLabel}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="rounded-2xl border border-white/[0.06] p-5 overflow-hidden relative" style={{ background: "linear-gradient(145deg, rgba(157,141,241,0.14), rgba(91,77,212,0.08))" }}>
            <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-[#9d8df1]/20 blur-2xl" />
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-2">Default Shop</p>
            <h3 className="text-lg font-semibold text-white mb-1">Base storefront setup</h3>
            <p className="text-sm text-white/55 leading-relaxed">Uses the default template and launch settings before AI styling is applied.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/8 text-white/75 border border-white/10">{shop.shop_type || "default"}</span>
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/8 text-white/75 border border-white/10">{shop.template || "yanga-default"}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] p-5 overflow-hidden relative" style={{ background: "linear-gradient(145deg, rgba(16,185,129,0.12), rgba(15,23,42,0.12))" }}>
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-emerald-400/15 blur-2xl" />
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-2">Customized Shop</p>
            <h3 className="text-lg font-semibold text-white mb-1">AI-shaped storefront</h3>
            <p className="text-sm text-white/55 leading-relaxed">Theme configuration, banner, and logo updates appear here in real time.</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: hasThemeConfig ? "#10b981" : "#f59e0b" }} />
              <span className="text-xs text-white/70">{hasThemeConfig ? "Customization applied" : "No customization yet"}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] p-5 overflow-hidden relative" style={{ background: "linear-gradient(145deg, rgba(245,158,11,0.14), rgba(239,68,68,0.06))" }}>
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-amber-400/15 blur-2xl" />
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-2">Shop Access</p>
            <h3 className="text-lg font-semibold text-white mb-1">View your storefront</h3>
            <p className="text-sm text-white/55 leading-relaxed">Open the public shop URL directly or preview it inside the dashboard modal.</p>
            <div className="mt-4 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isPreviewLive ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-xs text-white/70">
                {isPreviewLive ? "Live and accessible" : "Draft - preview only"}
              </span>
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/35 mb-2">Storefront URL</p>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">{shop.subdomain || shop.business_name}</p>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <a href={shopPreviewUrl || undefined} target="_blank" rel="noopener noreferrer" className="text-sm text-white/80 hover:text-white break-all font-mono">
                    {shopPreviewUrl}
                  </a>
                  {!shopPreviewUrl && (
                    <button onClick={loadShopData} className="mt-2 flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Click to refresh URL
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Left Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Banner + Info */}
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#19191d" }}>
              <div className="relative h-32 group">
                {shop.banner_url
                  ? <img src={shop.banner_url} alt="Banner" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ background: `linear-gradient(135deg,${themeColor}18 0%,${themeColor}08 100%)` }}>
                      <ImageIcon className="w-5 h-5 text-white/20" />
                      <span className="text-xs text-white/20">No banner</span>
                    </div>
                }
                <button onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}
                  className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                  {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ImageIcon className="w-4 h-4" /> Change Banner</>}
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  {shop.description || <span className="italic text-white/25">No description yet</span>}
                </p>
              </div>
            </div>

            {/* Theme palette */}
            <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: "#19191d" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(157,141,241,0.12)" }}>
                  <Palette className="w-3.5 h-3.5 text-[#9d8df1]" />
                </div>
                <h3 className="text-sm font-semibold text-white">Theme Config</h3>
              </div>
              {Object.keys(shop.theme_config || {}).length === 0
                ? <p className="text-xs text-white/30 italic">No theme config yet. Ask the AI to style your shop!</p>
                : <div className="space-y-2.5">
                    {Object.entries(shop.theme_config || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-white/40 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <div className="flex items-center gap-2">
                          {typeof value === "string" && value.startsWith("#") && (
                            <div className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0" style={{ background: value }} />
                          )}
                          <span className="text-xs text-white/70 font-mono truncate max-w-[100px]" title={String(value)}>{String(value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: "#19191d" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.12)" }}>
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Shop Link</h3>
              </div>
              <p className="text-xs text-white/35 mb-3">Storefront URL from <code>GET /user/shop</code></p>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 p-3">
                <p className="text-xs text-white/35 mb-2">Your Storefront</p>
                <p className="text-sm font-semibold text-white mb-1">{shop.subdomain || shop.business_name}</p>
                <a
                  href={shopPreviewUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-white/80 break-all hover:text-white font-mono"
                >
                  {shopPreviewUrl}
                </a>
                {!shopPreviewUrl && (
                  <button onClick={loadShopData} className="mt-2 flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Click to refresh URL
                  </button>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-white/[0.05] hover:bg-white/[0.08] transition-all"
                >
                  Preview in Modal
                </button>
                <a
                  href={shopPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all ${isPreviewLive ? "text-white bg-emerald-500/10 hover:bg-emerald-500/15" : "text-white/40 bg-white/[0.04] pointer-events-none"}`}
                >
                  Open Shop
                </a>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Messages", value: messages.length, icon: Bot, color: "#9d8df1" },
                { label: "Currency", value: shop.currency, icon: CreditCard, color: "#10b981" },
                { label: "Mode", value: shop.status, icon: Store, color: "#f59e0b" },
                { label: "Gate", value: isCustomizingPaid ? "Unlocked" : "Locked", icon: Zap, color: isCustomizingPaid ? "#10b981" : "#f59e0b" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl border border-white/[0.06] p-4" style={{ background: "#19191d" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="text-lg font-bold text-white">{value}</p>
                  <p className="text-xs text-white/35 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/[0.06] flex flex-col overflow-hidden" style={{ background: "#19191d", minHeight: 580 }}>
              {/* Chat header */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center relative" style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)", boxShadow: "0 0 20px rgba(157,141,241,0.3)" }}>
                    {isAiCustomShop ? <Sparkles className="w-4 h-4 text-white" /> : <Palette className="w-4 h-4 text-white" />}
                    <div className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#19191d]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{isAiCustomShop ? "Shop Assistant" : "Theme Editor"}</h2>
                    <p className="text-xs text-white/35">
                      {!isAiCustomShop
                        ? "Update your storefront colors manually"
                        : chatLocked
                        ? "Locked until customization payment is completed"
                        : `Streaming · Remembers context · ${shop.status === "published" ? "Published shop" : "Draft shop"}`}
                    </p>
                  </div>
                </div>
                {isAiCustomShop ? (
                  <button onClick={handleResetMemory} disabled={messages.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/[0.05] disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                ) : (
                  <button
                    onClick={handleSaveTheme}
                    disabled={savingTheme}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white bg-white/[0.05] hover:bg-white/[0.08] disabled:opacity-25 transition-all"
                  >
                    {savingTheme ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Palette className="w-3.5 h-3.5" />} Save Theme
                  </button>
                )}
              </div>

              {!isAiCustomShop ? (
                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/35 mb-3">Primary Color</p>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={themeDraft.primaryColor}
                          onChange={(e) => setThemeDraft((prev) => ({ ...prev, primaryColor: e.target.value }))}
                          className="h-14 w-16 rounded-xl bg-transparent cursor-pointer"
                        />
                        <div>
                          <p className="text-white font-medium">Main brand color</p>
                          <p className="text-xs text-white/40 font-mono">{themeDraft.primaryColor}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/35 mb-3">Accent Color</p>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={themeDraft.accentColor}
                          onChange={(e) => setThemeDraft((prev) => ({ ...prev, accentColor: e.target.value }))}
                          className="h-14 w-16 rounded-xl bg-transparent cursor-pointer"
                        />
                        <div>
                          <p className="text-white font-medium">Highlight color</p>
                          <p className="text-xs text-white/40 font-mono">{themeDraft.accentColor}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/[0.08] bg-[#12121a] p-6 overflow-hidden relative">
                    <div className="absolute inset-0 opacity-70" style={{ background: `linear-gradient(135deg, ${themeDraft.primaryColor}22, ${themeDraft.accentColor}14)` }} />
                    <div className="relative z-10">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/35 mb-4">Live Theme Preview</p>
                      <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-5">
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{shop.business_name || "Your Store"}</h3>
                            <p className="text-sm text-white/45">A quick look at your storefront styling</p>
                          </div>
                          <div className="h-10 w-10 rounded-2xl" style={{ background: `linear-gradient(135deg, ${themeDraft.primaryColor}, ${themeDraft.accentColor})` }} />
                        </div>
                        <div className="h-28 rounded-2xl mb-4" style={{ background: `linear-gradient(135deg, ${themeDraft.primaryColor}, ${themeDraft.accentColor})` }} />
                        <div className="flex gap-3">
                          <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: themeDraft.primaryColor }}>Primary Button</button>
                          <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: themeDraft.accentColor }}>Accent Button</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : chatLocked ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
                  <div className="w-16 h-16 rounded-3xl mb-5 flex items-center justify-center border border-amber-400/20 bg-amber-400/10">
                    <Sparkles className="w-7 h-7 text-amber-300" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300/80 mb-3">AI Custom Locked</p>
                  <h3 className="text-2xl font-semibold text-white mb-3">Unlock customization to use the shop assistant</h3>
                  <p className="text-sm text-white/45 max-w-md leading-relaxed mb-6">
                    This shop was created in AI custom mode. Complete the customization payment first, then the assistant will unlock for theme generation, layout changes, and brand styling.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium border border-amber-400/25 bg-amber-400/10 text-amber-200">Paid feature</span>
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/[0.04] text-white/60">Shop type: AI custom</span>
                  </div>
                  <p className="text-xs text-white/30">AI chat becomes available immediately after unlock is confirmed.</p>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ maxHeight: 420 }}>
                    {messages.length === 0 && !loadingHistory && !streamingReply && (
                      <div className="text-center py-8 space-y-5">
                        <div className="w-14 h-14 rounded-3xl mx-auto flex items-center justify-center" style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)", boxShadow: "0 0 30px rgba(157,141,241,0.25)" }}>
                          <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm mb-1">AI Shop Assistant</p>
                          <p className="text-white/40 text-xs max-w-xs mx-auto leading-relaxed">
                            Describe how you want your shop to look and feel. I'll update your theme in real time.
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {suggestions.map((s) => (
                            <button key={s} onClick={() => setInput(s)}
                              className="text-xs px-3 py-1.5 rounded-full border border-white/[0.07] text-white/40 hover:text-white/80 hover:border-[#9d8df1]/40 hover:bg-[#9d8df1]/[0.06] transition-all">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {loadingHistory && (
                      <div className="flex items-center justify-center gap-2 py-6 text-white/30 text-xs">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading conversation...
                      </div>
                    )}

                    {messages.map((msg, i) => (
                      <div key={i} className={`flex items-end gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mb-0.5" style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)" }}>
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-xs sm:max-w-sm text-sm px-4 py-3 rounded-2xl leading-relaxed ${msg.role === "user" ? "rounded-br-sm text-white" : "rounded-bl-sm text-white/85"}`}
                          style={msg.role === "user"
                            ? { background: "linear-gradient(135deg,#6d5de8,#4f3dc4)", boxShadow: "0 4px 16px rgba(91,77,212,0.3)" }
                            : { background: "rgba(255,255,255,0.05)" }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}

                    {streamingReply && (
                      <div className="flex items-end gap-2.5 justify-start">
                        <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mb-0.5" style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)" }}>
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="max-w-xs sm:max-w-sm text-sm px-4 py-3 rounded-2xl rounded-bl-sm text-white/85 leading-relaxed" style={{ background: "rgba(255,255,255,0.05)" }}>
                          {streamingReply}
                          <span className="inline-block w-1.5 h-[14px] ml-0.5 rounded-sm align-middle animate-pulse" style={{ background: "#9d8df1" }} />
                        </div>
                      </div>
                    )}

                    {sending && !streamingReply && (
                      <div className="flex items-end gap-2.5 justify-start">
                        <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mb-0.5" style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)" }}>
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5" style={{ background: "rgba(255,255,255,0.05)" }}>
                          {[0, 0.2, 0.4].map((d) => (
                            <span key={d} className="w-2 h-2 rounded-full bg-[#9d8df1] animate-bounce" style={{ animationDelay: `${d}s` }} />
                          ))}
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t px-4 py-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-2 rounded-2xl px-4 py-1 border transition-all focus-within:border-[#9d8df1]/40"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && !sending && handleSendMessage()}
                        placeholder="Describe your ideal shop look..."
                        disabled={sending}
                        className="flex-1 bg-transparent py-3 text-white text-sm focus:outline-none placeholder:text-white/20 disabled:opacity-50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || sending}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
                        style={{ background: input.trim() && !sending ? "linear-gradient(135deg,#9d8df1,#5b4dd4)" : "rgba(255,255,255,0.06)" }}
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-xs text-white/25">AI streams in real time · Theme changes apply instantly</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
