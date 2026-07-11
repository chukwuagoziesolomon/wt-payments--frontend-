"use client";
import * as React from "react";
import { WithdrawalOtpModal } from "@/src/components/wallet/WithdrawalOtpModal";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export default function WithdrawOtpPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [showOtpModal, setShowOtpModal] = React.useState(true);

  return (
    <WithdrawalOtpModal
      open={showOtpModal}
      onClose={() => {
        setShowOtpModal(false);
        router.back();
      }}
      email="ezeemma....@gmail.com"
      onVerify={(code: string) => {
        setShowOtpModal(false);
        router.replace("/dashboard/wallet");
      }}
      onResend={() => notify("Verification code resent!")}
    />
  );
}
