import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const url = new URL(req.url);
    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const res = await fetch(`${apiBase}/api/client/payment-links${url.search}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    const contentType = res.headers.get("content-type") || "application/json";
    const body = await res.text();
    return new NextResponse(body, { status: res.status, headers: { "content-type": contentType } });
  } catch {
    return NextResponse.json({ error: true, data: "Failed to load payment links" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const body = await req.text();
    const headers = new Headers();
    headers.set("content-type", "application/json");
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const res = await fetch(`${apiBase}/api/client/payment-links`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });
    const contentType = res.headers.get("content-type") || "application/json";
    const responseBody = await res.text();
    return new NextResponse(responseBody, { status: res.status, headers: { "content-type": contentType } });
  } catch {
    return NextResponse.json({ error: true, data: "Failed to create payment link" }, { status: 502 });
  }
}
