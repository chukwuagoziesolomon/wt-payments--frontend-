"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CompleteOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [businessName, setBusinessName] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [bvn, setBvn] = React.useState("");
  const [nin, setNin] = React.useState("");
  const [cacNumber, setCacNumber] = React.useState("");

  React.useEffect(() => {
    const existingEmail = localStorage.getItem("email") || localStorage.getItem("authEmail") || "";
    const existingName = localStorage.getItem("full_name") || localStorage.getItem("userFullName") || "";
    if (existingEmail) setEmail(existingEmail);
    if (existingName) setFullName(existingName);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
      const response = await fetch("/backend/user/account/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          business_name: businessName,
          full_name: fullName,
          email,
          phone,
          bvn,
          nin,
          cac_number: cacNumber,
          business_type: cacNumber ? "registered" : "starter",
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || json.error) {
        throw new Error(json.data || json.message || "Unable to complete your onboarding.");
      }
      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to continue onboarding.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Complete your signup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">
              Your CCC wallet is connected, but your account is still incomplete. Finish the remaining business and identity details to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Business name</label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Acme Business" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Full name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2348000000000" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">BVN</label>
                <Input value={bvn} onChange={(e) => setBvn(e.target.value)} placeholder="BVN" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">NIN</label>
                <Input value={nin} onChange={(e) => setNin(e.target.value)} placeholder="NIN" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">CAC number (optional for starter)</label>
                <Input value={cacNumber} onChange={(e) => setCacNumber(e.target.value)} placeholder="CAC number" />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving…" : "Finish signup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
