"use client";

import { ccc } from "@ckb-ccc/connector-react";

export default function CccProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ccc.Provider
      name="WT Payments"
      preferredNetworks={[
        {
          addressPrefix: "ckb",
          signerType: ccc.SignerType.CKB,
          network: "mainnet",
        },
        {
          addressPrefix: "ckt",
          signerType: ccc.SignerType.CKB,
          network: "testnet",
        },
      ]}
    >
      {children}
    </ccc.Provider>
  );
}
