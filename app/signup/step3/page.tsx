"use client"

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupStep3() {
  const router = useRouter();

  const [nin, setNin] = React.useState("");
  const [bvn, setBvn] = React.useState("");
  const [cac, setCac] = React.useState("");
  const [authFile, setAuthFile] = React.useState<File | null>(null);
  const [cacFile, setCacFile] = React.useState<File | null>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phoneCode, setPhoneCode] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [businessType, setBusinessType] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [showReviewModal, setShowReviewModal] = React.useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) setAuthFile(f);
  }

  function onCacFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) setCacFile(f);
  }

  function validate() {
    // ensure we have email and that the user provided a password
    if (!email) return "Missing email from previous step";
    if (!password) return "Password is required";
    if (!nin.trim()) return "NIN is required";
    if (!bvn.trim()) return "BVN is required";
    // require CAC and documents only for registered businesses
    if (businessType === "registered") {
      if (!cac.trim()) return "CAC/RC number is required for registered businesses";
      if (!cacFile) return "CAC certificate is required for registered businesses";
      if (!authFile) return "Shareholder authorization letter is required for registered businesses";
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("email", email);
      form.append("password", password);
      form.append("password_confirmation", password);
      const phone = `${phoneCode || ""}${phoneNumber || ""}`;
      form.append("phone", phone);
      form.append("business_name", businessName || "");
      if (businessType) form.append("business_type", businessType);
      form.append("bvn", bvn);
      // include NIN optionally
      form.append("nin", nin);

      if (businessType === "registered") {
        form.append("cac_number", cac);
        if (cacFile) form.append("cac_documents", cacFile);
        if (authFile) form.append("shareholders_approval_letter", authFile);
      } else {
        // For starter businesses still include approval letter if provided
        if (authFile) form.append("shareholders_approval_letter", authFile);
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
      const res = await fetch(`${apiBase}/user/account/signup`, {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.error === false) {
        // clear saved draft so user doesn't resume
        try { localStorage.removeItem("signupDraft"); } catch (e) {}
        setShowReviewModal(true);
      } else {
        const msg = data && data.data ? data.data : `Signup failed (${res.status})`;
        alert(msg);
      }
    } catch (err) {
      alert("Network error while submitting signup. Is the backend running at http://localhost:3333 ?");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  // load draft values from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("signupDraft");
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.email) setEmail(draft.email);
      if (draft.phoneCode) setPhoneCode(draft.phoneCode);
      if (draft.phoneNumber) setPhoneNumber(draft.phoneNumber);
      if (draft.businessName) setBusinessName(draft.businessName);
      if (draft.business_type) setBusinessType(draft.business_type);
    } catch (err) {
      // ignore
    }
  }, []);

  function goToLogin() {
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <div className="h-2 w-full rounded-full bg-muted/30">
            <div className="h-2 w-full rounded-full bg-primary" />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="text-primary font-bold">Western Treasury</div>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Business verification</CardTitle>
              <CardDescription>Provide identity and company documents to open your account.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="rounded-md border border-border p-3 bg-card">
                  <label className="block text-base text-muted-foreground mb-2">Email</label>
                  <Input className="border-0 bg-transparent px-0" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
                </div>

                <div className="rounded-md border border-border p-3 bg-card">
                  <label className="block text-base text-muted-foreground mb-2">Password</label>
                  <Input className="border-0 bg-transparent px-0" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" />
                </div>

                <div className="rounded-md border border-border p-3 bg-card">
                  <label className="block text-base text-muted-foreground mb-2">NIN</label>
                  <Input className="border-0 bg-transparent px-0" value={nin} onChange={(e) => setNin(e.target.value)} placeholder="National Identification Number" />
                </div>

                <div className="rounded-md border border-border p-3 bg-card">
                  <label className="block text-base text-muted-foreground mb-2">BVN</label>
                  <Input className="border-0 bg-transparent px-0" value={bvn} onChange={(e) => setBvn(e.target.value)} placeholder="Bank Verification Number" />
                </div>

                {/* Show CAC and shareholder uploads only for registered businesses */}
                {businessType === "registered" ? (
                  <>
                    <div className="rounded-md border border-border p-3 bg-card">
                      <label className="block text-base text-muted-foreground mb-2">CAC / RC Number</label>
                      <Input className="border-0 bg-transparent px-0" value={cac} onChange={(e) => setCac(e.target.value)} placeholder="CAC registration number" />
                    </div>

                    <div className="rounded-md border-2 border-dashed border-border p-4 bg-card">
                      <label className="block text-sm text-muted-foreground mb-2">CAC certificate (PDF or image)</label>
                      <div className="mt-2 flex items-center justify-center">
                        <input type="file" accept="application/pdf,image/*" onChange={onCacFileChange} className="w-full text-sm" />
                      </div>
                      {cacFile && <div className="text-sm text-muted-foreground mt-2">Selected: {cacFile.name}</div>}
                      <p className="text-sm text-muted-foreground mt-2">Accepted formats: PDF, JPG, PNG. Max size: 10MB</p>
                    </div>

                    <div className="rounded-md border-2 border-dashed border-border p-4 bg-card">
                      <label className="block text-sm text-muted-foreground mb-2">Shareholder authorization letter (PDF or image)</label>
                      <div className="mt-2 flex items-center justify-center">
                        <input type="file" accept="application/pdf,image/*" onChange={onFileChange} className="w-full text-sm" />
                      </div>
                      {authFile && <div className="text-sm text-muted-foreground mt-2">Selected: {authFile.name}</div>}
                      <p className="text-sm text-muted-foreground mt-2">Accepted formats: PDF, JPG, PNG. Max size: 10MB</p>
                    </div>
                  </>
                ) : null}

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit for review"}</Button>
                  <Link href="/" className="text-sm text-muted-foreground underline">Cancel</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 w-full max-w-lg text-center">
            <h3 className="text-lg font-semibold mb-4">Information under review</h3>
            <p className="text-sm text-muted-foreground mb-6">Thanks — we've received your documents. Our team will review your submission and contact you at the email you provided.</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setShowReviewModal(false)}>Close</Button>
              <Button variant="outline" onClick={goToLogin}>Go to Login</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
