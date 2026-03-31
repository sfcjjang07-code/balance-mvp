export type VisitorStats = {
  today: number;
  total: number;
  date: string;
  mode: "runtime" | "file" | "supabase";
};

export type TopicStatBucket = {
  views: number;
  votes: number;
  updatedAt: number;
};

export type TopicStatsMap = Record<string, TopicStatBucket>;

export type VoteResponse = {
  counts: Record<string, number>;
  percentages: Record<string, number>;
  total: number;
};

export type MetricsRow = {
  slug: string;
  view_count: number;
  vote_count: number;
  choice_a_count: number;
  choice_b_count: number;
  updated_at: string | null;
};
