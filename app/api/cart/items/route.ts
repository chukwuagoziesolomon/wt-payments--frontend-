import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://127.0.0.1:3335";
  try {
    const url = new URL(request.url);
    const body = await request.text();
    const apiBase = new URL(configuredApiBase);
    apiBase.pathname = apiBase.pathname.replace(/\/+$/, "").replace(/\/api$/, "");
    const backendUrl = new URL(`/api/cart/items${url.search}`, apiBase);

    const response = await fetch(backendUrl.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      cache: "no-store",
    });
    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    console.error("Guest cart item proxy failed", error);
    return NextResponse.json(
      { error: true, data: "Failed to add guest cart item" },
      { status: 502 }
    );
  }
}
