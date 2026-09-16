import { NextResponse } from "next/server";

async function proxy(request: Request, method: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const url = new URL(request.url);
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    const body = method === "DELETE" ? undefined : await request.text();
    const response = await fetch(`${apiBase}/api/cart${url.search}`, {
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
    return NextResponse.json({ error: true, data: "Failed to access guest cart" }, { status: 502 });
  }
}

export async function GET(request: Request) {
  return proxy(request, "GET");
}

export async function DELETE(request: Request) {
  return proxy(request, "DELETE");
}
