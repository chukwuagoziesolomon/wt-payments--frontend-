import { NextResponse } from "next/server";

// API disabled. Countries are now provided locally in the signup page.
export async function GET() {
  return NextResponse.json({ error: "This API endpoint has been disabled. Use the local list in the signup page." }, { status: 410 });
}
