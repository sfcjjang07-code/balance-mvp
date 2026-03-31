import { supabaseRpc } from "@/lib/db/supabaseAdmin";
import type { VisitorStats } from "@/lib/db/types";
import { getVisitorStats as getFileVisitorStats, registerVisitor as registerFileVisitor } from "@/lib/visitorStore";

function normalizeVisitorStats(value: Partial<VisitorStats> | null | undefined): VisitorStats {
  return {
    today: typeof value?.today === "number" && Number.isFinite(value.today) ? value.today : Number(value?.today ?? 0) || 0,
    total: typeof value?.total === "number" && Number.isFinite(value.total) ? value.total : Number(value?.total ?? 0) || 0,
    date: value?.date ?? "",
    mode: value?.mode === "runtime" || value?.mode === "file" || value?.mode === "supabase" ? value.mode : "file",
  };
}

type VisitorRow = {
  today: number;
  total: number;
  date: string;
};

export async function getVisitorStats(): Promise<VisitorStats> {
  const { data, error } = await supabaseRpc<VisitorRow[]>("get_site_visit_stats");
  const row = Array.isArray(data) ? data[0] : null;

  if (error || !row) {
    return getFileVisitorStats();
  }

  return normalizeVisitorStats({ ...row, mode: "supabase" });
}

export async function registerVisitor(): Promise<VisitorStats> {
  const { data, error } = await supabaseRpc<VisitorRow[]>("register_site_visit");
  const row = Array.isArray(data) ? data[0] : null;

  if (error || !row) {
    return registerFileVisitor();
  }

  return normalizeVisitorStats({ ...row, mode: "supabase" });
}
