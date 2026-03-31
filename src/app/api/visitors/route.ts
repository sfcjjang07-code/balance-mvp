export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { getVisitorStats, registerVisitor } from "@/lib/server/visitorsStore";

export async function GET() {
  return NextResponse.json(await getVisitorStats(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST() {
  return NextResponse.json(await registerVisitor(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
