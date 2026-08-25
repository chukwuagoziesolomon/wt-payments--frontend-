"use client";

import { useState } from "react";
import { TreasuryCard } from "@/components/TreasuryCard";

const lineItems = [
  { label: "Treasury Card — Obsidian", amount: 0 },
  { label: "Physical card, expedited shipping", amount: 12 },
  { label: "Estimated tax", amount: 0.96 },
];

const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

export default function CheckoutPage() {
  const [method, setMethod] = useState<"card" | "crypto">("card");

  return (
    <main className="min-h-screen bg-base-bg bg-radial-fade px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm text-ink-muted mb-8">
          <span className="text-ink-secondary">Product</span>
          <span className="mx-2">/</span>
          <span className="text-ink-primary">Checkout</span>
        </p>

        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10">
          {/* Order summary */}
          <section className="lg:order-2">
            <div className="rounded-2xl border border-base-border bg-base-surface p-6 lg:sticky lg:top-16">
              <div className="flex justify-center mb-6">
                <TreasuryCard small />
              </div>

              <h2 className="text-ink-primary font-medium text-sm mb-4">
                Order summary
              </h2>

              <ul className="space-y-3">
                {lineItems.map((item) => (
                  <li
                    key={item.label}
                    className="flex justify-between text-sm text-ink-secondary"
                  >
                    <span>{item.label}</span>
                    <span className="font-mono tabular text-ink-primary">
                      {item.amount === 0 ? "Free" : `$${item.amount.toFixed(2)}`}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-5 border-t border-base-border flex justify-between items-baseline">
                <span className="text-ink-primary font-medium text-sm">Total due today</span>
                <span className="font-mono tabular text-xl font-semibold text-ink-primary">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-mint bg-mint/10 border border-mint/20 rounded-lg px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                Ships within 2 business days
              </div>
            </div>
          </section>

          {/* Payment form */}
          <section className="lg:order-1">
            <h1 className="text-2xl font-semibold text-ink-primary tracking-tight mb-1">
              Complete your order
            </h1>
            <p className="text-sm text-ink-muted mb-8">
              Your treasury balance and account details stay encrypted end to end.
            </p>

            <div className="mb-6">
              <p className="text-xs font-medium text-ink-secondary mb-2 uppercase tracking-wide">
                Pay with
              </p>
              <div className="inline-flex rounded-xl border border-base-border bg-base-surface p-1 gap-1">
                {(["card", "crypto"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      method === m
                        ? "bg-violet-gradient text-white shadow-glow"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {m === "card" ? "Card" : "Crypto wallet"}
                  </button>
                ))}
              </div>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {method === "card" ? (
                <>
                  <Field label="Card number" placeholder="4291 •••• •••• 8402" mono />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry" placeholder="MM / YY" mono />
                    <Field label="CVC" placeholder="•••" mono />
                  </div>
                  <Field label="Name on card" placeholder="Adaeze Chukwu" />
                </>
              ) : (
                <>
                  <Field label="Wallet address" placeholder="0x71C7...8f3A" mono />
                  <div className="rounded-xl border border-base-border bg-base-surface2 p-4 text-sm text-ink-secondary">
                    We'll settle in USDC at the current treasury rate. No network fee for
                    Treasury Card holders.
                  </div>
                </>
              )}

              <Field label="Billing email" placeholder="you@company.com" />

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-violet-gradient text-white text-sm font-medium py-3.5 shadow-glow hover:brightness-110 active:scale-[0.99] transition"
              >
                Pay ${total.toFixed(2)}
              </button>

              <p className="text-xs text-ink-muted text-center pt-1">
                Secured with 256-bit encryption. Refundable within 30 days.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  placeholder,
  mono = false,
}: {
  label: string;
  placeholder: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-secondary mb-1.5">
        {label}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        className={`w-full rounded-xl border border-base-border bg-base-surface2 px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-violet-500 transition ${
          mono ? "font-mono tabular" : ""
        }`}
      />
    </label>
  );
}
