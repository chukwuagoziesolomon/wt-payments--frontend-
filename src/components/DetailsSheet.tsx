"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, QrCode, Shield, Zap, Download, Monitor, Clock, AlertCircle } from "lucide-react";
import type { DetailsData } from "@/types";
import * as React from "react";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="max-w-5xl w-full h-screen p-0 bg-[#17171A] rounded-lg border border-[#282A33] overflow-hidden flex flex-col [&::-webkit-scrollbar]:hidden [&_*::-webkit-scrollbar]:w-2 [&_*::-webkit-scrollbar-track]:bg-transparent [&_*::-webkit-scrollbar-thumb]:bg-gray-700 [&_*::-webkit-scrollbar-thumb]:rounded-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 h-full overflow-hidden">
          {/* Left Column: Transaction Details */}
          <div className="p-6 flex flex-col gap-4 border-r border-[#26272F] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
            <div>
              <div className="text-lg font-semibold text-white mb-4">Transaction Details</div>
              {/* Amount Paid Card */}
              <div className="bg-[#17171A] p-4 rounded-md flex flex-col gap-0.5 border border-[#353640] mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-xs text-gray-400">Amount Paid</span>
                    <span className="block text-2xl font-bold text-white">{data.amountPaid}</span>
                    <span className="block text-xs text-gray-400 mt-1">{data.equivalent}</span>
                  </div>
                  <div className="text-sm font-semibold text-white text-right">{data.receiver}</div>
                </div>
              </div>
            </div>

            {/* Details Table/Rows */}
            <Card className="bg-[#17171A] divide-y divide-[#292933] border border-[#282A33] overflow-hidden rounded-lg">
              <CardContent className="p-0">
                <DetailRow label="Paid on" value={data.paidOn} />
                <DetailRow label="Payment Method" value={data.paymentMethod} />
                <DetailRow
                  label="ID"
                  value={data.id}
                  copyValue={data.id}
                  valueClass="text-blue-400 font-mono text-xs"
                  onCopy={copyToClipboard}
                />
                <DetailRow label="Token" value={<TokenOrChain label={data.token} type="token" />} />
                <DetailRow label="Blockchain" value={<TokenOrChain label={data.blockchain} type="chain" />} />
                <DetailRow label="Network Fee" value={data.networkFee} />
                <DetailRow
                  label="Receiver"
                  value={data.receiverAddress}
                  copyValue={data.receiverAddress}
                  valueClass="text-blue-400 font-mono text-xs"
                  onCopy={copyToClipboard}
                />
                <DetailRow
                  label="Sender"
                  value={data.senderAddress}
                  copyValue={data.senderAddress}
                  valueClass="text-blue-400 font-mono text-xs"
                  onCopy={copyToClipboard}
                />
                <DetailRow
                  label="QR Code (Sender)"
                  value={
                    <div className="flex items-center gap-2">
                      <img src="https://via.placeholder.com/40x40?text=QR" alt="QR Code" className="w-10 h-10 rounded bg-neutral-800 border border-gray-700" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(data.qrCode)}
                        className="hover:bg-[#23243a] p-1"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  }
                />
                <DetailRow
                  label="Status"
                  value={<Badge className="bg-green-900 text-green-200 text-xs">{data.status}</Badge>}
                />
                {data.deviceType && <DetailRow label="Device Type" value={<span className="font-semibold">{data.deviceType}</span>} />}
                {data.attempts !== undefined && <DetailRow label="Attempts" value={data.attempts} />}
                {data.error && <DetailRow label="Error" value={<span className="text-red-400">{data.error}</span>} />}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Activity Log */}
          <div className="p-6 flex flex-col gap-4 bg-[#17171A] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
            <div>
              <div className="text-lg font-semibold text-white mb-4">Activity Log</div>
              <Card className="bg-[#17171A]">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-3">
                    {data.activityLog?.map((item, idx) => {
                      const IconComponent = iconMap[item.icon] || Shield;
                      return (
                        <div key={idx} className="flex items-start gap-3 p-4">
                          <IconComponent className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-base leading-tight">{item.title}</div>
                            <div className="text-gray-400 text-sm">{item.description}</div>
                            {item.status && <div className="text-gray-400 text-sm">Status: {item.status}</div>}
                            {item.date && <div className="text-gray-400 text-xs">Date: {item.date}</div>}
                            {item.time && <div className="text-gray-400 text-xs">Time: {item.time}</div>}
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
                <div className="border-t border-gray-700 my-4"></div>
                
                {/* Device Type, Attempts, Error section with large number */}
                <div className="space-y-3">
                  {data.deviceType && (
                    <Card className="bg-[#17171A] border border-[#282A33] rounded-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-gray-400 text-xs uppercase">DEVICE TYPE</div>
                            <div className="text-white text-sm">{data.deviceType}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {data.attempts !== undefined && (
                    <Card className="bg-[#17171A] border border-[#282A33] rounded-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-gray-400 text-xs uppercase">ATTEMPTS</div>
                              <div className="text-white text-sm">{data.attempts} attempt{data.attempts !== 1 ? 's' : ''}</div>
                            </div>
                          </div>
                          <div className="text-white text-6xl font-bold leading-none">{data.attempts}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {data.error && (
                    <Card className="bg-[#17171A] border border-[#282A33] rounded-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <div>
                            <div className="text-red-400 text-xs uppercase">ERROR</div>
                            <div className="text-white text-sm">{data.error}</div>
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

function DetailRow({ label, value, copyValue, valueClass = '', onCopy }: {
  label: string;
  value: React.ReactNode;
  copyValue?: string;
  valueClass?: string;
  onCopy?: (v: string) => void;
}) {
  return (
    <div className="flex justify-between items-center px-4 py-3 gap-2 last:rounded-b">
      <span className="text-gray-400 text-sm whitespace-nowrap">{label}</span>
      <span className={"text-white text-sm ml-auto flex items-center gap-2 " + valueClass}>
        {value}
        {copyValue && onCopy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(copyValue)}
            className="hover:bg-[#23243a] p-1"
          >
            <Copy className="w-4 h-4" />
          </Button>
        )}
      </span>
    </div>
  );
}

function TokenOrChain({ label, type }: { label: string; type: "token"|"chain" }) {
  return (
    <span className="flex items-center gap-2">
      <div className={type === "token" ? "w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center" : "w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"}>
        <span className="text-white text-xs font-bold">{type === "token" ? "T" : "B"}</span>
      </div>
      <span className="text-white font-medium">{label}</span>
    </span>
  );
}
