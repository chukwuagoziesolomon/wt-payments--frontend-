import { NextResponse } from "next/server";

async function proxy(request: Request, method: string) {
  const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://127.0.0.1:3335";
  try {
    const url = new URL(request.url);
    const apiBase = new URL(configuredApiBase.replace(/^['"]|['"]$/g, ""));
    apiBase.pathname = apiBase.pathname.replace(/\/+$/, "").replace(/\/api$/, "");
    const backendUrl = new URL(`/api/cart${url.search}`, apiBase);
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    const body = ["POST", "PUT", "PATCH"].includes(method)
      ? await request.text()
      : undefined;
    let response: Response | undefined;
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await fetch(backendUrl, {
          method,
          headers,
          body,
          cache: "no-store",
        });
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!response) throw lastError;
    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    console.error("Guest cart proxy failed", error);
    return NextResponse.json(
      {
        error: true,
        data: "Failed to access guest cart",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}

export async function GET(request: Request) {
  return proxy(request, "GET");
}

export async function DELETE(request: Request) {
  return proxy(request, "DELETE");
}
