"use client"

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: replace with real auth call
    console.log({ email, password });
    // Navigate to the dashboard on success
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-3xl">
        <div className="flex justify-center mb-6">
          <div className="text-primary font-bold">Western Treasury</div>
        </div>

        <div className="mx-auto max-w-xl">
          <Card className="max-w-xl py-10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Welcome back!</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={onSubmit} className="bg-card mx-auto w-full">
                <div className="mb-6">
                  <label className="block text-base text-muted-foreground mb-2">Email address</label>
                  <div className="rounded-md border border-border p-3">
                    <Input className="border-0 bg-transparent px-0" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-base text-muted-foreground mb-2">Password</label>
                  <div className="rounded-md border border-border p-3">
                    <Input className="border-0 bg-transparent px-0" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-center">
                    <Button type="submit" className="w-44">Sign in</Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account? <Link href="/signup" className="text-primary">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
