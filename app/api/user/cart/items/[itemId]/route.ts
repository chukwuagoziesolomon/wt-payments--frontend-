import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const { itemId } = await params;
    const body = await req.text();
    const headers = new Headers();
    headers.set("content-type", "application/json");
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const res = await fetch(`${apiBase}/api/user/cart/items/${encodeURIComponent(itemId)}`, { method: "PUT", headers, body, cache: "no-store" });
    const contentType = res.headers.get("content-type") || "application/json";
    const responseBody = await res.text();
    return new NextResponse(responseBody, { status: res.status, headers: { "content-type": contentType } });
  } catch {
    return NextResponse.json({ error: true, data: "Failed to update cart item" }, { status: 502 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const { itemId } = await params;
    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const res = await fetch(`${apiBase}/api/user/cart/items/${encodeURIComponent(itemId)}`, { method: "DELETE", headers, cache: "no-store" });
    const contentType = res.headers.get("content-type") || "application/json";
    const responseBody = await res.text();
    return new NextResponse(responseBody, { status: res.status, headers: { "content-type": contentType } });
  } catch {
    return NextResponse.json({ error: true, data: "Failed to remove cart item" }, { status: 502 });
  }
}
