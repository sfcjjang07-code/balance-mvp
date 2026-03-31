import type { ChoiceId } from "@/data/games/types";
import { supabaseRpc, supabaseSelect } from "@/lib/db/supabaseAdmin";
import type { MetricsRow, TopicStatsMap, VoteResponse } from "@/lib/db/types";
import {
  getFileTopicStatsMap,
  getFileVoteResponse,
  recordFileTopicView,
  recordFileTopicVote,
} from "@/lib/server/topicStatsFileStore";

function toSafeNumber(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function rowToMapEntry(row: MetricsRow) {
  return {
    views: toSafeNumber(row.view_count),
    votes: toSafeNumber(row.vote_count),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : 0,
  };
}

function rowToVoteResponse(row: MetricsRow): VoteResponse {
  const countA = toSafeNumber(row.choice_a_count);
  const countB = toSafeNumber(row.choice_b_count);
  const total = countA + countB;

  return {
    counts: { a: countA, b: countB },
    total,
    percentages: {
      a: total === 0 ? 0 : Math.round((countA / total) * 100),
      b: total === 0 ? 0 : Math.round((countB / total) * 100),
    },
  };
}

export async function getTopicStatsMap(): Promise<TopicStatsMap> {
  const { data, error } = await supabaseSelect<MetricsRow[]>("game_metrics", {
    select: "slug,view_count,vote_count,choice_a_count,choice_b_count,updated_at",
    limit: 5000,
  });

  if (error || !data) {
    return getFileTopicStatsMap();
  }

  return Object.fromEntries(data.map((row) => [normalizeSlug(row.slug), rowToMapEntry(row)]));
}

export async function recordTopicView(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const { data, error } = await supabaseRpc<MetricsRow[]>("record_game_view", { p_slug: normalizedSlug });
  const row = Array.isArray(data) ? data[0] : undefined;

  if (error || !row) {
    return recordFileTopicView(normalizedSlug);
  }

  return rowToMapEntry(row);
}

export async function getVoteResponse(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const { data, error } = await supabaseSelect<MetricsRow[]>("game_metrics", {
    select: "slug,view_count,vote_count,choice_a_count,choice_b_count,updated_at",
    filters: { slug: normalizedSlug },
    limit: 1,
  });

  const row = Array.isArray(data) ? data[0] : undefined;
  if (error || !row) {
    return getFileVoteResponse(normalizedSlug);
  }

  return rowToVoteResponse(row);
}

export async function recordTopicVote(slug: string, choiceId: ChoiceId) {
  const normalizedSlug = normalizeSlug(slug);
  const { data, error } = await supabaseRpc<MetricsRow[]>("record_game_vote", {
    p_slug: normalizedSlug,
    p_choice: choiceId,
  });
  const row = Array.isArray(data) ? data[0] : undefined;

  if (error || !row) {
    return recordFileTopicVote(normalizedSlug, choiceId);
  }

  return rowToVoteResponse(row);
}
