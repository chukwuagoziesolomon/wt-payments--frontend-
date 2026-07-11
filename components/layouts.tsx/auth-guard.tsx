"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export function AuthGuard() {
  const router = useRouter();
  const { notify } = useToast();

  useEffect(() => {
    function handleExpired() {
      notify("Your session has expired. Please log in again.");
      // Small delay so the toast is visible before navigation
      setTimeout(() => {
        router.push("/login");
      }, 1800);
    }

    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [router, notify]);

  return null;
}
