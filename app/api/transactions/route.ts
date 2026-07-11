import { NextResponse } from "next/server";

// Proxy GET /api/transactions -> ${NEXT_PUBLIC_API_BASE_URL}/transactions
export async function GET(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const url = new URL(req.url);
    const query = url.search;
    const backendUrl = `${apiBase}/api/transactions${query}`;

    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const res = await fetch(backendUrl, { method: "GET", headers, cache: "no-store" });
    const contentType = res.headers.get("content-type") || "application/json";
    const body = await res.text();
    return new NextResponse(body, { status: res.status, headers: { "content-type": contentType } });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch transaction history" }, { status: 502 });
  }
}
