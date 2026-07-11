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

const API = "/backend";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/user/account/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (json.error || !json.result?.token) {
        setError(json.data ?? "Login failed. Please try again.");
        return;
      }

      // Persist token and environment info
      localStorage.setItem("authToken", json.result.token);
      localStorage.setItem("token", json.result.token);

      router.push("/dashboard");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
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
                {error && (
                  <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-base text-muted-foreground mb-2">Email address</label>
                  <div className="rounded-md border border-border p-3">
                    <Input className="border-0 bg-transparent px-0" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-base text-muted-foreground mb-2">Password</label>
                  <div className="rounded-md border border-border p-3">
                    <Input className="border-0 bg-transparent px-0" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-center">
                    <Button type="submit" className="w-44" disabled={loading}>
                      {loading ? "Signing in…" : "Sign in"}
                    </Button>
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
