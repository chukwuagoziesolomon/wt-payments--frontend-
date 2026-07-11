"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { authFetch } from "@/lib/auth-fetch";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

function authHeaders(extra?: Record<string, string>) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...extra };
}

type BankDetails = {
  bank_name: string;
  bank_account_no: string;
  account_name: string;
  bank_code: string;
  currency_id: string;
};

export default function PayoutSettingsSection() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BankDetails>({
    bank_name: "",
    bank_account_no: "",
    account_name: "",
    bank_code: "",
    currency_id: "ngn",
  });

  // Load saved payout settings on mount
  useEffect(() => {
    // For now, we'll just initialize as empty. In a real scenario, you'd fetch from an endpoint
    // that returns the saved payout settings if they exist.
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bank_name || !formData.bank_account_no || !formData.account_name || !formData.bank_code) {
      notify("Please fill in all bank details");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch(`${API}/client/settings/payout`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          type: "FIAT",
          bank_account_no: formData.bank_account_no,
          bank_name: formData.bank_name,
          account_name: formData.account_name,
          bank_code: formData.bank_code,
          currency_id: formData.currency_id,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        notify(json.data || "Failed to save bank details");
        return;
      }

      notify("Bank details saved successfully!");
      // Optionally clear the form or keep it filled for reference
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error saving bank details");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-[#19191d] rounded-xl p-8 border border-[#23242A]">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-1">Bank Account Details</h2>
          <p className="text-muted-foreground text-sm mb-6">Save your bank details for fiat withdrawals. These details will be used for all your fiat withdrawal transactions.</p>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Bank Name */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="e.g., First Bank, GTBank"
                className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-[#9d8df1]"
              />
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Account Name</label>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-[#9d8df1]"
              />
            </div>

            {/* Bank Code */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Bank Code</label>
              <input
                type="text"
                name="bank_code"
                value={formData.bank_code}
                onChange={handleChange}
                placeholder="e.g., 011, 058"
                className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-[#9d8df1]"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Account Number</label>
              <input
                type="text"
                name="bank_account_no"
                value={formData.bank_account_no}
                onChange={handleChange}
                placeholder="10-digit account number"
                className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-[#9d8df1]"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Currency</label>
              <select
                name="currency_id"
                value={formData.currency_id}
                onChange={handleChange}
                className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1]"
              >
                <option value="ngn">NGN (Nigerian Naira)</option>
                <option value="usd">USD (US Dollar)</option>
                <option value="gbp">GBP (British Pound)</option>
              </select>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-[#23242A]">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg font-semibold transition-all"
                style={{
                  background: loading ? "rgba(79,79,143,0.3)" : "linear-gradient(135deg,#9d8df1,#5b4dd4)",
                  color: "#fff",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Saving..." : "Save Bank Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
