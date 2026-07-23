import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { subdomain: string } }
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const res = await fetch(
      `${apiBase}/api/shop/${params.subdomain}/delivery-settings`,
      {
        headers: { "content-type": "application/json" },
        cache: "no-store",
      }
    );
    const contentType = res.headers.get("content-type") || "application/json";
    const responseBody = await res.text();
    return new NextResponse(responseBody, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch {
    return NextResponse.json(
      { error: true, data: "Failed to load delivery settings" },
      { status: 502 }
    );
  }
}
