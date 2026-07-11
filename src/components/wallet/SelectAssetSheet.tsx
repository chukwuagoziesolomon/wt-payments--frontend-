import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AssetOption {
  label: string;
  icon: React.ReactNode;
  value: string;
}

interface SelectAssetSheetProps {
  open: boolean;
  onClose: () => void;
  options: AssetOption[];
  onSelect: (value: string) => void;
}

export function SelectAssetSheet({
  open,
  onClose,
  options,
  onSelect,
}: SelectAssetSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="max-w-sm w-full bg-[#191A1E] p-6 border-none">
        <SheetHeader className="mb-2">
          <SheetTitle className="text-lg font-semibold text-white">Select Asset</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Select the asset you would like to transfer
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          {options.map((option) => (
            <button
              key={option.value}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg bg-[#23242A] hover:bg-[#23242A]/80 border border-[#23242A] text-left transition-colors",
                "focus:outline-none"
              )}
              onClick={() => onSelect(option.value)}
              type="button"
            >
              <span className="w-8 h-8 flex items-center justify-center bg-[#23242A] rounded-full">
                {option.icon}
              </span>
              <span className="text-base font-medium text-white">{option.label}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
