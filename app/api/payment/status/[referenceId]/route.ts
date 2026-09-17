import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ referenceId: string }> }
) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
  try {
    const { referenceId } = await params;
    const url = new URL(request.url);
    const response = await fetch(
      `${apiBase}/api/payment/status/${encodeURIComponent(referenceId)}${url.search}`,
      { cache: "no-store" }
    );
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ error: true, data: "Failed to load payment status" }, { status: 502 });
  }
}