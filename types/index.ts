import type { IconType } from "@/components/icons";

export type NavItem = {
  title: string;
  url: string;
  icon?: IconType;
  isActive?: boolean;
};

export type NavGroup = {
  main: NavItem[];
  others: NavItem[];
};

export type ActivityLogItem = {
  icon: string; // e.g., "shield", "zap", "download"
  title: string;
  description: string;
  status?: string;
  date?: string;
  time?: string;
};

export type DetailsData = {
  type: "transaction" | "withdrawal";
  amountPaid: string;
  equivalent: string;
  receiver: string;
  paidOn: string;
  paymentMethod?: string;
  id: string;
  token: string;
  blockchain: string;
  networkFee: string;
  receiverAddress: string;
  senderAddress: string;
  qrCode: string; // URL or base64 for QR code
  status: string;
  activityLog: ActivityLogItem[];
  deviceType?: string;
  attempts?: number;
  error?: string;
};

export type NetworkType = "evm" | "ckb" | "solana" | "tron";

export type AvailableAssetCrypto = {
  id: string;
  name: string;
  symbol: string;
  logo?: string;
  type?: string;
  contractAddress?: string | null;
  ratePerUsd?: number;
};

export type AvailableAssetNetwork = {
  id: string;
  name: string;
  logo?: string;
  isTestnet: boolean;
  networkType: NetworkType;
  chainKey: string;
  chainId: string | null;
};

export type AvailableAsset = {
  currency_id: string;
  crypto: AvailableAssetCrypto;
  network: AvailableAssetNetwork;
};

export type WithdrawalSSEEventData = {
  type: "crypto";
  network: string;
  status: string;
  amount: number;
  tx_hash?: string;
  recipient?: string;
  currency: string;
  transaction_id: string;
};

export type WithdrawalHistoryItem = {
  id: string;
  paidOn: string;
  method: string;
  crypto_currency: string;
  wallet: string;
  amount: number;
  status: string;
  network: string;
  tx_hash?: string;
};
