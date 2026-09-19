import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const configuredApiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://127.0.0.1:3335";
  try {
    const url = new URL(request.url);
    const apiBase = new URL(configuredApiBase.replace(/^['"]|['"]$/g, ""));
    apiBase.pathname = apiBase.pathname.replace(/\/+$/, "").replace(/\/api$/, "");
    const body = await request.text();
    const headers = new Headers();
    const requestContentType = request.headers.get("content-type");
    if (requestContentType) headers.set("content-type", requestContentType);
    const auth = request.headers.get("authorization");
    if (auth) headers.set("authorization", auth);
    const res = await fetch(new URL(`/api/cart/wallet${url.search}`, apiBase), {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });
    const responseContentType = res.headers.get("content-type") || "application/json";
    const responseBody = await res.text();
    return new NextResponse(responseBody, {
      status: res.status,
      headers: { "content-type": responseContentType },
    });
  } catch {
    return NextResponse.json(
      { error: true, data: "Failed to get guest wallet address" },
      { status: 502 }
    );
  }
}
