"use client";

import { useEffect } from "react";

export const VISITOR_STATS_EVENT = "balance-lab-visitor-stats-updated";
const VISITOR_SESSION_KEY = "balance-lab-site-entry-session-v1";

type VisitorStats = {
  today: number;
  total: number;
  date: string;
  mode: "runtime" | "file" | "supabase";
};

function dispatchVisitorStatsUpdated(detail: VisitorStats) {
  window.dispatchEvent(new CustomEvent(VISITOR_STATS_EVENT, { detail }));
}

function shouldRegisterSiteEntry() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const hasSessionMarker = window.sessionStorage.getItem(VISITOR_SESSION_KEY) === "1";
    const navigationEntry = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const navigationType = navigationEntry?.type ?? "navigate";

    if (hasSessionMarker || navigationType === "reload" || navigationType === "back_forward") {
      return false;
    }

    window.sessionStorage.setItem(VISITOR_SESSION_KEY, "1");
    return true;
  } catch {
    return true;
  }
}

export default function SiteEntryTracker() {
  useEffect(() => {
    let isMounted = true;

    const syncEntry = async () => {
      try {
        const response = await fetch("/api/visitors", {
          method: shouldRegisterSiteEntry() ? "POST" : "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("visitor-tracker-request-failed");
        }

        const payload = (await response.json()) as VisitorStats;

        if (isMounted) {
          dispatchVisitorStatsUpdated(payload);
        }
      } catch {
        // Silent fallback: homepage fetch will still try to read stats directly.
      }
    };

    void syncEntry();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
