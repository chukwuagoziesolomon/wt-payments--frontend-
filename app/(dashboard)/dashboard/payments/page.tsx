"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { authFetch } from "@/lib/auth-fetch";
import { ChevronLeft, ChevronRight, ExternalLink, Copy } from "lucide-react";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${getToken()}`, ...extra };
}

type PaymentIntent = {
  transaction_id: string;
  reference_id: string;
  amount: number;
  currency: string;
  status: "payment_created" | "incomplete_payment" | "awaiting_confirmation" | "payment_completed";
  crypto_amount: string;
  crypto_currency: string | { symbol: string; name: string };
  network: string | { name: string };
  tx_hash: string;
  wallet_address: string;
  created_at: string;
  completed_at: string | null;
};

type PaginationMeta = {
  currentPage: number;
  total: number;
};

const statusConfig: Record<
  string,
  { color: string; bgColor: string; label: string }
> = {
  payment_created: { color: "text-blue-400", bgColor: "bg-blue-500/20", label: "Created" },
  incomplete_payment: { color: "text-yellow-400", bgColor: "bg-yellow-500/20", label: "Incomplete" },
  awaiting_confirmation: { color: "text-amber-400", bgColor: "bg-amber-500/20", label: "Awaiting" },
  payment_completed: { color: "text-green-400", bgColor: "bg-green-500/20", label: "Completed" },
};

export default function PaymentHistoryPage() {
  const { notify } = useToast();
  const [payments, setPayments] = useState<PaymentIntent[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ currentPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadPaymentHistory();
  }, [page]);

  const loadPaymentHistory = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/user/payment-intent/history?page=${page}&limit=10`, {
        headers: authHeaders(),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        const result = json.result;
        const data = result || json.data;
        const txns = data?.transactions ?? data?.data;
        if (txns && Array.isArray(txns)) {
          setPayments(txns);
          setMeta(data?.meta || { currentPage: page, total: 0 });
        } else {
          notify("No transactions found");
        }
      } else {
        notify(typeof json.message === "string" ? json.message : "Failed to load payment history");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error loading payment history");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    notify("Transaction hash copied!");
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    notify("Wallet address copied!");
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.payment_created;
  };

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toStr = (val: string | { symbol?: string; name?: string }): string => {
  if (typeof val === "string") { return val; }
  return val?.symbol ?? val?.name ?? "";
};

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 12)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-background">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payment History</h1>
          <p className="text-muted-foreground">{meta.total} transactions</p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading payment history...</div>
        ) : payments.length === 0 ? (
          <div className="bg-[#19191d] rounded-2xl p-12 border border-[#23242A] text-center">
            <div className="mb-4 text-5xl">💳</div>
            <h2 className="text-lg font-semibold text-white mb-2">No payments yet</h2>
            <p className="text-muted-foreground">Your payment history will appear here</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-[#19191d] rounded-2xl border border-[#23242A] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#23242A] bg-[#11111a]">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">
                        Reference
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">
                        Crypto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, i) => {
                      const statusCfg = getStatusConfig(payment.status);
                      return (
                        <tr
                          key={payment.transaction_id}
                          className={`border-b border-[#23242A] hover:bg-[#11111a] transition-colors ${
                            i === payments.length - 1 ? "border-b-0" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-white font-mono text-sm">
                                {truncateHash(payment.reference_id)}
                              </span>
                              <span className="text-xs text-muted-foreground">{payment.transaction_id.substring(0, 8)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-semibold">
                              {payment.currency} {payment.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-muted-foreground text-sm">
              {payment.crypto_amount} {toStr(payment.crypto_currency)}
              <span className="text-xs block text-muted-foreground/50 mt-0.5">
                {toStr(payment.network)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.bgColor} ${statusCfg.color}`}
                            >
                              {statusCfg.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {formatDate(payment.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            {payment.tx_hash && (
                              <a
                                href={`https://bscscan.com/tx/${payment.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#9d8df1] hover:text-[#b8a4f9] text-sm flex items-center gap-1 transition-colors"
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {payments.map((payment) => {
                const statusCfg = getStatusConfig(payment.status);
                return (
                  <div
                    key={payment.transaction_id}
                    className="bg-[#19191d] rounded-xl border border-[#23242A] p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{payment.reference_id}</h3>
                        <p className="text-xs text-muted-foreground">{formatDate(payment.created_at)}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bgColor} ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 py-3 border-t border-b border-[#23242A]">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Fiat</p>
                        <p className="text-white font-semibold">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Crypto</p>
                        <p className="text-white font-semibold">
                          {payment.crypto_amount} {toStr(payment.crypto_currency)}
                        </p>
                      </div>
                    </div>

                    {payment.tx_hash && (
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-muted-foreground">Tx:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white">{truncateHash(payment.tx_hash)}</span>
                          <button
                            onClick={() => handleCopyHash(payment.tx_hash)}
                            className="p-1 hover:bg-[#23242A] rounded transition-colors"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}

                    {payment.wallet_address && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Wallet:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white">{truncateHash(payment.wallet_address)}</span>
                          <button
                            onClick={() => handleCopyAddress(payment.wallet_address)}
                            className="p-1 hover:bg-[#23242A] rounded transition-colors"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta.total > 10 && (
              <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-muted-foreground">
                  Page {meta.currentPage} · {meta.total} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-[#23242A] text-muted-foreground hover:border-[#9d8df1] hover:text-white transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(meta.total / 10)}
                    className="p-2 rounded-lg border border-[#23242A] text-muted-foreground hover:border-[#9d8df1] hover:text-white transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
