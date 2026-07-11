import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const url = new URL(req.url);
    const backendUrl = `${apiBase}/api/user/cart${url.search}`;

    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const res = await fetch(backendUrl, { method: "GET", headers, cache: "no-store" });
    const contentType = res.headers.get("content-type") || "application/json";
    const body = await res.text();
    return new NextResponse(body, { status: res.status, headers: { "content-type": contentType } });
  } catch {
    return NextResponse.json({ error: true, data: "Failed to fetch cart" }, { status: 502 });
  }
}

export async function DELETE(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const res = await fetch(`${apiBase}/api/user/cart`, { method: "DELETE", headers, cache: "no-store" });
    const contentType = res.headers.get("content-type") || "application/json";
    const body = await res.text();
    return new NextResponse(body, { status: res.status, headers: { "content-type": contentType } });
  } catch {
    return NextResponse.json({ error: true, data: "Failed to clear cart" }, { status: 502 });
  }
}
