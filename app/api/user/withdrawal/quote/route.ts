import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const url = new URL(req.url);
    const backendUrl = `${apiBase}/api/user/withdrawal/quote${url.search}`;
    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);
    const res = await fetch(backendUrl, { method: "GET", headers, cache: "no-store" });
    const body = await res.text();
    return new NextResponse(body, { status: res.status, headers: { "content-type": "application/json" } });
  } catch {
    return NextResponse.json({ status: false, message: "Failed to fetch quote" }, { status: 502 });
  }
}
