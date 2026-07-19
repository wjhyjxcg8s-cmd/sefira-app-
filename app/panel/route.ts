import { NextResponse } from "next/server";

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/admin-sefira-2026", request.url), 308);
}
