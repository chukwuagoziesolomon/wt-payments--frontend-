import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface BlockchainOption {
  label: string;
  icon: React.ReactNode;
  value: string;
  disabled?: boolean;
  badge?: string;
}

interface SelectBlockchainSheetProps {
  open: boolean;
  onClose: () => void;
  options: BlockchainOption[];
  onSelect: (value: string) => void;
}

export function SelectBlockchainSheet({
  open,
  onClose,
  options,
  onSelect,
}: SelectBlockchainSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="max-w-sm w-full bg-[#191A1E] p-6 border-none">
        <SheetHeader className="mb-2">
          <SheetTitle className="text-lg font-semibold text-white">Select Blockchain</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Select the blockchain you would like to transfer
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          {options.map((option) => (
            <button
              key={option.value}
              disabled={option.disabled}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg bg-[#23242A] border border-[#23242A] text-left transition-colors",
                option.disabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-[#23242A]/80 focus:outline-none"
              )}
              onClick={() => !option.disabled && onSelect(option.value)}
              type="button"
            >
              <span className="w-8 h-8 flex items-center justify-center bg-[#23242A] rounded-full">
                {option.icon}
              </span>
              <span className="text-base font-medium text-white flex-1">{option.label}</span>
              {option.badge && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2a2a3a] text-muted-foreground border border-border">
                  {option.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
