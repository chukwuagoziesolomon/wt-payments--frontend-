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
  const [firstName, setFirstName] = React.useState("");
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
      if (firstName) form.append("full_name", firstName);
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

      const apiBase = "/backend";
      const res = await fetch(`${apiBase}/user/account/signup`, {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.error === false) {
        // clear saved draft so user doesn't resume
        try { localStorage.removeItem("signupDraft"); } catch (e) {}
        try { sessionStorage.removeItem("signupPassword"); } catch (e) {}
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
      if (draft.firstName) setFirstName(draft.firstName);
      if (draft.business_type) setBusinessType(draft.business_type);
    } catch (err) {
      // ignore
    }
    // load password from sessionStorage (set in step 2)
    try {
      const pw = sessionStorage.getItem("signupPassword");
      if (pw) setPassword(pw);
    } catch (err) {}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div
            className="relative w-full max-w-md rounded-2xl border border-[#3a3a40] overflow-hidden"
            style={{ background: "linear-gradient(160deg, #17171a 0%, #0e0e10 100%)" }}
          >
            {/* top accent bar */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #5b4dd4, #9d8df1, #b8a4f9)" }} />

            {/* subtle grid bg */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: "linear-gradient(rgba(79,79,143,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(79,79,143,0.07) 1px,transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative px-8 py-10 flex flex-col items-center text-center">
              {/* icon */}
              <div className="mb-6 relative">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(91,77,212,0.25), rgba(157,141,241,0.15))", border: "1px solid rgba(157,141,241,0.3)" }}
                >
                  {/* checkmark */}
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="17" stroke="url(#ck-grad)" strokeWidth="1.5" />
                    <path d="M11 18.5l5 5 9-10" stroke="#9d8df1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="ck-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#9d8df1" />
                        <stop offset="1" stopColor="#5b4dd4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                {/* glow */}
                <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(157,141,241,0.2) 0%, transparent 70%)" }} />
              </div>

              {/* heading */}
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                Application submitted!
              </h3>
              <div className="w-10 h-0.5 rounded-full mb-4" style={{ background: "linear-gradient(90deg, #9d8df1, #5b4dd4)" }} />

              {/* body */}
              <p className="text-sm text-[#b8b8b8] leading-relaxed mb-8 max-w-sm">
                We've received your documents and your account is now{" "}
                <span className="text-[#9d8df1] font-medium">under review</span>.
                Our team will verify your submission and reach out to you at the email you provided.
              </p>

              {/* steps */}
              <div className="w-full rounded-xl border border-[#2a2a30] bg-[#111114] p-4 mb-8 text-left space-y-3">
                {[
                  { step: "1", label: "Documents submitted", done: true },
                  { step: "2", label: "Admin review (1–2 business days)", done: false },
                  { step: "3", label: "Account activated", done: false },
                ].map(({ step, label, done }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={done
                        ? { background: "linear-gradient(135deg,#9d8df1,#5b4dd4)", color: "#fff" }
                        : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)" }
                      }
                    >
                      {done ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5.5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : step}
                    </div>
                    <span className={`text-sm ${done ? "text-white font-medium" : "text-[#666]"}`}>{label}</span>
                  </div>
                ))}
              </div>

              {/* actions */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={goToLogin}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#9d8df1,#5b4dd4)" }}
                >
                  Go to Login
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
