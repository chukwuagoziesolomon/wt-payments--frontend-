import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const auth = request.headers.get("authorization");
    const response = await fetch(`${apiBase}/api/user/shop/ckb-metrics`, {
      headers: auth ? { Authorization: auth } : undefined,
      cache: "no-store",
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ error: true, data: "Failed to load CKB metrics" }, { status: 502 });
  }
}
