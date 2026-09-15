import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";

  try {
    const body = await req.text();
    const headers = new Headers({
      "content-type": "application/json",
      "cache-control": "no-cache",
    });
    const auth = req.headers.get("authorization");
    if (auth) {
      headers.set("authorization", auth);
    }

    const response = await fetch(`${apiBase}/api/user/wallet/provision`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });
    const responseBody = await response.text();
    const contentType =
      response.headers.get("content-type") || "application/json";

    return new NextResponse(responseBody, {
      status: response.status,
      headers: { "content-type": contentType },
    });
  } catch {
    return NextResponse.json(
      { error: true, data: "Unable to provision the CKB wallet right now." },
      { status: 502 }
    );
  }
}
