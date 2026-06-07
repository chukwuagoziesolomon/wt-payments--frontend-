import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Proxy SSE GET /api/user/stream -> backend
// Native EventSource doesn't support headers, so the token is passed as ?token=
export async function GET(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";

  const url = new URL(req.url);
  // Accept token from query param (EventSource-friendly) or Authorization header
  const token =
    url.searchParams.get("token") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    null;

  if (!token) {
    return NextResponse.json({ error: true, data: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendUrl = `${apiBase}/user/stream`;
    const backendRes = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
      // @ts-expect-error -- Node fetch supports duplex
      duplex: "half",
    });

    if (!backendRes.ok || !backendRes.body) {
      return NextResponse.json(
        { error: true, data: "Stream unavailable" },
        { status: backendRes.status }
      );
    }

    return new Response(backendRes.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return NextResponse.json(
      { error: true, data: "Failed to connect to stream" },
      { status: 502 }
    );
  }
}
