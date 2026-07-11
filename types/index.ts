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
