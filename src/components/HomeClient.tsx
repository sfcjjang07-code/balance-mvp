"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import AdBanner from "@/components/AdBanner";
import { VISITOR_STATS_EVENT } from "@/components/SiteEntryTracker";
import { games as baseGames } from "@/data/games/index";
import type { BalanceGame } from "@/data/games/types";
import { DAILY_VOTE_UPDATED_EVENT, getTodayVotedSlugs } from "@/lib/clientVoteSession";
import {
  getTopGameByMetric,
  getTopicStatsMap,
  refreshTopicStatsMap,
  subscribeTopicStats,
  type TopicStatsMap,
} from "@/lib/clientTopicStats";
import { mergeGamesBySlug } from "@/lib/gameCatalog";
import { filterVisibleGames, subscribeHiddenGames } from "@/lib/hiddenGames";
import { subscribePublishedGames, syncCustomGamesIntoPublished } from "@/lib/publishedGames";

type VisitorStats = {
  today: number;
  total: number;
  date: string;
  mode: "runtime" | "file" | "supabase";
};

type HomeClientProps = {
  initialVisitorStats: VisitorStats;
};

const COUNT_FORMATTER = new Intl.NumberFormat("ko-KR");

function toSafeNumber(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeVisitorStats(value: Partial<VisitorStats> | null | undefined): VisitorStats {
  return {
    today: toSafeNumber(value?.today),
    total: toSafeNumber(value?.total),
    date: value?.date ?? "",
    mode: value?.mode === "runtime" || value?.mode === "supabase" ? value.mode : "file",
  };
}

function formatCount(value: unknown) {
  return COUNT_FORMATTER.format(toSafeNumber(value));
}

function isZeroStats(stats: VisitorStats) {
  return stats.today === 0 && stats.total === 0;
}

export default function HomeClient({ initialVisitorStats }: HomeClientProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [publishedGames, setPublishedGames] = useState<BalanceGame[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>(
    normalizeVisitorStats(initialVisitorStats),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [votedTodaySlugs, setVotedTodaySlugs] = useState<Set<string>>(new Set());
  const [topicStats, setTopicStats] = useState<TopicStatsMap>({});
  const retryStartedRef = useRef(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const syncCatalogState = () => {
      const nextGames = syncCustomGamesIntoPublished();
      setPublishedGames(nextGames);
    };

    syncCatalogState();

    const unsubscribePublished = subscribePublishedGames(syncCatalogState);
    const unsubscribeHidden = subscribeHiddenGames(syncCatalogState);

    return () => {
      unsubscribePublished();
      unsubscribeHidden();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const syncVotedSlugs = () => {
      setVotedTodaySlugs(new Set(getTodayVotedSlugs()));
    };

    syncVotedSlugs();
    window.addEventListener(DAILY_VOTE_UPDATED_EVENT, syncVotedSlugs as EventListener);

    return () => {
      window.removeEventListener(DAILY_VOTE_UPDATED_EVENT, syncVotedSlugs as EventListener);
    };
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    setTopicStats(getTopicStatsMap());

    const syncStats = () => {
      setTopicStats(getTopicStatsMap());
      void refreshTopicStatsMap();
    };

    syncStats();
    window.addEventListener("focus", syncStats);

    const unsubscribe = subscribeTopicStats((nextMap) => setTopicStats(nextMap));

    return () => {
      window.removeEventListener("focus", syncStats);
      unsubscribe();
    };
  }, [isHydrated]);

  useEffect(() => {
    let isMounted = true;
    const retryTimers: number[] = [];

    const fetchVisitorStats = async () => {
      const response = await fetch("/api/visitors", {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("visitor-stats-request-failed");
      }

      const payload = (await response.json()) as Partial<VisitorStats>;
      return normalizeVisitorStats(payload);
    };

    const scheduleRetriesIfNeeded = (stats: VisitorStats) => {
      if (retryStartedRef.current || !isZeroStats(stats)) {
        return;
      }

      retryStartedRef.current = true;

      const delays = [300, 900, 1800, 3000];

      delays.forEach((delay) => {
        const timerId = window.setTimeout(async () => {
          try {
            const nextStats = await fetchVisitorStats();

            if (!isMounted) {
              return;
            }

            setVisitorStats(nextStats);
          } catch {
            // ignore retry errors
          }
        }, delay);

        retryTimers.push(timerId);
      });
    };

    const syncVisitorStats = async () => {
      try {
        const nextStats = await fetchVisitorStats();

        if (isMounted) {
          setVisitorStats(nextStats);
          scheduleRetriesIfNeeded(nextStats);
        }
      } catch {
        if (isMounted) {
          const fallback = normalizeVisitorStats(initialVisitorStats);
          setVisitorStats(fallback);
          scheduleRetriesIfNeeded(fallback);
        }
      }
    };

    const handleVisitorStatsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<VisitorStats>;
      const nextStats = normalizeVisitorStats(customEvent.detail);
      setVisitorStats(nextStats);
    };

    window.addEventListener(VISITOR_STATS_EVENT, handleVisitorStatsUpdated as EventListener);
    void syncVisitorStats();

    return () => {
      isMounted = false;
      window.removeEventListener(VISITOR_STATS_EVENT, handleVisitorStatsUpdated as EventListener);
      retryTimers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [initialVisitorStats]);

  const mergedGames = useMemo(
    () => mergeGamesBySlug(publishedGames, baseGames),
    [publishedGames],
  );

  const allGames = useMemo(() => {
    if (!isHydrated) {
      return mergedGames;
    }

    return filterVisibleGames(mergedGames);
  }, [isHydrated, mergedGames]);

  const categories = useMemo(
    () => Array.from(new Set(allGames.map((game) => game.category))).sort((a, b) => a.localeCompare(b, "ko")),
    [allGames],
  );

  const filteredGames = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();

    return allGames.filter((game) => {
      const categoryMatched = game.category === selectedCategory;
      const queryMatched =
        normalizedQuery.length === 0 || game.searchIndex.includes(normalizedQuery);

      return categoryMatched && queryMatched;
    });
  }, [allGames, query, selectedCategory]);

  const topViewed = useMemo(
    () => getTopGameByMetric(allGames, topicStats, "views"),
    [allGames, topicStats],
  );

  const topPicked = useMemo(
    () => getTopGameByMetric(allGames, topicStats, "votes"),
    [allGames, topicStats],
  );

  const categoryGames = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return allGames.filter((game) => game.category === selectedCategory);
  }, [allGames, selectedCategory]);

  const categoryTopViewed = useMemo(
    () => getTopGameByMetric(categoryGames, topicStats, "views"),
    [categoryGames, topicStats],
  );

  const categoryTopPicked = useMemo(
    () => getTopGameByMetric(categoryGames, topicStats, "votes"),
    [categoryGames, topicStats],
  );

  const handleCategoryClick = (category: string) => {
    setSelectedCategory((previous) => (previous === category ? null : category));
  };

  const isCategorySelected = selectedCategory !== null;

  return (
    <div className="shell">
      <section className="hero hero--compact">
        <div className="hero__panel hero__panel--compact">
          <span className="hero__eyebrow">BALANCE LAB</span>
          <h1 className="hero__title hero__title--compact">
            가볍게 고르고 바로 결과 보는 밸런스게임
          </h1>
          <p className="hero__desc hero__desc--compact">
            취향, 일상, 여행, 음식까지. 생각보다 오래 머무르게 되는 선택의 재미를 모았습니다.
          </p>
          <div className="hero__meta hero__meta--compact">
            <span className="meta-pill">빠른 선택</span>
            <span className="meta-pill">즉시 결과 확인</span>
            <span className="meta-pill">매일 다시 투표 가능</span>
            <Link href="/admin" className="meta-pill meta-pill--action">
              관리자 페이지 열기
            </Link>
          </div>

          <div className="visitor-strip" aria-label="방문자 통계">
            <article className="visitor-card">
              <span className="visitor-card__label">오늘 들어온 사람</span>
              <strong className="visitor-card__value">{formatCount(visitorStats.today)}</strong>
              <span className="visitor-card__hint">외부에서 다시 들어올 때마다 1회 집계</span>
            </article>
            <article className="visitor-card">
              <span className="visitor-card__label">전체 들어온 사람</span>
              <strong className="visitor-card__value">{formatCount(visitorStats.total)}</strong>
              <span className="visitor-card__hint">
                {visitorStats.mode === "supabase"
                  ? "Supabase 누적 기준"
                  : visitorStats.mode === "file"
                    ? "로컬 서버 파일 누적 기준"
                    : "현재 런타임 누적 기준"}
              </span>
            </article>
          </div>

          <div className="hero-insights-wrap" aria-label="인기 주제 요약">
            <div className="hero-insight-group">
              <div className="hero-insight-group__head">
                <span className="hero-insight-group__eyebrow">전체 기준</span>
                <strong className="hero-insight-group__title">지금 가장 반응이 쌓인 주제</strong>
              </div>
              <div className="hero-insights">
                <article className="hero-insight-card">
                  <span className="hero-insight-card__eyebrow">가장 많이 본 주제</span>
                  {topViewed ? (
                    <>
                      <strong className="hero-insight-card__title">{topViewed.game.title}</strong>
                      <span className="hero-insight-card__meta">
                        {topViewed.game.category} · 조회 {formatCount(topViewed.count)}
                      </span>
                    </>
                  ) : (
                    <>
                      <strong className="hero-insight-card__title">아직 집계가 없습니다</strong>
                      <span className="hero-insight-card__meta">
                        게임 상세 화면을 열면 조회수가 누적됩니다
                      </span>
                    </>
                  )}
                </article>

                <article className="hero-insight-card hero-insight-card--accent">
                  <span className="hero-insight-card__eyebrow">가장 많이 선택한 주제</span>
                  {topPicked ? (
                    <>
                      <strong className="hero-insight-card__title">{topPicked.game.title}</strong>
                      <span className="hero-insight-card__meta">
                        {topPicked.game.category} · 선택 {formatCount(topPicked.count)}
                      </span>
                    </>
                  ) : (
                    <>
                      <strong className="hero-insight-card__title">아직 집계가 없습니다</strong>
                      <span className="hero-insight-card__meta">
                        투표가 쌓이면 여기에서 가장 많이 선택된 주제를 보여줍니다
                      </span>
                    </>
                  )}
                </article>
              </div>
            </div>

            {selectedCategory ? (
              <div className="hero-insight-group hero-insight-group--category">
                <div className="hero-insight-group__head">
                  <span className="hero-insight-group__eyebrow">{selectedCategory} 기준</span>
                  <strong className="hero-insight-group__title">이 카테고리에서 가장 반응이 큰 주제</strong>
                </div>
                <div className="hero-insights">
                  <article className="hero-insight-card">
                    <span className="hero-insight-card__eyebrow">가장 많이 본 주제</span>
                    {categoryTopViewed ? (
                      <>
                        <strong className="hero-insight-card__title">{categoryTopViewed.game.title}</strong>
                        <span className="hero-insight-card__meta">
                          {selectedCategory} · 조회 {formatCount(categoryTopViewed.count)}
                        </span>
                      </>
                    ) : (
                      <>
                        <strong className="hero-insight-card__title">아직 집계가 없습니다</strong>
                        <span className="hero-insight-card__meta">
                          이 카테고리의 게임을 열면 조회수가 누적됩니다
                        </span>
                      </>
                    )}
                  </article>

                  <article className="hero-insight-card hero-insight-card--accent">
                    <span className="hero-insight-card__eyebrow">가장 많이 선택한 주제</span>
                    {categoryTopPicked ? (
                      <>
                        <strong className="hero-insight-card__title">{categoryTopPicked.game.title}</strong>
                        <span className="hero-insight-card__meta">
                          {selectedCategory} · 선택 {formatCount(categoryTopPicked.count)}
                        </span>
                      </>
                    ) : (
                      <>
                        <strong className="hero-insight-card__title">아직 집계가 없습니다</strong>
                        <span className="hero-insight-card__meta">
                          이 카테고리에서 투표가 쌓이면 가장 많이 선택된 주제가 여기에 표시됩니다
                        </span>
                      </>
                    )}
                  </article>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <AdBanner />

      <section className="panel panel--padded">
        <div className="filters filters--category-first">
          <div className="filters__top filters__top--compact filters__top--category-first">
            <input
              className="text-input"
              type="text"
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              placeholder={
                isCategorySelected
                  ? `${selectedCategory} 안에서 제목, 태그, 선택지로 검색`
                  : "카테고리를 먼저 선택하면 검색할 수 있어요"
              }
              aria-label="밸런스게임 검색"
              disabled={!isCategorySelected}
            />
            <div className="result-count" aria-live="polite">
              {isCategorySelected ? (
                <>
                  <strong>{filteredGames.length}</strong>
                  <span>개의 게임</span>
                </>
              ) : (
                <>
                  <strong>선택 전</strong>
                  <span>카테고리</span>
                </>
              )}
            </div>
          </div>

          <div className="chips" role="tablist" aria-label="카테고리 필터">
            {categories.map((category) => {
              const isActive = category === selectedCategory;

              return (
                <button
                  key={category}
                  type="button"
                  className={`chip ${isActive ? "chip--active" : ""}`}
                  onClick={() => handleCategoryClick(category)}
                  aria-pressed={isActive}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {!isCategorySelected ? (
          <div className="category-guide" role="status" aria-live="polite">
            <div className="category-guide__badge">카테고리부터 선택</div>
            <h2 className="category-guide__title">원하는 분야를 먼저 고르면 주제 목록이 열립니다</h2>
            <p className="category-guide__desc">
              주제가 많아질수록 한 번에 전부 보여주는 대신, 카테고리부터 고른 뒤 그 안에서 빠르게 살펴보는 구조가 더 편합니다.
              위 버튼에서 원하는 카테고리를 누르면 바로 목록이 나타나고, 같은 버튼을 다시 누르면 닫을 수 있습니다.
            </p>
          </div>
        ) : (
          <>
            <div className="section-head section-head--selected-category">
              <div>
                <h2 className="page-section-title">{selectedCategory} 카테고리의 밸런스게임</h2>
                <p className="section-head__sub">
                  관심 가는 주제를 골라 바로 투표하고, 오늘 참여한 게임은 홈에서 다시 쉽게 확인해보세요.
                </p>
              </div>
              <div className="section-head__actions">
                <button
                  type="button"
                  className="section-head__link section-head__link--ghost"
                  onClick={() => setSelectedCategory(null)}
                >
                  카테고리 닫기
                </button>
                <Link href="/admin" className="section-head__link">
                  새 주제 추가하기
                </Link>
              </div>
            </div>

            {filteredGames.length === 0 ? (
              <div className="empty-state">
                선택한 카테고리 안에서 검색 결과가 없습니다. 다른 키워드를 입력하거나 카테고리를 다시 골라보세요.
              </div>
            ) : (
              <div className="game-grid game-grid--compact">
                {filteredGames.map((game) => {
                  const isVotedToday = votedTodaySlugs.has(game.slug);

                  return (
                    <Link
                      key={game.slug}
                      href={`/games/${encodeURIComponent(game.slug)}`}
                      className="game-card game-card--compact"
                    >
                      <div className="game-card__head game-card__head--compact">
                        <span className="game-card__category">{game.category}</span>
                        {isVotedToday ? (
                          <span className="game-card__status game-card__status--done">투표 완료</span>
                        ) : null}
                      </div>

                      <h3 className="game-card__title game-card__title--compact">{game.title}</h3>

                      <div className="game-card__tags game-card__tags--compact">
                        {game.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="game-card__tag game-card__tag--compact">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
