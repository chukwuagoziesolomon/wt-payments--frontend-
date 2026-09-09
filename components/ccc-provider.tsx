"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { cccNetwork } from "@/lib/ccc-config";

export default function CccProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const preferredNetwork =
    cccNetwork === "mainnet"
      ? {
          addressPrefix: "ckb",
          signerType: ccc.SignerType.CKB,
          network: "mainnet",
        }
      : {
          addressPrefix: "ckt",
          signerType: ccc.SignerType.CKB,
          network: "testnet",
        };
  const defaultClient =
    cccNetwork === "mainnet"
      ? new ccc.ClientPublicMainnet()
      : new ccc.ClientPublicTestnet();

  return (
    <ccc.Provider
      defaultClient={defaultClient}
      name="WT Payments"
      preferredNetworks={[preferredNetwork]}
    >
      {children}
    </ccc.Provider>
  );
}
