"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
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
  const token =
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        "";

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
          </p>
        </div>
        <Button onClick={address ? disconnectWallet : linkWallet} type="button">
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}
