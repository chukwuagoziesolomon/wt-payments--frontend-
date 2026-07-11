"use client";
import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function NoBankAccountModal({ open, onClose, onManage }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-[540px] bg-[#19191d] border-0 p-0 rounded-2xl shadow-2xl flex flex-col items-center">
        <div className="w-full flex flex-col items-center pt-8 pb-8">
          <div className="flex justify-center w-full mb-8">
            <div className="flex rounded-lg border border-[#4f4f8f] bg-[#17171a] w-[420px] h-14 items-center">
              <button className="flex-1 rounded-lg text-lg font-medium transition-colors duration-150 bg-[#23243a] text-white shadow-inner" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>Crypto</button>
              <button className="flex-1 rounded-lg text-lg font-medium transition-colors duration-150 bg-transparent text-white" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>Fiat</button>
            </div>
          </div>
          <div className="text-center text-[#bcbcff] text-base font-medium mb-8 mt-8">
            You Have not configured your bank account click on manage account to configure
          </div>
          <Button className="w-56 bg-[#6c5dd3] text-white text-base font-semibold py-3 rounded-md" onClick={onManage}>
            Manage Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
