"use client";

import React, { useEffect, useState } from "react";
import { CurrencyTable } from "../../../../src/components/currency/CurrencyTable";
import { CurrencyMobile } from "../../../../src/components/currency/CurrencyMobile";
import { authFetch } from "@/lib/auth-fetch";

export type AssetItem = {
  currency_id: string;
  crypto: {
    id: string;
    name: string;
    symbol: string;
    logo?: string;
    ratePerUsd?: number;
  };
  network?: {
    id?: string;
    name?: string;
    contract_address?: string;
    chain_id?: string;
    [key: string]: any;
  };
  is_active?: boolean;
};

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("authToken") || localStorage.getItem("token") || ""
    : "";
}

export default function CurrencyPage() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch("/backend/available-assets", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          setAssets(json.data || json.result || []);
        } else {
          setError(json.message || json.data || "Failed to load assets");
        }
      } catch (err: any) {
        if (err.name !== "AuthExpiredError") setError("Error loading assets");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    return (
      !q ||
      a.crypto.symbol.toLowerCase().includes(q) ||
      a.crypto.name.toLowerCase().includes(q) ||
      (a.network?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="p-4">
      <div className="hidden md:block">
        <CurrencyTable
          assets={filtered}
          loading={loading}
          error={error}
          search={search}
          onSearchChange={setSearch}
        />
      </div>
      <CurrencyMobile
        assets={filtered}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
      />
    </main>
  );
}
