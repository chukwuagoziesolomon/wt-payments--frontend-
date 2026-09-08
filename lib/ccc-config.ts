export type CkbNetwork = "mainnet" | "testnet";

function readNetwork(
  value: string | undefined,
  fallback: CkbNetwork
): CkbNetwork {
  return value === "mainnet" || value === "testnet" ? value : fallback;
}

export const cccNetwork = readNetwork(
  process.env.NEXT_PUBLIC_CCC_NETWORK || process.env.VITE_CCC_NETWORK,
  readNetwork(
    process.env.NEXT_PUBLIC_CKB_NETWORK || process.env.VITE_CKB_NETWORK,
    "mainnet"
  )
);

export function storeAuthToken(token: string) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("token", token);
}
