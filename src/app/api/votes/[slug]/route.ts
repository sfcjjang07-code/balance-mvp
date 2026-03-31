import { NextRequest, NextResponse } from "next/server";

import type { ChoiceId } from "@/data/games/types";
import { getVoteResponse, recordTopicVote } from "@/lib/server/topicMetricsStore";

async function buildResponse(slug: string) {
  const data = await getVoteResponse(slug);
  return NextResponse.json(
    { slug, ...data },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return buildResponse(slug);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = (await request.json()) as { choiceId?: ChoiceId };

  if (body.choiceId !== "a" && body.choiceId !== "b") {
    return NextResponse.json({ message: "choiceId must be 'a' or 'b'." }, { status: 400 });
  }

  const data = await recordTopicVote(slug, body.choiceId);
  return NextResponse.json(
    { slug, ...data },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
