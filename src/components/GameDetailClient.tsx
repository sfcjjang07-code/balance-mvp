"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { games as baseGames } from "@/data/games/index";
import type { BalanceGame, ChoiceId } from "@/data/games/types";
import { getTodayVoteChoice, setTodayVoteChoice } from "@/lib/clientVoteSession";
import { recordTopicView, recordTopicVote } from "@/lib/clientTopicStats";
import { getCustomGameBySlug, subscribeCustomGames } from "@/lib/customGames";
import { isGameHidden, subscribeHiddenGames } from "@/lib/hiddenGames";
import {
  getPublishedGameBySlug,
  subscribePublishedGames,
  syncCustomGamesIntoPublished,
} from "@/lib/publishedGames";

type VoteResponse = {
  counts: Record<string, number>;
  percentages: Record<string, number>;
  total: number;
};

type Props = {
  slug: string;
  initialGame: BalanceGame | null;
};

function buildShareText(game: BalanceGame, selectedChoiceLabel: string, voteData: VoteResponse) {
  const lines = [
    `BALANCE LAB 결과 공유`,
    `${game.title}`,
    `내 선택: ${selectedChoiceLabel}`,
    `${game.choices[0].label} ${voteData.percentages.a ?? 0}% · ${game.choices[1].label} ${voteData.percentages.b ?? 0}%`,
    typeof window !== "undefined" ? window.location.href : "",
  ];

  return lines.filter(Boolean).join("\n");
}

