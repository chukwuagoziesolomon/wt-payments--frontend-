import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ referenceId: string }> }) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const { referenceId } = await params;
    const url = new URL(req.url);
    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const res = await fetch(`${apiBase}/api/user/checkout/${encodeURIComponent(referenceId)}${url.search}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    const contentType = res.headers.get("content-type") || "application/json";
    const body = await res.text();
    return new NextResponse(body, { status: res.status, headers: { "content-type": contentType } });
  } catch {
    return NextResponse.json({ error: true, data: "Failed to load order details" }, { status: 502 });
  }
}
