import { NextResponse } from "next/server";

async function proxy(request: Request, context: { params: Promise<{ itemId: string }> }, method: "PUT" | "DELETE") {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const { itemId } = await context.params;
    const url = new URL(request.url);
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    const body = method === "PUT" ? await request.text() : undefined;
    const response = await fetch(`${apiBase}/api/cart/items/${encodeURIComponent(itemId)}${url.search}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });
    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ error: true, data: "Failed to update guest cart" }, { status: 502 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ itemId: string }> }) {
  return proxy(request, context, "PUT");
}

export async function DELETE(request: Request, context: { params: Promise<{ itemId: string }> }) {
  return proxy(request, context, "DELETE");
}
