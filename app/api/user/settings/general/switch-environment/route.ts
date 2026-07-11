import { NextResponse } from "next/server";

// Proxy POST /api/user/settings/general/switch-environment -> backend
export async function POST(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const body = await req.text();

    const headers = new Headers();
    headers.set("content-type", "application/json");
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const backendUrl = `${apiBase}/user/settings/general/switch-environment`;
    const res = await fetch(backendUrl, {
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
      { error: true, data: "Failed to switch environment" },
      { status: 502 }
    );
  }
}
