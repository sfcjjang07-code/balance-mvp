export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getTopicStatsMap, recordTopicView } from "@/lib/server/topicMetricsStore";

export async function GET() {
  return NextResponse.json(await getTopicStatsMap(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { slug?: string; action?: "view" };
  const slug = body.slug?.trim();

  if (!slug) {
    return NextResponse.json({ message: "slug is required." }, { status: 400 });
  }

  const bucket = await recordTopicView(slug);
  return NextResponse.json(
    { slug, bucket },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
