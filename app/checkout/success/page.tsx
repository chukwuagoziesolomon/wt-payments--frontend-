"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referenceId = searchParams.get("reference_id");

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
      <Card className="bg-[#19191d] border-border max-w-md w-full">
        <CardContent className="py-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Order Confirmed</h2>
          {referenceId && (
            <p className="text-xs text-muted-foreground">
              Reference:{" "}
              <span className="text-white/80 font-mono">{referenceId}</span>
            </p>
          )}
          <p className="text-muted-foreground text-sm">
            Payment received. You will receive an email confirmation shortly.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white"
          >
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
