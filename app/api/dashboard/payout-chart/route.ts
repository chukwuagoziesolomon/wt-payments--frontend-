import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";

  try {
    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const res = await fetch(`${apiBase}/dashboard/payout-chart`, {
      method: "GET",
      headers,
      cache: "no-store",
      credentials: "include",
    });

    const contentType = res.headers.get("content-type") || "application/json";
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch {
    return NextResponse.json(
      { error: true, data: "Failed to fetch payout chart data" },
      { status: 502 }
    );
  }
}
