import { NextResponse } from "next/server";

function normalizeHistoryResponse(body: string, contentType: string) {
  if (!(body && contentType.includes("application/json"))) {
    return body;
  }

  try {
    const json = JSON.parse(body) as Record<string, unknown>;
    if (
      json &&
      typeof json === "object" &&
      !("success" in json) &&
      ("result" in json || "data" in json)
    ) {
      return JSON.stringify({
        success: true,
        data: (json.result ?? json.data ?? json) as unknown,
        message: json.message ?? "OK",
      });
    }

    return body;
  } catch {
    return body;
  }
}

export async function GET(req: Request) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";

  try {
    const url = new URL(req.url);
    const backendUrl = `${apiBase}/api/user/payment-intent/history${url.search}`;

    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) {
      headers.set("authorization", auth);
    }

    const res = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      credentials: "include",
    });

    const contentType = res.headers.get("content-type") || "application/json";
    const body = await res.text();
    const normalizedBody = normalizeHistoryResponse(body, contentType);

    return new NextResponse(normalizedBody, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment intent history" },
      { status: 502 }
    );
  }
}
