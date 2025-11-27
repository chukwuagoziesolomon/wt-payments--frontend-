"use client"

import * as React from "react";
import SignupOptionCard from "@/components/SignupOptionCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [country, setCountry] = React.useState("");
  const [selected, setSelected] = React.useState<string | null>(null);
  const COUNTRIES = [
    { code: "NG", name: "Nigeria" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "IN", name: "India" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "AU", name: "Australia" },
    { code: "ZA", name: "South Africa" },
    { code: "KE", name: "Kenya" },
  ];

  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <div className="h-2 w-full rounded-full bg-muted/30">
            <div className="h-2 w-1/3 rounded-full bg-primary" />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="text-primary font-bold">Western Treasury</div>
        </div>

        <div className="mx-auto max-w-4xl px-4">
          <Card className="p-6 md:p-10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">What type of account would you like to create ?</CardTitle>
              <CardDescription>Choose the option that fits your organization.</CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // navigate when at least a business option is selected
                  if (selected) {
                    router.push(`/signup/step2?country=${encodeURIComponent(country)}&type=${encodeURIComponent(selected)}`);
                  }
                }}
                className="mb-4"
              >
                <label className="block text-sm text-muted-foreground mb-2">Country</label>

                <div className="relative rounded-md border border-border bg-card p-1 mb-4 focus-within:ring-2 focus-within:ring-primary/20">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="appearance-none w-full bg-card text-card-foreground px-3 py-2 text-base outline-none rounded-md focus-visible:ring-[3px] focus-visible:ring-primary/30"
                    aria-label="Select country"
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-3">What type of business do you own?</label>
                  <div className="flex flex-col gap-3">
                    <SignupOptionCard
                      id="starter"
                      title="Starter Business"
                      description={"I'm testing my ideas with customers and preparing to formally register my company"}
                      selected={selected === "starter"}
                      onSelect={(id) => setSelected(id)}
                    />

                    <SignupOptionCard
                      id="registered"
                      title="Registered Business"
                      description={"My business has obtained the necessary approvals, documentation, and license to operate legally"}
                      selected={selected === "registered"}
                      onSelect={(id) => setSelected(id)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col items-center gap-3">
                  <Button type="submit" disabled={!selected}>Continue</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
