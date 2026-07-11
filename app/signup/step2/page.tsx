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

export default function SignupStep2() {
  const router = useRouter();
  const [businessName, setBusinessName] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneCode, setPhoneCode] = React.useState("+234");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [password, setPassword] = React.useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // For now, navigate to root/dashboard after submit
     console.log({ businessName, firstName, email, phoneCode, phoneNumber });
     router.push("/signup/step3");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <div className="h-2 w-full rounded-full bg-muted/30">
            <div className="h-2 w-2/3 rounded-full bg-primary" />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="text-primary font-bold">Western Treasury</div>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Let's get to know you</CardTitle>
              <CardDescription />
            </CardHeader>

            <CardContent>
              <form onSubmit={onSubmit} className="bg-card mx-auto max-w-xl">
                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">Business name</label>
                  <div className="rounded-md border border-border p-3">
                    <Input className="border-0 bg-transparent px-0" placeholder="Enter business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">First name</label>
                  <div className="rounded-md border border-border p-3">
                    <Input className="border-0 bg-transparent px-0" placeholder="Enter first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">Email address</label>
                  <div className="rounded-md border border-border p-3">
                    <Input className="border-0 bg-transparent px-0" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">Phone Number</label>
                  <div className="rounded-md border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <select
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value)}
                          className="h-9 rounded-md border border-input bg-input/40 px-2 text-sm text-muted-foreground"
                        >
                          <option value="+234">🇳🇬 +234</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+254">🇰🇪 +254</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <Input className="border-0 bg-transparent px-0" placeholder="909 687 9086" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">Password</label>
                  <div className="rounded-md border border-border p-3">
                    <Input className="border-0 bg-transparent px-0" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>

                {/* Submit button removed per request */}
                  <div className="mb-4">
                    <div className="flex justify-center">
                      <Button type="submit" className="w-44">Continue</Button>
                    </div>
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
