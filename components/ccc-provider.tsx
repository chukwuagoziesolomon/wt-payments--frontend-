"use client";

import { ccc } from "@ckb-ccc/connector-react";

export default function CccProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ccc.Provider name="WT Payments" preferredNetworks={["ckb", "ckt"]}>
      {children}
    </ccc.Provider>
  );
}
