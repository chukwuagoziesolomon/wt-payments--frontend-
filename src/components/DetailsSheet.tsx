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
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { DetailsData } from "@/types";

interface DetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DetailsData | null;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  shield: Shield,
  zap: Zap,
  download: Download,
  monitor: Monitor,
  clock: Clock,
  alert: AlertCircle,
};

export function DetailsSheet({ open, onOpenChange, data }: DetailsSheetProps) {
  if (!data) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className="flex h-screen w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-[#282A33] bg-[#17171A] p-0 [&::-webkit-scrollbar]:hidden [&_*::-webkit-scrollbar-thumb]:rounded-full [&_*::-webkit-scrollbar-thumb]:bg-gray-700 [&_*::-webkit-scrollbar-track]:bg-transparent [&_*::-webkit-scrollbar]:w-2"
        side="right"
      >
        <div className="grid h-full grid-cols-1 overflow-hidden md:grid-cols-2">
          {/* Left Column: Transaction Details */}
          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700 flex flex-col gap-4 overflow-y-auto border-[#26272F] border-r p-6">
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
            <Card className="divide-y divide-[#292933] overflow-hidden rounded-lg border border-[#282A33] bg-[#17171A]">
              <CardContent className="p-0">
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
                {data.deviceType && (
                  <DetailRow
                    label="Device Type"
                    value={
                      <span className="font-semibold">{data.deviceType}</span>
                    }
                  />
                )}
                {data.attempts !== undefined && (
                  <DetailRow label="Attempts" value={data.attempts} />
                )}
                {data.error && (
                  <DetailRow
                    label="Error"
                    value={<span className="text-red-400">{data.error}</span>}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Activity Log */}
          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700 flex flex-col gap-4 overflow-y-auto bg-[#17171A] p-6">
            <div>
              <div className="mb-4 font-semibold text-lg text-white">
                Activity Log
              </div>
              <Card className="bg-[#17171A]">
                <CardContent className="p-0">
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
                </CardContent>
              </Card>
            </div>

            {/* Horizontal separator line */}
            {(data.deviceType || data.attempts !== undefined || data.error) && (
              <>
                <div className="my-4 border-gray-700 border-t" />

                {/* Device Type, Attempts, Error section with large number */}
                <div className="space-y-3">
                  {data.deviceType && (
                    <Card className="rounded-lg border border-[#282A33] bg-[#17171A]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-gray-400 text-xs uppercase">
                              DEVICE TYPE
                            </div>
                            <div className="text-sm text-white">
                              {data.deviceType}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {data.attempts !== undefined && (
                    <Card className="rounded-lg border border-[#282A33] bg-[#17171A]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-gray-400 text-xs uppercase">
                                ATTEMPTS
                              </div>
                              <div className="text-sm text-white">
                                {data.attempts} attempt
                                {data.attempts !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-6xl text-white leading-none">
                            {data.attempts}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {data.error && (
                    <Card className="rounded-lg border border-[#282A33] bg-[#17171A]">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <div>
                            <div className="text-red-400 text-xs uppercase">
                              ERROR
                            </div>
                            <div className="text-sm text-white">
                              {data.error}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
