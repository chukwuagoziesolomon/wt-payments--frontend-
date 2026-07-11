"use client";

import WidgetConfigurationContent from "@/src/components/settings/WidgetConfigurationContent";
import PayoutSettingsSection from "@/src/components/settings/PayoutSettingsSection";
import ApiKeysSection from "@/src/components/settings/ApiKeysSection";
import WebhooksSection from "@/src/components/settings/WebhooksSection";
import * as React from "react";
import SettingsNav from "@/src/components/settings/SettingsNav";
import { useToast } from "@/components/ui/ToastProvider";
import { authFetch } from "@/lib/auth-fetch";
import { Edit2, X, Check } from "lucide-react";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${getToken()}`, ...extra };
}

function AccountInfoSettingsContent() {
  const { notify } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);

  const [formData, setFormData] = React.useState({
    surname: "",
    full_name: "",
    email: "",
    phone: "",
    profile_image: "",
  });

  // Load account info on mount
  React.useEffect(() => {
    loadAccountInfo();
  }, []);

  const loadAccountInfo = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/user/account-info`, {
        headers: authHeaders(),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.result) {
        setFormData({
          surname: json.result.surname || "",
          full_name: json.result.full_name || "",
          email: json.result.email || "",
          phone: json.result.phone || "",
          profile_image: json.result.profile_image || "",
        });
      } else {
        notify("Failed to load account info");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error loading account info");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(`${API}/user/account-info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          surname: formData.surname,
          full_name: formData.full_name,
          phone: formData.phone,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        notify("Account info updated successfully!");
        setIsEditMode(false);
      } else {
        notify(json.data || "Failed to update account info");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error updating account info");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    loadAccountInfo();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      notify("Please upload a JPG, PNG, or WebP image");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify("Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("profile_image", file);

      const res = await authFetch(`${API}/user/account-info/profile-image`, {
        method: "POST",
        headers: authHeaders(),
        body: formDataObj,
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.result?.profile_image) {
        setFormData((prev) => ({ ...prev, profile_image: json.result.profile_image }));
        notify("Profile image updated successfully!");
      } else {
        notify(json.data || "Failed to upload profile image");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error uploading profile image");
      }
    } finally {
      setUploadingImage(false);
    }
  };
  return (
    <>
      {/* Profile Image Section */}
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Profile Picture</h2>
        </div>
        <div className="bg-[#19191d] rounded-2xl p-8 border border-[#23242A] flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#23242A] flex items-center justify-center overflow-hidden flex-shrink-0">
            {formData.profile_image ? (
              <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-12 h-12 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-2">Upload new profile picture</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="block w-full text-sm text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG or WebP up to 5MB</p>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          {!isEditMode && !loading && (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg,#9d8df1,#5b4dd4)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSave} className="bg-[#19191d] rounded-2xl p-8 border border-[#23242A]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Surname */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Surname</label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={`w-full rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors ${
                      isEditMode
                        ? "bg-[#11111a] border border-[#23242A] focus:border-[#9d8df1] cursor-text"
                        : "bg-[#23242A] border border-[#23242A] cursor-default text-muted-foreground"
                    }`}
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={`w-full rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors ${
                      isEditMode
                        ? "bg-[#11111a] border border-[#23242A] focus:border-[#9d8df1] cursor-text"
                        : "bg-[#23242A] border border-[#23242A] cursor-default text-muted-foreground"
                    }`}
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-muted-foreground focus:outline-none cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-[#23242A] border border-[#23242A] rounded-lg px-3 py-2.5 text-white text-sm flex-shrink-0">
                      +234
                    </span>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      placeholder="9096879086"
                      className={`flex-1 rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors ${
                        isEditMode
                          ? "bg-[#11111a] border border-[#23242A] focus:border-[#9d8df1] cursor-text"
                          : "bg-[#23242A] border border-[#23242A] cursor-default text-muted-foreground"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#23242A]">
                {isEditMode && (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all text-muted-foreground border border-[#23242A] hover:border-[#9d8df1] hover:text-white"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all"
                      style={{
                        background: saving ? "rgba(79,79,143,0.3)" : "linear-gradient(135deg,#9d8df1,#5b4dd4)",
                        color: "#fff",
                        opacity: saving ? 0.6 : 1,
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      <Check className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </form>
      </div>

      {/* Authentication Section */}
      <div className="w-full max-w-5xl mx-auto mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Authentication</h2>
        </div>
        <div className="bg-[#19191d] rounded-2xl p-8 border border-[#23242A]">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 flex items-center gap-4">
              <span className="text-white">Password</span>
              <button className="bg-[#23242A] text-white px-4 py-2 rounded-md text-sm">Change Password</button>
            </div>
            <div className="flex-1 flex items-center gap-4">
              <span className="text-white">Two factor - Auth</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked readOnly />
                <div className="w-14 h-8 bg-[#23242A] rounded-full peer-checked:bg-violet-500 transition-colors" />
                <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transform transition-transform peer-checked:translate-x-6" />
                <span className="ml-4 text-violet-400">Enable</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PayoutSettingsContent() {
  return <PayoutSettingsSection />;
}

export default function SettingsPage() {
  // Read the `tab` query parameter if present to set the initial tab
  const getInitialTab = () => {
    if (typeof window === "undefined") return "account";
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "payout") return "payout";
    if (params.get("tab") === "api") return "api";
    if (params.get("tab") === "webhooks") return "webhooks";
    if (params.get("tab") === "widget") return "widget";
    return "account";
  };

  const [tab, setTab] = React.useState(getInitialTab);

  React.useEffect(() => {
    const onPop = () => setTab(getInitialTab());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-background">
      <h1 className="text-xl font-semibold text-white mb-6">
        Setting{'>>'}{tab === "account" ? "Account Info" : tab === "payout" ? "Payout" : tab === "api" ? "API Keys" : tab === "webhooks" ? "Webhooks" : tab === "widget" ? "Widget" : ""}
      </h1>
      <SettingsNav active={tab} onChange={setTab} />

      {tab === "account" && <AccountInfoSettingsContent />}
      {tab === "payout" && <PayoutSettingsContent />}
      {tab === "api" && (
        <>
          <ApiKeysSection environment="test" />
          <ApiKeysSection environment="live" />
        </>
      )}
      {tab === "webhooks" && <WebhooksSection />}
      {tab === "widget" && <WidgetConfigurationContent />}
    </div>
  );
}
