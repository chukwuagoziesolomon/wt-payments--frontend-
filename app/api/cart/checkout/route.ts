import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const body = await request.text();
    const headers = new Headers();
    headers.set("content-type", "application/json");
    const res = await fetch(`${apiBase}/api/cart/checkout`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });
    const contentType = res.headers.get("content-type") || "application/json";
    const responseBody = await res.text();
    return new NextResponse(responseBody, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch {
    return NextResponse.json(
      { error: true, data: "Failed to create guest checkout" },
      { status: 502 }
    );
  }
}
