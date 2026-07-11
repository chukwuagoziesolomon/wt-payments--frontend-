"use client";

import React from "react";
import { useToast } from "@/components/ui/ToastProvider";

export default function HeaderModeToggle() {
  const [isLive, setIsLive] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("environment") === "LIVE";
    }
    return false;
  });
  const [loading, setLoading] = React.useState(false);
  const { notify } = useToast();

  async function handleToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const targetEnv = e.target.checked ? "LIVE" : "TEST";
    setLoading(true);

    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      const res = await fetch("/api/user/settings/general/switch-environment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ environment: targetEnv }),
      });

      const json = await res.json().catch(() => null);

      if (res.status === 403 || json?.error) {
        notify(
          json?.data ||
            "Your account must be verified by an admin before switching to LIVE mode."
        );
        return;
      }

      if (!res.ok) {
        notify("Failed to switch environment. Please try again.");
        return;
      }

      const current: string =
        json?.result?.current_environment ?? targetEnv;
      const live = current === "LIVE";
      setIsLive(live);
      localStorage.setItem("environment", current);
    } catch {
      notify("Failed to switch environment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm ${isLive ? "text-blue-400" : "text-yellow-400"}`}>
        {isLive ? "Live" : "Test"}
      </span>
      <label className={`relative inline-flex items-center ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isLive}
          onChange={handleToggle}
          disabled={loading}
        />
        <div className="w-10 h-6 bg-[#23242A] rounded-full peer-checked:bg-violet-500 transition-colors" />
        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transform transition-transform peer-checked:translate-x-4" />
      </label>
    </div>
  );
}
