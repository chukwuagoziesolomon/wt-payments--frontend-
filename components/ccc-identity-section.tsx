"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getCccIdentity,
  linkCccIdentity,
  requestCccChallenge,
  unlinkCccIdentity,
} from "@/lib/ccc-auth";
import { cccNetwork } from "@/lib/ccc-config";

export function CccIdentitySection() {
  const { open, disconnect, signerInfo } = ccc.useCcc();
  const signer = ccc.useSigner();
  const [status, setStatus] = useState("Disconnected");
  const [address, setAddress] = useState<string | null>(null);
    const [identity, setIdentity] = useState<{ subject: string; network: string; address?: string } | null>(null);
  const [activeNetwork, setActiveNetwork] = useState<string>(cccNetwork);
  const [switching, setSwitching] = useState(false);
  const token =
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        "";

  useEffect(() => {
    fetch("/api/ckb/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => {
        const config = json.result || json.data || json;
        if (config.ccc_network) setActiveNetwork(config.ccc_network);
        setSwitching(Boolean(config.switching));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!token) return;
    getCccIdentity(token)
      .then((loaded) => {
        setIdentity(loaded);
        setAddress(loaded?.address || null);
        if (loaded) setStatus("Connected");
      })
      .catch(() => undefined);
  }, [token]);

  async function linkWallet() {
    try {
      if (!(signerInfo && signer)) {
        await open();
        return;
      }
      const subject = await signer.getIdentity();
      const nextAddress = await signer.getRecommendedAddress();
      const expectedPrefix = cccNetwork === "mainnet" ? "ckb" : "ckt";
      if (!nextAddress.startsWith(expectedPrefix)) {
        setStatus("Wrong network");
        return;
      }
      const identity = {
        provider: "ccc" as const,
        network: cccNetwork,
        subject,
        address: nextAddress,
      };
      setStatus("Awaiting signature");
      const challenge = await requestCccChallenge(identity, token);
      const signed = await signer.signMessage(challenge.message);
      if (signed.identity !== subject) {
        throw new Error("CCC identity does not match the challenge subject.");
      }
      await linkCccIdentity(identity, challenge.challengeId, signed, token);
      setIdentity(identity);
      setAddress(nextAddress);
      setStatus("Connected");
    } catch {
      setStatus("Connection failed");
    }
  }

  async function disconnectWallet() {
    try {
      const subject = await signer?.getIdentity();
      if (!subject) {
        throw new Error("No connected CKB identity.");
      }
      await unlinkCccIdentity(token, subject);
      disconnect();
      setAddress(null);
        setIdentity(null);
      setStatus("Disconnected");
    } catch {
      setStatus("Unable to disconnect");
    }
  }

  let actionLabel = status;
  if (address) {
    actionLabel = "Disconnect";
  } else if (status === "Disconnected") {
    actionLabel = "Link CKB wallet";
  }

  return (
    <section className="mx-auto mb-6 w-full max-w-5xl rounded-2xl border border-[#23242A] bg-[#19191d] p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-lg text-white">CKB identity</h2>
          <p className="text-muted-foreground text-sm">
            {address ||
              "Connect a wallet to link your verifiable CKB identity."}
            {identity && (
              <span className="mt-2 block text-xs text-emerald-300">
                {activeNetwork === "testnet" ? "CKB Testnet" : "CKB Mainnet"} · {identity.subject.slice(0, 12)}...
              </span>
            )}
            {!identity && <span className="mt-2 block text-xs text-emerald-300">Active network: {activeNetwork === "testnet" ? "CKB Testnet" : "CKB Mainnet"}{switching ? " · switching" : " · fixed by deployment"}</span>}
          </p>
        </div>
        <Button onClick={address ? disconnectWallet : linkWallet} type="button">
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}
