"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Store, ExternalLink, Loader2, Globe, Settings } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";

const API = "/backend";

type ShopSummary = {
  id: string;
  business_name: string;
  subdomain: string;
  shop_url: string;
  storefront_url?: string;
  status: "draft" | "published";
  currency: string;
  template?: string;
  created_at?: string;
};

export default function MyShopsPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadShops = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/user/shops`, {
        headers: { Authorization: `Bearer ${typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : ""}` },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result) {
        setShops(Array.isArray(json.result) ? json.result : []);
      } else {
        notify(json.data || json.message || "Failed to load shops");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error loading shops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const getShopUrl = (shop: ShopSummary) => {
    return shop.storefront_url || shop.shop_url || `${typeof window !== "undefined" ? window.location.origin : ""}/shop/${shop.subdomain}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold text-white">My Shops</h1>
              <p className="text-muted-foreground text-sm">Manage your storefronts</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard/shop")}
            className="bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Shop
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Loading shops...</p>
            </div>
          </div>
        ) : shops.length === 0 ? (
          <Card className="bg-[#19191d] border-border">
            <CardContent className="py-16 text-center">
              <Store className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">No shops yet</h2>
              <p className="text-muted-foreground text-sm mb-6">Create your first shop to get started</p>
              <Button
                onClick={() => router.push("/dashboard/shop")}
                className="bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Shop
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Card key={shop.id} className="bg-[#19191d] border-border hover:border-white/[0.15] transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9d8df1] to-[#5b4dd4] flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-white line-clamp-1">{shop.business_name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{shop.status}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      shop.status === "published"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
                    }`}>
                      {shop.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{shop.subdomain}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-xs">Currency:</span>
                      <span className="text-white text-xs font-medium">{shop.currency}</span>
                    </div>
                    {shop.template && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs">Template:</span>
                        <span className="text-white text-xs font-medium capitalize">{shop.template.replace(/-/g, " ")}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
                    <a
                      href={getShopUrl(shop)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white hover:border-white/25 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Shop
                    </a>
                    <Button
                      onClick={() => router.push(`/dashboard/shop?shop_id=${shop.id}`)}
                      variant="ghost"
                      className="flex-1 border border-white/10 text-xs font-semibold text-white hover:border-white/25"
                    >
                      <Settings className="w-3.5 h-3.5 mr-1.5" />
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
