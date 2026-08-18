"use client";

import {
  AlertCircle,
  Clock,
  Copy,
  Download,
  Monitor,
  Shield,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OverlayLoader } from "@/components/ui/LoadingAnimator";
import type { DetailsData } from "@/types";

interface DetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DetailsData | null;
  loading?: boolean;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  shield: Shield,
  zap: Zap,
  download: Download,
  monitor: Monitor,
  clock: Clock,
  alert: AlertCircle,
};

export function DetailsModal({
  open,
  onOpenChange,
  data,
  loading = false,
}: DetailsModalProps) {
  if (!data) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex h-[85vh] w-full max-w-[95vw] flex-col rounded-lg border border-[#282A33] bg-[#17171A] p-0 sm:max-w-5xl [&::-webkit-scrollbar]:hidden [&_*::-webkit-scrollbar-thumb]:rounded-full [&_*::-webkit-scrollbar-thumb]:bg-gray-700 [&_*::-webkit-scrollbar-track]:bg-transparent [&_*::-webkit-scrollbar]:w-2">
        <OverlayLoader message="Loading details…" visible={loading} />
        {/* Mobile Receipt Style Table (shown below md) */}
        <div className="block flex-1 space-y-4 overflow-y-auto p-4 md:hidden">
          <div className="font-semibold text-lg text-white">
            Transaction Receipt
          </div>
          <div className="rounded-md border border-[#353640] bg-[#18181C] p-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block text-gray-400 text-xs">Amount Paid</span>
                <span className="block font-bold text-2xl text-white">
                  {data.amountPaid}
                </span>
                <span className="mt-1 block text-gray-400 text-xs">
                  {data.equivalent}
                </span>
              </div>
              <div className="sm:text-right">
                <div className="block min-w-0 max-w-[140px] truncate font-semibold text-sm text-white sm:max-w-[200px]">
                  {data.receiver}
                </div>
              </div>
            </div>
            <div className="divide-y divide-[#23243a]">
              <ReceiptRow label="Paid on" value={data.paidOn} />
              <ReceiptRow label="Payment Method" value={data.paymentMethod} />
              <ReceiptRow
                clipboard={data.id}
                label="ID"
                onCopy={copyToClipboard}
                value={
                  <span className="block min-w-0 max-w-[200px] truncate font-mono text-blue-400 text-xs">
                    {data.id}
                  </span>
                }
              />
              <ReceiptRow
                label="Token"
                value={<TokenOrChain label={data.token} type="token" />}
              />
              <ReceiptRow
                label="Blockchain"
                value={<TokenOrChain label={data.blockchain} type="chain" />}
              />
              <ReceiptRow label="Network Fee" value={data.networkFee} />
              <ReceiptRow
                clipboard={data.receiverAddress}
                label="Receiver"
                onCopy={copyToClipboard}
                value={
                  <span className="block min-w-0 max-w-[200px] truncate font-mono text-blue-400 text-xs">
                    {data.receiverAddress}
                  </span>
                }
              />
              <ReceiptRow
                clipboard={data.senderAddress}
                label="Sender"
                onCopy={copyToClipboard}
                value={
                  <span className="block min-w-0 max-w-[200px] truncate font-mono text-blue-400 text-xs">
                    {data.senderAddress}
                  </span>
                }
              />
              <ReceiptRow
                label="Status"
                value={
                  <Badge className="bg-green-900 text-green-200 text-xs">
                    {data.status}
                  </Badge>
                }
              />
              <ReceiptRow
                label="Device Type"
                value={
                  <span className="font-semibold">
                    {data.deviceType || "N/A"}
                  </span>
                }
              />
              <ReceiptRow
                label="Attempts"
                value={data.attempts !== undefined ? data.attempts : 0}
              />
              <ReceiptRow
                label="Error"
                value={
                  <span className="text-red-400">{data.error || "None"}</span>
                }
              />
            </div>
          </div>

          {/* Activity Log section for mobile */}
          <div className="rounded-md border border-[#353640] bg-[#18181C] p-4">
            <div className="mb-4 font-semibold text-lg text-white">
              Activity Log
            </div>
            <div className="flex flex-col gap-3">
              {data.activityLog?.map((item, idx) => {
                const IconComponent = iconMap[item.icon] || Shield;
                return (
                  <div className="flex items-start gap-3 p-4" key={idx}>
                    <IconComponent className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-base text-white leading-tight">
                        {item.title}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {item.description}
                      </div>
                      {item.status && (
                        <div className="text-gray-400 text-sm">
                          Status: {item.status}
                        </div>
                      )}
                      {item.date && (
                        <div className="text-gray-400 text-xs">
                          Date: {item.date}
                        </div>
                      )}
                      {item.time && (
                        <div className="text-gray-400 text-xs">
                          Time: {item.time}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Desktop/Tablet Old Content (hidden on mobile) */}
        <div className="hidden flex-1 grid-cols-1 overflow-hidden md:grid md:grid-cols-2">
          {/* Left Column: Transaction Details */}
          <div className="flex flex-col gap-4 overflow-y-auto border-[#26272F] border-r p-6">
            <div>
              <div className="mb-4 font-semibold text-lg text-white">
                Transaction Details
              </div>
              {/* Amount Paid Card */}
              <div className="mb-4 flex flex-col gap-0.5 rounded-md border border-[#353640] bg-[#17171A] p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-gray-400 text-xs">
                      Amount Paid
                    </span>
                    <span className="block font-bold text-2xl text-white">
                      {data.amountPaid}
                    </span>
                    <span className="mt-1 block text-gray-400 text-xs">
                      {data.equivalent}
                    </span>
                  </div>
                  <div className="min-w-0 max-w-[180px] truncate text-right font-semibold text-sm text-white">
                    {data.receiver}
                  </div>
                </div>
              </div>
            </div>
            {/* Details Table/Rows */}
            <div className="divide-y divide-[#292933] overflow-hidden rounded-lg border border-[#282A33]">
              <DetailRow label="Paid on" value={data.paidOn} />
              <DetailRow label="Payment Method" value={data.paymentMethod} />
              <DetailRow
                copyValue={data.id}
                label="ID"
                onCopy={copyToClipboard}
                value={data.id}
                valueClass="text-blue-400 font-mono text-xs"
              />
              <DetailRow
                label="Token"
                value={<TokenOrChain label={data.token} type="token" />}
              />
              <DetailRow
                label="Blockchain"
                value={<TokenOrChain label={data.blockchain} type="chain" />}
              />
              <DetailRow label="Network Fee" value={data.networkFee} />
              <DetailRow
                copyValue={data.receiverAddress}
                label="Receiver"
                onCopy={copyToClipboard}
                value={data.receiverAddress}
                valueClass="text-blue-400 font-mono text-xs"
              />
              <DetailRow
                copyValue={data.senderAddress}
                label="Sender"
                onCopy={copyToClipboard}
                value={data.senderAddress}
                valueClass="text-blue-400 font-mono text-xs"
              />
              <DetailRow
                label="Status"
                value={
                  <Badge className="bg-green-900 text-green-200 text-xs">
                    {data.status}
                  </Badge>
                }
              />
              <DetailRow
                label="Device Type"
                value={
                  <span className="font-semibold">
                    {data.deviceType || "N/A"}
                  </span>
                }
              />
              <DetailRow
                label="Attempts"
                value={data.attempts !== undefined ? data.attempts : 0}
              />
              <DetailRow
                label="Error"
                value={
                  <span className="text-red-400">{data.error || "None"}</span>
                }
              />
            </div>
          </div>
          {/* Right Column: Activity Log */}
          <div className="flex flex-col gap-4 overflow-y-auto bg-[#17171A] p-6">
            <div>
              <div className="mb-4 font-semibold text-lg text-white">
                Activity Log
              </div>
              <div className="flex flex-col gap-3">
                {data.activityLog?.map((item, idx) => {
                  const IconComponent = iconMap[item.icon] || Shield;
                  return (
                    <div className="flex items-start gap-3 p-4" key={idx}>
                      <IconComponent className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-base text-white leading-tight">
                          {item.title}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {item.description}
                        </div>
                        {item.status && (
                          <div className="text-gray-400 text-sm">
                            Status: {item.status}
                          </div>
                        )}
                        {item.date && (
                          <div className="text-gray-400 text-xs">
                            Date: {item.date}
                          </div>
                        )}
                        {item.time && (
                          <div className="text-gray-400 text-xs">
                            Time: {item.time}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Horizontal separator line */}
            <div className="my-4 border-gray-700 border-t" />

            {/* Device Type, Attempts, Error section with large number */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-gray-400 text-xs uppercase">
                    DEVICE TYPE
                  </div>
                  <div className="text-sm text-white">
                    {data.deviceType || "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-gray-400 text-xs uppercase">
                      ATTEMPTS
                    </div>
                    <div className="text-sm text-white">
                      {data.attempts !== undefined ? data.attempts : 0} attempt
                      {data.attempts !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="font-bold text-6xl text-white leading-none">
                  {data.attempts !== undefined ? data.attempts : 0}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <div>
                  <div className="text-red-400 text-xs uppercase">ERROR</div>
                  <div className="text-sm text-white">
                    {data.error || "None"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label,
  value,
  copyValue,
  valueClass = "",
  onCopy,
}: {
  label: string;
  value: React.ReactNode;
  copyValue?: string;
  valueClass?: string;
  onCopy?: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 last:rounded-b">
      <span className="whitespace-nowrap text-gray-400 text-sm">{label}</span>
      <span
        className={
          "ml-auto flex items-center gap-2 overflow-hidden text-sm text-white" +
          valueClass
        }
      >
        <span className="block min-w-0 max-w-[200px] truncate">{value}</span>
        {copyValue && onCopy && (
          <Button
            className="shrink-0 p-1 hover:bg-[#23243a]"
            onClick={() => onCopy(copyValue)}
            size="sm"
            variant="ghost"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </span>
    </div>
  );
}

function TokenOrChain({
  label,
  type,
}: {
  label: string;
  type: "token" | "chain";
}) {
  return (
    <span className="flex items-center gap-2">
      <div
        className={
          type === "token"
            ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-500"
            : "flex h-6 w-6 items-center justify-center rounded-full bg-blue-500"
        }
      >
        <span className="font-bold text-white text-xs">
          {type === "token" ? "T" : "B"}
        </span>
      </div>
      <span className="font-medium text-white">{label}</span>
    </span>
  );
}

function ReceiptRow({
  label,
  value,
  copy,
  clipboard,
  onCopy,
}: {
  label: string;
  value: React.ReactNode;
  copy?: boolean;
  clipboard?: string;
  onCopy?: (v: string) => void;
}) {
  return (
    <div className="py-3">
      <div className="mb-1 text-gray-400 text-xs">{label}</div>
      <div className="flex w-full items-center gap-2 break-all text-sm text-white">
        {value}
        {clipboard && onCopy && (
          <Button
            className="shrink-0 p-1 hover:bg-[#23243a]"
            onClick={() => onCopy(clipboard)}
            size="sm"
            variant="ghost"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
