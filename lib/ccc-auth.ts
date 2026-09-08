import type { CkbNetwork } from "@/lib/ccc-config";

export type CccIdentity = {
  provider: "ccc";
  network: CkbNetwork;
  subject: string;
  address?: string;
  lockScript?: string;
  publicKey?: string;
};

export type CccSignature = {
  signature: string;
  identity: string;
  signType: string;
};

type ApiResponse<T> = {
  message?: string;
  data?: T | string;
  result?: T;
  error?: boolean;
};

async function post<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  const response = await fetch(`/backend/user/auth/ccc/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok || json.error || json.result === undefined) {
    throw new Error(
      json.message ||
        (typeof json.data === "string" ? json.data : undefined) ||
        "Unable to authenticate with CKB wallet."
    );
  }
  return json.result as T;
}

export function requestCccChallenge(
  identity: Pick<CccIdentity, "provider" | "network" | "subject">,
  token?: string
) {
  return post<{ challengeId: string; message: string; expiresAt: string }>(
    "challenge",
    {
      provider: identity.provider,
      network: identity.network,
      subject: identity.subject,
    },
    token
  );
}

export function verifyCccIdentity(
  identity: CccIdentity,
  challengeId: string,
  signed: CccSignature
) {
  return post<{
    token?: { token: string; type: string };
    accessToken?: string;
  }>("verify", {
    challengeId,
    ...identity,
    identity: signed.identity,
    signType: signed.signType,
    signature: signed.signature,
  });
}

export function linkCccIdentity(
  identity: CccIdentity,
  challengeId: string,
  signed: CccSignature,
  token: string
) {
  return post<{ identity: CccIdentity }>(
    "link",
    {
      challengeId,
      ...identity,
      identity: signed.identity,
      signType: signed.signType,
      signature: signed.signature,
    },
    token
  );
}

export async function unlinkCccIdentity(token: string, subject: string) {
  const response = await fetch("/backend/user/auth/ccc/link", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subject }),
  });
  if (!response.ok) {
    throw new Error("Unable to disconnect your CKB identity.");
  }
}
