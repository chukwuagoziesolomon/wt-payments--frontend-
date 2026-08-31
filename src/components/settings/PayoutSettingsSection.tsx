"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { authFetch } from "@/lib/auth-fetch";
import type { NetworkType } from "@/types";

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

type CryptoPayoutDetails = {
  wallet_address: string;
  network_type: NetworkType;
  currency_id: string;
};

const NETWORK_OPTIONS: { value: NetworkType; label: string }[] = [
  { value: "evm", label: "EVM (Ethereum/Polygon)" },
  { value: "solana", label: "Solana" },
  { value: "tron", label: "Tron" },
  { value: "ckb", label: "CKB" },
];

function validateAddress(address: string, networkType: string): boolean {
  if (!address) return false;
  if (networkType === "evm") return /^0x[a-fA-F0-9]{40}$/.test(address);
  if (networkType === "solana") return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  if (networkType === "tron") return /^T[a-km-zA-HJ-NP-Z1-9]{33}$/.test(address);
  if (networkType === "ckb") return /^ckt1q[a-zA-Z0-9]{20,40}$/.test(address);
  return false;
}

export default function PayoutSettingsSection() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const [payoutType, setPayoutType] = useState<"FIAT" | "CRYPTO">("FIAT");

  const [bankForm, setBankForm] = useState<BankDetails>({
    bank_name: "",
    bank_account_no: "",
    account_name: "",
    bank_code: "",
    currency_id: "ngn",
  });

  const [cryptoForm, setCryptoForm] = useState<CryptoPayoutDetails>({
    wallet_address: "",
    network_type: "evm",
    currency_id: "usdt",
  });

  const [cryptoError, setCryptoError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved payout settings if endpoint exists
  }, []);

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCryptoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCryptoForm((prev) => ({ ...prev, [name]: value }));
    setCryptoError(null);
  };

  const handleBankSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bank_name || !bankForm.bank_account_no || !bankForm.account_name || !bankForm.bank_code) {
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
          bank_account_no: bankForm.bank_account_no,
          bank_name: bankForm.bank_name,
          account_name: bankForm.account_name,
          bank_code: bankForm.bank_code,
          currency_id: bankForm.currency_id,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        notify(json.data || "Failed to save bank details");
        return;
      }

      notify("Bank details saved successfully!");
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error saving bank details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddress(cryptoForm.wallet_address, cryptoForm.network_type)) {
      setCryptoError(`Invalid ${cryptoForm.network_type.toUpperCase()} address format`);
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch(`${API}/client/settings/payout`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          type: "CRYPTO",
          wallet_address: cryptoForm.wallet_address,
          network_type: cryptoForm.network_type,
          currency_id: cryptoForm.currency_id,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        notify(json.data || "Failed to save crypto payout details");
        return;
      }

      notify("Crypto payout details saved successfully!");
      setCryptoForm({ wallet_address: "", network_type: "evm", currency_id: "usdt" });
      setCryptoError(null);
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error saving crypto payout details");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Payout type toggle */}
      <div className="flex rounded-lg bg-[#19191d] w-fit h-10">
        {(["FIAT", "CRYPTO"] as const).map(m => (
          <button
            key={m}
            className={`px-4 rounded-lg text-sm font-semibold transition-colors duration-150 ${payoutType === m ? "bg-[#23243a] text-white shadow-inner" : "bg-transparent text-muted-foreground"}`}
            onClick={() => setPayoutType(m)}
            type="button"
          >
            {m === "FIAT" ? "Bank Account" : "Crypto Wallet"}
          </button>
        ))}
      </div>

      {/* Bank Account Form */}
      {payoutType === "FIAT" && (
        <div className="bg-[#19191d] rounded-xl p-8 border border-[#23242A]">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-1">Bank Account Details</h2>
            <p className="text-muted-foreground text-sm mb-6">Save your bank details for fiat withdrawals. These details will be used for all your fiat withdrawal transactions.</p>

            <form onSubmit={handleBankSave} className="space-y-4">
              {/* Bank Name */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={bankForm.bank_name}
                  onChange={handleBankChange}
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
                  value={bankForm.account_name}
                  onChange={handleBankChange}
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
                  value={bankForm.bank_code}
                  onChange={handleBankChange}
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
                  value={bankForm.bank_account_no}
                  onChange={handleBankChange}
                  placeholder="10-digit account number"
                  className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-[#9d8df1]"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Currency</label>
                <select
                  name="currency_id"
                  value={bankForm.currency_id}
                  onChange={handleBankChange}
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
      )}

      {/* Crypto Wallet Form */}
      {payoutType === "CRYPTO" && (
        <div className="bg-[#19191d] rounded-xl p-8 border border-[#23242A]">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-1">Crypto Wallet Details</h2>
            <p className="text-muted-foreground text-sm mb-6">Save your crypto wallet address for withdrawals. Network-aware validation is applied.</p>

            <form onSubmit={handleCryptoSave} className="space-y-4">
              {/* Network Type */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Network Type</label>
                <select
                  name="network_type"
                  value={cryptoForm.network_type}
                  onChange={handleCryptoChange}
                  className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1]"
                >
                  {NETWORK_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Currency</label>
                <select
                  name="currency_id"
                  value={cryptoForm.currency_id}
                  onChange={handleCryptoChange}
                  className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1]"
                >
                  <option value="usdt">USDT</option>
                  <option value="usdc">USDC</option>
                  <option value="trx">TRX</option>
                  <option value="eth">ETH</option>
                  <option value="matic">MATIC</option>
                  <option value="ckb">CKB</option>
                </select>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Wallet Address</label>
                <input
                  type="text"
                  name="wallet_address"
                  value={cryptoForm.wallet_address}
                  onChange={handleCryptoChange}
                  placeholder={
                    cryptoForm.network_type === "evm"
                      ? "0x..."
                      : cryptoForm.network_type === "solana"
                        ? "7EcjQq5RXkqBaDb2LDWSDbQmybg4GBFPJV2H9DDJr4V"
                        : cryptoForm.network_type === "tron"
                          ? "TQcZ9FqK9w8fZ6fQo1J19w6dE6w8fZ6fQo1J19w6dE6"
                          : "ckt1q..."
                  }
                  className={`w-full bg-[#11111a] border ${cryptoError ? "border-red-500" : "border-[#23242A]"} rounded-lg px-4 py-2.5 text-white placeholder-[#666] focus:outline-none focus:border-[#9d8df1]`}
                />
                {cryptoError && (
                  <p className="text-xs text-red-400 mt-1">{cryptoError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {cryptoForm.network_type === "evm" && "Enter a 42-character EVM address starting with 0x"}
                  {cryptoForm.network_type === "solana" && "Enter a Base58 Solana address (32-44 characters, no 0x prefix)"}
                  {cryptoForm.network_type === "tron" && "Enter a Base58 Tron address starting with T (34 characters)"}
                  {cryptoForm.network_type === "ckb" && "Enter a CKB address starting with ckt1q"}
                </p>
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
                  {loading ? "Saving..." : "Save Crypto Wallet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