export default function GameDetailClient({ slug, initialGame }: Props) {
  const [resolvedGame, setResolvedGame] = useState<BalanceGame | null>(initialGame);
  const [source, setSource] = useState<"static" | "published" | "custom" | null>(initialGame ? "static" : null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<ChoiceId | null>(null);
  const [voteData, setVoteData] = useState<VoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [isResolved, setIsResolved] = useState(Boolean(initialGame));
  const trackedViewSlugRef = useRef<string | null>(null);

  useEffect(() => {
    const syncResolvedGame = () => {
      syncCustomGamesIntoPublished();

      if (isGameHidden(slug)) {
        setResolvedGame(null);
        setSource(null);
        setIsResolved(true);
        return;
      }

      const publishedGame = getPublishedGameBySlug(slug);
      const customGame = getCustomGameBySlug(slug);

      if (publishedGame) {
        setResolvedGame(publishedGame);
        setSource("published");
      } else if (customGame) {
        setResolvedGame(customGame);
        setSource("custom");
      } else if (initialGame) {
        setResolvedGame(initialGame);
        setSource("static");
      } else {
        setResolvedGame(null);
        setSource(null);
      }

      setIsResolved(true);
    };

    syncResolvedGame();
    const unsubscribePublished = subscribePublishedGames(syncResolvedGame);
    const unsubscribeCustom = subscribeCustomGames(syncResolvedGame);
    const unsubscribeHidden = subscribeHiddenGames(syncResolvedGame);

    return () => {
      unsubscribePublished();
      unsubscribeCustom();
      unsubscribeHidden();
    };
  }, [initialGame, slug]);

  useEffect(() => {
    if (!resolvedGame) {
      setSelectedChoiceId(null);
      setNoticeMessage("");
      return;
    }

    const savedChoice = getTodayVoteChoice(resolvedGame.slug);
    setSelectedChoiceId(savedChoice);
    setNoticeMessage(savedChoice ? "이 게임은 오늘 이미 투표했습니다. 현재 결과만 다시 확인할 수 있습니다." : "");
  }, [resolvedGame]);

  useEffect(() => {
    if (!resolvedGame) {
      trackedViewSlugRef.current = null;
      return;
    }

    if (trackedViewSlugRef.current === resolvedGame.slug) {
      return;
    }

    void recordTopicView(resolvedGame.slug);
    trackedViewSlugRef.current = resolvedGame.slug;
  }, [resolvedGame]);

  const fetchVotes = useCallback(async () => {
    if (!resolvedGame || !source) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/votes/${resolvedGame.slug}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("투표 데이터를 불러오지 못했습니다.");
      }

      const data = (await response.json()) as VoteResponse;
      setVoteData(data);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [resolvedGame, source]);

  useEffect(() => {
    void fetchVotes();
  }, [fetchVotes]);

  const submitChoice = useCallback(
    async (choiceId: ChoiceId) => {
      if (!resolvedGame || !source || selectedChoiceId || isSubmitting) {
        if (selectedChoiceId) {
          setNoticeMessage("이 게임은 오늘 이미 투표했습니다. 현재 결과만 다시 확인할 수 있습니다.");
        }
        return;
      }

      try {
        setIsSubmitting(true);

        const response = await fetch(`/api/votes/${resolvedGame.slug}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ choiceId }),
        });

        if (!response.ok) {
          throw new Error("투표를 저장하지 못했습니다.");
        }

        const data = (await response.json()) as VoteResponse;
        await recordTopicVote(resolvedGame.slug, choiceId);
        setTodayVoteChoice(resolvedGame.slug, choiceId);
        setSelectedChoiceId(choiceId);
        setVoteData(data);
        setNoticeMessage("");
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, resolvedGame, selectedChoiceId, source],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (selectedChoiceId || isSubmitting) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        void submitChoice("a");
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        void submitChoice("b");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSubmitting, selectedChoiceId, submitChoice]);

  const selectedChoice = useMemo(
    () => resolvedGame?.choices.find((choice) => choice.id === selectedChoiceId) ?? null,
    [resolvedGame, selectedChoiceId],
  );

  const hasResult = Boolean(selectedChoiceId && voteData);
  const adminFallbackLink = baseGames.length > 0 ? "/admin" : "/";

  const handleShareResult = useCallback(async () => {
    if (!resolvedGame || !selectedChoice || !voteData) {
      return;
    }

    const shareText = buildShareText(resolvedGame, selectedChoice.label, voteData);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${resolvedGame.title} 결과`,
          text: shareText,
          url: window.location.href,
        });
        setNoticeMessage("결과 공유 창을 열었습니다.");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setNoticeMessage("결과 문구와 현재 주소를 클립보드에 복사했습니다.");
    } catch {
      setNoticeMessage("공유에 실패했습니다. 다시 시도해 주세요.");
    }
  }, [resolvedGame, selectedChoice, voteData]);

  if (!isResolved) {
    return (
      <div className="shell detail-layout">
        <div className="loading-note">주제를 불러오는 중입니다.</div>
      </div>
    );
  }

  if (!resolvedGame) {
    return (
      <div className="shell detail-layout">
        <section className="panel panel--padded missing-panel">
          <div className="detail-hero__meta">
            <span className="meta-pill">찾을 수 없음</span>
          </div>
          <h1 className="detail-hero__title">해당 주제를 찾지 못했습니다</h1>
          <p className="detail-hero__desc">
            삭제되었거나, 현재 브라우저의 운영 목록에서 숨겨진 주제일 수 있습니다.
          </p>
          <div className="result-actions">
            <Link href="/" className="action-link action-button--primary">
              홈으로 이동하기
            </Link>
            <Link href={adminFallbackLink} className="action-button">
              관리자 페이지 열기
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="shell detail-layout">
      <section className="panel detail-hero">
        <div className="detail-hero__meta">
          <span className="meta-pill">{resolvedGame.category}</span>
          {resolvedGame.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="meta-pill meta-pill--light">
              #{tag}
            </span>
          ))}
          {source === "custom" ? <span className="meta-pill meta-pill--custom">관리자 추가</span> : null}
        </div>
        <h1 className="detail-hero__title">{resolvedGame.title}</h1>
        <p className="keyboard-tip">← 왼쪽 화살표는 A 선택, → 오른쪽 화살표는 B 선택 · 게임별 하루 1회 투표</p>
      </section>

      <section className="choice-grid" aria-label="밸런스게임 선택 영역">
        {resolvedGame.choices.map((choice, index) => {
          const isChosen = selectedChoiceId === choice.id;
          const isMuted = Boolean(selectedChoiceId && selectedChoiceId !== choice.id);

          return (
            <button
              key={choice.id}
              type="button"
              className={`choice-card choice-card--${choice.id} ${isChosen ? "choice-card--chosen" : ""} ${isMuted ? "choice-card--muted" : ""}`}
              onClick={() => void submitChoice(choice.id)}
              disabled={Boolean(selectedChoiceId) || isSubmitting}
              aria-pressed={isChosen}
            >
              <div className="choice-card__body">
                <div className="choice-card__label-row">
                  <div className="choice-card__title-wrap">
                    <span className={`choice-card__index choice-card__index--${choice.id}`}>{choice.id.toUpperCase()}</span>
                    <span className={`choice-card__tone choice-card__tone--${choice.id}`}>
                      {choice.id === "a" ? "LEFT" : "RIGHT"}
                    </span>
                  </div>
                  <span className={`choice-card__arrow choice-card__arrow--${choice.id}`}>
                    {index === 0 ? "← 선택" : "선택 →"}
                  </span>
                </div>
                <h2 className="choice-card__label">{choice.label}</h2>
              </div>
            </button>
          );
        })}
      </section>

      {isLoading ? <div className="loading-note">투표 데이터를 불러오는 중입니다.</div> : null}
      {noticeMessage ? <div className="loading-note loading-note--light">{noticeMessage}</div> : null}
      {errorMessage ? <div className="error-note">{errorMessage}</div> : null}

      {hasResult && voteData ? (
        <section className="panel panel--padded result-panel">
          <div className="result-panel__head">
            <div>
              <h2 className="result-panel__title">투표 결과</h2>
              <p className="result-panel__sub">
                선택 직후 바로 아래에서 결과를 확인할 수 있도록 구성했습니다.
              </p>
            </div>
            <span className="meta-pill">총 {voteData.total.toLocaleString("ko-KR")}표</span>
          </div>

          {selectedChoice ? (
            <div className="selected-summary">
              <strong>{selectedChoice.label}</strong> 를 선택했습니다. 아래에서 현재 누적 비율을 확인할 수 있습니다.
            </div>
          ) : null}

          <div className="result-stack">
            {resolvedGame.choices.map((choice) => {
              const count = voteData.counts[choice.id] ?? 0;
              const percentage = voteData.percentages[choice.id] ?? 0;
              const isMine = selectedChoiceId === choice.id;

              return (
                <div key={choice.id} className="result-item">
                  <div className="result-item__top">
                    <div className="result-item__name">
                      <span>{choice.id.toUpperCase()}</span>
                      <span>{choice.label}</span>
                      {isMine ? <span className="result-item__badge">내 선택</span> : null}
                    </div>
                    <div className="result-item__numbers">
                      {count.toLocaleString("ko-KR")}표 · {percentage}%
                    </div>
                  </div>
                  <div className="result-bar">
                    <div className="result-bar__fill" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="result-actions">
            <Link href="/" className="action-link action-button--primary">
              첫 페이지로 이동하기
            </Link>
            <button type="button" className="action-button" onClick={() => window.location.reload()}>
              현재 결과 새로고침
            </button>
            <button type="button" className="action-button action-button--share" onClick={() => void handleShareResult()}>
              결과 공유하기
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
