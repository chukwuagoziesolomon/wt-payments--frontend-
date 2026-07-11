import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const body = await req.text();
    const headers = new Headers();
    headers.set("content-type", "application/json");
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);
    const res = await fetch(`${apiBase}/api/user/withdrawal/initiate`, { method: "POST", headers, body, cache: "no-store" });
    const responseBody = await res.text();
    return new NextResponse(responseBody, { status: res.status, headers: { "content-type": "application/json" } });
  } catch {
    return NextResponse.json({ status: false, message: "Failed to initiate withdrawal" }, { status: 502 });
  }
}
