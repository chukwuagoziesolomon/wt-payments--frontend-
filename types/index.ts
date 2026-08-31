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

export type UserWallet = {
  uniqueId: string;
  walletAddress: string;
  balance: number;
  balanceUsd?: number;
  status: string;
  currencyId: string;
  cryptoNetworkId: string;
  currency?: {
    id: string;
    symbol: string;
    name: string;
    logo?: string;
  };
  cryptoNetwork?: {
    id: string;
    name: string;
    logo?: string;
    networkType: NetworkType;
    chainKey: string;
    isTestnet: boolean;
  };
};

export type WalletsResponse = {
  success: boolean;
  data: UserWallet[];
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
  user_wallet_id?: string;
};

export type PaymentIntentHistoryTransaction = {
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
  crypto_amount?: string | null;
  crypto_currency?: string | null;
  tx_hash?: string | null;
  wallet_address?: string | null;
  user_wallet_id?: string | null;
};
