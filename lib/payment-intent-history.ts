import type { DetailsData } from "@/types";
import { authFetch } from "@/lib/auth-fetch";

export type PaymentIntentHistoryMeta = {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};

type PaymentIntentHistoryTransaction = {
  transaction_id: string;
  reference_id: string | null;
  amount: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  currency?: {
    id?: string;
    name?: string;
    symbol?: string;
    logo?: string | null;
  } | null;
  wallet?: {
    id?: string;
    address?: string;
    qr_code?: string | null;
    status?: string;
  } | null;
  crypto?: {
    id?: string;
    name?: string;
    symbol?: string;
    logo?: string | null;
    contract_address?: string | null;
  } | null;
  network?: {
    id?: string;
    name?: string;
    logo?: string | null;
    is_testnet?: boolean;
  } | null;
};

type PaymentIntentHistoryResponse = {
  success: boolean;
  data?: {
    meta?: PaymentIntentHistoryMeta;
    transactions?: PaymentIntentHistoryTransaction[];
  };
  message?: string;
};

export type HistoryListItem = {
  id: string;
  createdAt: string;
  paidOn: string;
  customer: string;
  currencyDisplay: string;
  tokenSymbol: string;
  walletAddress: string;
  amountDisplay: string;
  statusLabel: string;
  statusClass: string;
  details: DetailsData;
};

export async function getPaymentIntentHistory(params?: {
  skip?: number;
}): Promise<{ items: HistoryListItem[]; meta: PaymentIntentHistoryMeta | null }> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("authToken") || localStorage.getItem("token")
    : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const apiBase = "/backend";

  const res = await authFetch(`${apiBase}/user/payment-intent/history`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const payload = (await res.json().catch(() => null)) as PaymentIntentHistoryResponse | null;

  if (!res.ok || !payload?.success) {
    throw new Error(payload?.message || `Failed to load transaction history (${res.status})`);
  }

  const transactions = [...(payload.data?.transactions || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const sliced = params?.skip ? transactions.slice(params.skip) : transactions;

  return {
    items: sliced.map(toHistoryItem),
    meta: payload.data?.meta || null,
  };
}

function toHistoryItem(tx: PaymentIntentHistoryTransaction): HistoryListItem {
  const amount = Number.isFinite(tx.amount) ? tx.amount : 0;
  const currencySymbol = tx.currency?.symbol || tx.currency?.id || "";
  const tokenSymbol = tx.crypto?.symbol || tx.crypto?.name || "-";
  const walletAddress = tx.wallet?.address || "-";
  const statusLabel = normalizeStatus(tx.status);

  return {
    id: tx.transaction_id,
    createdAt: tx.created_at,
    paidOn: formatDate(tx.created_at),
    customer: tx.reference_id || tx.transaction_id,
    currencyDisplay: [tokenSymbol, tx.network?.name].filter(Boolean).join("/") || tokenSymbol,
    tokenSymbol,
    walletAddress,
    amountDisplay: `${formatNumber(amount)} ${currencySymbol || tokenSymbol}`.trim(),
    statusLabel,
    statusClass: statusBadgeClass(statusLabel),
    details: {
      type: "transaction",
      amountPaid: `${formatNumber(amount)} ${currencySymbol || tokenSymbol}`.trim(),
      equivalent: tx.crypto?.symbol
        ? `≈ ${formatNumber(amount)} ${tx.crypto.symbol}`
        : `≈ ${formatNumber(amount)} ${currencySymbol || tokenSymbol}`,
      receiver: tx.reference_id || "N/A",
      paidOn: formatDateTime(tx.created_at),
      paymentMethod: "Crypto",
      id: tx.transaction_id,
      token: tokenSymbol,
      blockchain: tx.network?.name || "N/A",
      networkFee: "N/A",
      receiverAddress: walletAddress,
      senderAddress: walletAddress,
      qrCode: tx.wallet?.qr_code || "",
      status: statusLabel,
      activityLog: [
        {
          icon: "shield",
          title: "Transaction Created",
          description: `Transaction ${tx.transaction_id} was created.`,
          date: formatDate(tx.created_at),
          time: formatTime(tx.created_at),
        },
        {
          icon: "download",
          title: "Payment Status",
          description: `Current status is ${statusLabel}.`,
          date: tx.completed_at ? formatDate(tx.completed_at) : undefined,
          time: tx.completed_at ? formatTime(tx.completed_at) : undefined,
        },
      ],
      deviceType: "N/A",
      attempts: 0,
      error: "None",
    },
  };
}

function normalizeStatus(value: string | undefined): string {
  if (!value) return "Pending";
  const v = value.toLowerCase();
  if (v.includes("complete") || v.includes("success")) return "Completed";
  if (v.includes("fail") || v.includes("error") || v.includes("cancel")) return "Failed";
  return "Pending";
}

function statusBadgeClass(status: string): string {
  if (status === "Completed") return "bg-green-900 text-green-200";
  if (status === "Failed") return "bg-red-900 text-red-200";
  return "bg-yellow-900 text-yellow-200";
}

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
