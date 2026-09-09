"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestCccChallenge, verifyCccIdentity } from "@/lib/ccc-auth";
import { cccNetwork, storeAuthToken } from "@/lib/ccc-config";

const SUCCESS_REDIRECT_DELAY_MS = 1400;

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("reject") || message.includes("cancel")) {
    return "Wallet request was rejected.";
  }
  if (message.includes("network") || message.includes("chain")) {
    return "Your wallet is connected to the wrong CKB network.";
  }
  return "Unable to connect your CKB wallet. Please try again.";
}

export function CccAuthButton({
  destination = "/dashboard",
}: {
  destination?: string;
}) {
  const { open, disconnect, signerInfo } = ccc.useCcc();
  const signer = ccc.useSigner();
  const router = useRouter();
  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  async function authenticate() {
    setError(null);
    try {
      if (!(signerInfo && signer)) {
        setStatus("Connecting");
        await open();
        return;
      }
      const subject = await signer.getIdentity();
      const address = await signer.getRecommendedAddress();
      const expectedPrefix = cccNetwork === "mainnet" ? "ckb" : "ckt";
      if (!address.startsWith(expectedPrefix)) {
        console.warn("[CCC] Wallet network mismatch", {
          configuredNetwork: cccNetwork,
          expectedAddressPrefix: expectedPrefix,
          receivedAddressPrefix: address.slice(0, 3),
        });
        setStatus("Wrong network");
        setError(
          `Your wallet is connected to the wrong CKB network. Please switch to CKB ${cccNetwork}.`
        );
        return;
      }
      setStatus("Awaiting signature");
      const identity = {
        provider: "ccc" as const,
        network: cccNetwork,
        subject,
        address,
      };
      const challenge = await requestCccChallenge(identity);
      const signed = await signer.signMessage(challenge.message);
      if (signed.identity !== subject) {
        throw new Error("CCC identity does not match the challenge subject.");
      }
      setStatus("Authenticating");
      const result = await verifyCccIdentity(
        identity,
        challenge.challengeId,
        signed
      );
      const token = result.token?.token;
      if (!token) {
        throw new Error(
          "Authentication response did not include an access token."
        );
      }
      storeAuthToken(token);
      setStatus("Connected");
      setShowSuccess(true);
      if (destination === "/signup/step2") {
        localStorage.setItem("cccIdentity", JSON.stringify(identity));
      }
      window.setTimeout(
        () => router.push(destination),
        SUCCESS_REDIRECT_DELAY_MS
      );
    } catch (caught) {
      setStatus("Connection failed");
      setError(errorMessage(caught));
    }
  }

  let buttonLabel = "Continue with CKB wallet";
  if (signerInfo) {
    buttonLabel = status === "Connected" ? "Connected" : status;
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        disabled={[
          "Connecting",
          "Awaiting signature",
          "Authenticating",
          "Connected",
        ].includes(status)}
        onClick={signerInfo ? authenticate : open}
        type="button"
      >
        {buttonLabel}
      </Button>
      {signerInfo && status !== "Connected" && (
        <button
          className="w-full text-muted-foreground text-xs"
          onClick={() => {
            disconnect();
            setStatus("Disconnected");
          }}
          type="button"
        >
          Disconnect wallet
        </button>
      )}
      {error && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}
      {showSuccess && (
        <div
          aria-live="polite"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
        >
          <div className="fade-in zoom-in-95 w-full max-w-xs animate-in rounded-2xl border border-emerald-400/30 bg-[#17191d] px-7 py-6 text-center shadow-2xl shadow-emerald-950/40 duration-300">
            <div className="zoom-in-50 mx-auto mb-4 flex h-14 w-14 animate-in items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400 duration-500">
              <CheckCircle2 className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <p className="font-bold text-lg text-white">
              Connected successfully
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Taking you to your dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
