# CCC Frontend Integration Report

**Project:** WT Payments Dashboard  
**Date:** September 8, 2026  
**Area:** CKB/CCC wallet authentication

## Executive Summary

Implemented the frontend foundation for CCC wallet authentication and aligned it with the backend authentication contract. Users can connect a supported CKB wallet, authenticate by signing a backend-generated challenge, receive a normal WT bearer token, and continue into the dashboard.

The integration keeps CCC wallet connection separate from the WT authenticated session and does not request, generate, or store private keys or seed phrases.

## Implemented Features

### 1. CCC Challenge Authentication

**Files:**

- `lib/ccc-auth.ts`
- `components/ccc-auth-button.tsx`

Authentication now follows this flow:

1. Open the CCC wallet connection flow.
2. Read the canonical CCC identity with `signer.getIdentity()`.
3. Read the recommended wallet address as optional display metadata.
4. Validate that the wallet address matches the configured CKB network.
5. Request a challenge from `POST /api/user/auth/ccc/challenge`.
6. Sign the exact backend-provided challenge message with CCC.
7. Confirm that the returned CCC identity matches the challenge subject.
8. Send `challengeId`, `provider`, `network`, `subject`, `identity`, `signType`, and `signature` to the verify endpoint.
9. Extract the bearer token from `result.token.token`.
10. Store the token using the existing WT token mechanism.

The frontend does not create or alter the challenge message.

### 2. Canonical Identity Handling

The canonical identity is now taken from:

```ts
const subject = await signer.getIdentity();
```

The wallet address is not used as the identity subject. It is retained only as optional metadata and for the configured-network check.

CCC signature fields are forwarded without modification:

- `signature`
- `identity`
- `signType`

This supports CCC signature types such as `CkbSecp256k1`, `JoyId`, and `EvmPersonal`.

### 3. Network Protection

The frontend uses the configured application network rather than hardcoding a network in the authentication flow.

- Mainnet wallets must provide a `ckb` address.
- Testnet wallets must provide a `ckt` address.
- A mismatched wallet is blocked with a user-readable error.
- The wallet network is never silently switched.

### 4. Successful Connection Experience

After backend verification succeeds:

- The WT bearer token is stored.
- The wallet button changes to `Connected`.
- A compact animated success modal appears.
- The modal displays `Connected successfully`.
- The user sees a short dashboard navigation message.
- Navigation to the dashboard occurs after a 1.4-second confirmation period.
- Duplicate actions are disabled during authentication and the redirect transition.

### 5. Existing Account Linking

**File:** `components/ccc-identity-section.tsx`

Authenticated email users can link a CCC wallet by:

1. Connecting through CCC.
2. Reading the canonical CCC identity.
3. Requesting a fresh challenge.
4. Signing the challenge.
5. Sending the full signature payload to `POST /api/user/auth/ccc/link` with the existing bearer token.

The frontend does not merge accounts automatically. Backend duplicate-identity errors are surfaced as authentication failures.

### 6. Unlinking

CCC unlinking now calls:

```http
DELETE /api/user/auth/ccc/link
Authorization: Bearer <WT_ACCESS_TOKEN>
Content-Type: application/json
```

The canonical identity subject is included in the request body. The backend remains responsible for preventing unlinking when the CCC identity is the user's only recovery method.

### 7. Error and State Handling

The CCC button supports visible states including:

- Disconnected
- Connecting
- Awaiting signature
- Authenticating
- Connected
- Wrong network
- Connection failed

It also provides user-readable handling for rejected wallet requests, rejected signatures, network errors, identity mismatches, and missing access tokens.

## Files Changed

| File | Purpose |
| --- | --- |
| `lib/ccc-auth.ts` | Shared CCC API requests, payload types, response parsing, linking, and unlinking |
| `components/ccc-auth-button.tsx` | CCC login flow, token storage, success modal, and dashboard navigation |
| `components/ccc-identity-section.tsx` | Linking and unlinking CCC identities from account settings |

## Security Notes

The implementation does not:

- Generate private keys
- Store private keys
- Request seed phrases
- Authenticate using only a display address
- Create authentication challenges in the frontend
- Reuse signatures after verification
- Automatically merge WT accounts

## Validation Performed

Focused Biome validation passes for all modified CCC files:

```text
pnpm exec biome check lib/ccc-auth.ts components/ccc-auth-button.tsx components/ccc-identity-section.tsx
Checked 3 files in 19s. No fixes applied.
```

The full TypeScript check was attempted but is currently blocked by an existing malformed generated file:

```text
.next/dev/types/validator.ts
```

The reported errors are generated-file parse errors and are separate from the CCC source files.

## Backend Dependency

End-to-end authentication requires these backend endpoints to be available:

- `POST /api/user/auth/ccc/challenge`
- `POST /api/user/auth/ccc/verify`
- `POST /api/user/auth/ccc/link`
- `DELETE /api/user/auth/ccc/link`

Once the backend endpoints are deployed and the frontend API base URL and CCC network variables are configured, the complete wallet sign-in and linking flow can be tested against the target environment.

## Recommended QA Checks

1. Connect a mainnet wallet against a mainnet configuration.
2. Connect a testnet wallet against a testnet configuration.
3. Confirm wrong-network wallets are blocked.
4. Reject the wallet connection and signature requests.
5. Confirm the exact challenge message is signed.
6. Confirm the success modal appears before dashboard navigation.
7. Confirm the button displays `Connected` after successful authentication.
8. Confirm an authenticated email user can link a CCC identity.
9. Confirm duplicate identity linking returns a safe error without merging accounts.
10. Confirm unlinking sends the canonical subject and respects backend recovery rules.
