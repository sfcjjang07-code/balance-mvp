"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { games as baseGames } from "@/data/games/index";
import type { BalanceGame } from "@/data/games/types";
import {
  createEntryFileSnippet,
  createEntryJsonSnippet,
  createIndexSnippet,
  createPreviewGameFromDraft,
  createSafeEntryFileName,
  createSlugFromText,
  deleteCustomGame,
  importGamesFromJsonValue,
  readCustomGames,
  saveCustomGame,
  subscribeCustomGames,
  upsertCustomGames,
  type CustomGameDraft,
} from "@/lib/customGames";
import { mergeGamesBySlug } from "@/lib/gameCatalog";
import { filterVisibleGames, hideGameSlug, subscribeHiddenGames } from "@/lib/hiddenGames";
import { IMPORT_TEMPLATE_COLUMNS } from "@/lib/importTemplate";
import {
  publishGame,
  publishGames,
  readPublishedGames,
  subscribePublishedGames,
  syncCustomGamesIntoPublished,
  unpublishGame,
} from "@/lib/publishedGames";

const RECENT_VISIBLE_COUNT = 8;
const ACTIVE_VISIBLE_COUNT = 10;

const initialDraft: CustomGameDraft = {
  slug: "",
  title: "",
  category: "",
  tags: "",
  choiceA: {
    label: "",
  },
  choiceB: {
    label: "",
  },
};

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}

function upsertGameList(currentGames: BalanceGame[], incomingGames: BalanceGame[]) {
  const incomingSlugSet = new Set(incomingGames.map((game) => game.slug));
  return [...incomingGames, ...currentGames.filter((game) => !incomingSlugSet.has(game.slug))];
}

async function copyText(value: string, onSuccess: () => void, onFail: () => void) {
  try {
    await navigator.clipboard.writeText(value);
    onSuccess();
  } catch {
    onFail();
  }
}

export default function AdminClient() {
  const [draft, setDraft] = useState<CustomGameDraft>(initialDraft);
  const [savedGames, setSavedGames] = useState<BalanceGame[]>([]);
  const [publishedGames, setPublishedGames] = useState<BalanceGame[]>([]);
  const [selectedSnippetSlug, setSelectedSnippetSlug] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [showAllSavedGames, setShowAllSavedGames] = useState(false);
  const [savedGameQuery, setSavedGameQuery] = useState("");
  const [activeGameQuery, setActiveGameQuery] = useState("");
  const [showAllActiveGames, setShowAllActiveGames] = useState(false);
  const [isImportingJson, setIsImportingJson] = useState(false);

  useEffect(() => {
    const syncAdminState = () => {
      syncCustomGamesIntoPublished();
      setSavedGames(readCustomGames());
      setPublishedGames(readPublishedGames());
    };

    syncAdminState();
    const unsubscribeCustom = subscribeCustomGames(syncAdminState);
    const unsubscribePublished = subscribePublishedGames(syncAdminState);
    const unsubscribeHidden = subscribeHiddenGames(syncAdminState);

    return () => {
      unsubscribeCustom();
      unsubscribePublished();
      unsubscribeHidden();
    };
  }, []);

  const visibleCatalogGames = useMemo(
    () => filterVisibleGames(mergeGamesBySlug(publishedGames, baseGames)),
    [publishedGames],
  );

  const selectedGame = useMemo(
    () =>
      visibleCatalogGames.find((game) => game.slug === selectedSnippetSlug) ??
      savedGames.find((game) => game.slug === selectedSnippetSlug) ??
      visibleCatalogGames[0] ??
      savedGames[0] ??
      null,
    [savedGames, selectedSnippetSlug, visibleCatalogGames],
  );

  const suggestedSlug = useMemo(() => (draft.title.trim() ? createSlugFromText(draft.title) : ""), [draft.title]);
  const currentSlugValue = draft.slug?.trim() ? draft.slug : suggestedSlug;
  const suggestedEntryFileName = useMemo(
    () => createSafeEntryFileName(currentSlugValue || "sample-topic"),
    [currentSlugValue],
  );

  const existingGamesForValidation = useMemo(
    () => mergeGamesBySlug(visibleCatalogGames, savedGames),
    [savedGames, visibleCatalogGames],
  );

  const previewGame = useMemo(
    () =>
      createPreviewGameFromDraft(
        {
          ...draft,
          slug: currentSlugValue,
        },
        existingGamesForValidation,
      ),
    [currentSlugValue, draft, existingGamesForValidation],
  );

  const previewTsSnippet = previewGame ? createEntryFileSnippet(previewGame) : "";
  const previewJsonSnippet = previewGame ? createEntryJsonSnippet(previewGame) : "";
  const selectedTsSnippet = selectedGame ? createEntryFileSnippet(selectedGame) : "";
  const selectedJsonSnippet = selectedGame ? createEntryJsonSnippet(selectedGame) : "";
  const indexSnippet = useMemo(() => createIndexSnippet(publishedGames), [publishedGames]);

  const filteredSavedGames = useMemo(() => {
    const normalizedQuery = savedGameQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return savedGames;
    }

    return savedGames.filter((game) =>
      [game.title, game.category, game.slug, ...game.tags].join(" ").toLowerCase().includes(normalizedQuery),
    );
  }, [savedGames, savedGameQuery]);

  const visibleSavedGames = useMemo(
    () => (showAllSavedGames ? filteredSavedGames : filteredSavedGames.slice(0, RECENT_VISIBLE_COUNT)),
    [filteredSavedGames, showAllSavedGames],
  );

  const hiddenSavedGameCount = Math.max(filteredSavedGames.length - RECENT_VISIBLE_COUNT, 0);

  const filteredActiveGames = useMemo(() => {
    const normalizedQuery = activeGameQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return visibleCatalogGames;
    }

    return visibleCatalogGames.filter((game) =>
      [game.title, game.category, game.slug, ...game.tags].join(" ").toLowerCase().includes(normalizedQuery),
    );
  }, [activeGameQuery, visibleCatalogGames]);

  const visibleActiveGames = useMemo(
    () => (showAllActiveGames ? filteredActiveGames : filteredActiveGames.slice(0, ACTIVE_VISIBLE_COUNT)),
    [filteredActiveGames, showAllActiveGames],
  );

  const hiddenActiveGameCount = Math.max(filteredActiveGames.length - ACTIVE_VISIBLE_COUNT, 0);

  const updateDraft = (field: keyof CustomGameDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updateChoice = (
    choiceKey: "choiceA" | "choiceB",
    field: keyof CustomGameDraft["choiceA"],
    value: string,
  ) => {
    setDraft((prev) => ({
      ...prev,
      [choiceKey]: {
        ...prev[choiceKey],
        [field]: value,
      },
    }));
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTitle = event.target.value;
    const nextSuggestedSlug = nextTitle.trim() ? createSlugFromText(nextTitle) : "";

    setDraft((prev) => ({
      ...prev,
      title: nextTitle,
      slug: hasEditedSlug ? prev.slug : nextSuggestedSlug,
    }));
  };

  const handleSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHasEditedSlug(true);
    updateDraft("slug", event.target.value);
  };

  const applySuggestedSlug = () => {
    setHasEditedSlug(false);
    updateDraft("slug", suggestedSlug);
  };

  const resetDraft = () => {
    setDraft(initialDraft);
    setHasEditedSlug(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.title.trim() || !draft.category.trim() || !draft.choiceA.label.trim() || !draft.choiceB.label.trim()) {
      setStatusMessage("제목, 카테고리, A 선택지, B 선택지는 꼭 입력해 주세요.");
      return;
    }

    const nextGame = saveCustomGame(
      {
        ...draft,
        slug: currentSlugValue,
      },
      mergeGamesBySlug(visibleCatalogGames, savedGames),
    );

    publishGame(nextGame);

    const nextSavedGames = readCustomGames();
    const nextPublishedGames = readPublishedGames();

    setSavedGames(nextSavedGames);
    setPublishedGames(nextPublishedGames);
    setSelectedSnippetSlug(nextGame.slug);
    setDraft(initialDraft);
    setHasEditedSlug(false);
    setStatusMessage(
      `"${nextGame.title}" 주제가 저장되었고, 현재 브라우저의 게임 목록에도 자동 등록되었습니다.`,
    );
  };

  const handleDeleteSavedRecord = (slug: string) => {
    deleteCustomGame(slug);
    const nextSavedGames = readCustomGames();

    setSavedGames(nextSavedGames);
    setSelectedSnippetSlug(nextSavedGames[0]?.slug ?? visibleCatalogGames[0]?.slug ?? null);
    setStatusMessage("관리자 작업 내역에서만 삭제했습니다. 현재 운영 중인 게임 목록에서는 그대로 유지됩니다.");
  };

  const handleRemoveActiveGame = (slug: string) => {
    const existsInBase = baseGames.some((game) => game.slug === slug);

    unpublishGame(slug);
    deleteCustomGame(slug);

    if (existsInBase) {
      hideGameSlug(slug);
    }

    const nextSavedGames = readCustomGames();
    const nextPublishedGames = readPublishedGames();

    setSavedGames(nextSavedGames);
    setPublishedGames(nextPublishedGames);
    setSelectedSnippetSlug(nextPublishedGames[0]?.slug ?? nextSavedGames[0]?.slug ?? null);
    setStatusMessage(
      existsInBase
        ? "현재 운영 목록에서 제거했습니다. 기본 주제는 현재 브라우저에서 숨김 처리되었습니다."
        : "현재 운영 목록에서 제거했습니다. 자동 등록/관리자 저장 데이터에서도 함께 정리했습니다.",
    );
  };

  const handleBulkJsonImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setIsImportingJson(true);

    try {
      let workingSavedGames = readCustomGames();
      let workingPublishedGames = readPublishedGames();
      let importedGames: BalanceGame[] = [];
      let warningMessages: string[] = [];
      let parsedRecordCount = 0;

      for (const file of files) {
        const rawText = await file.text();
        const jsonValue = JSON.parse(rawText) as unknown;
        const result = importGamesFromJsonValue(jsonValue, {
          sourceLabel: file.name,
          baseGames,
          savedGames: workingSavedGames,
          publishedGames: workingPublishedGames,
        });

        parsedRecordCount += result.totalRecords;
        warningMessages = [...warningMessages, ...result.warnings];

        if (result.games.length > 0) {
          workingSavedGames = upsertGameList(workingSavedGames, result.games);
          workingPublishedGames = upsertGameList(workingPublishedGames, result.games);
          importedGames = upsertGameList(importedGames, result.games);
        }
      }

      if (importedGames.length === 0) {
        setStatusMessage(
          warningMessages[0] ?? "JSON 파일을 읽었지만 현재 구조와 맞는 주제를 찾지 못했습니다. title, category, choiceA/choiceB 또는 choices 배열 구조를 확인해 주세요.",
        );
        return;
      }

      upsertCustomGames(importedGames);
      publishGames(importedGames);

      const nextSavedGames = readCustomGames();
      const nextPublishedGames = readPublishedGames();
      setSavedGames(nextSavedGames);
      setPublishedGames(nextPublishedGames);
      setSelectedSnippetSlug(importedGames[0]?.slug ?? null);

      const warningPreview = warningMessages.slice(0, 3).join(" / ");
      setStatusMessage(
        `${files.length}개 JSON 파일에서 ${parsedRecordCount}개 항목을 읽었고, ${importedGames.length}개 주제를 자동 등록했습니다.${warningPreview ? ` 주의: ${warningPreview}` : ""}`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `JSON 일괄 업로드 중 오류가 발생했습니다: ${error.message}`
          : "JSON 일괄 업로드 중 알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setIsImportingJson(false);
    }
  };

  const copySelectedSnippet = async () => {
    if (!selectedTsSnippet) {
      return;
    }

    await copyText(
      selectedTsSnippet,
      () => setStatusMessage("파일 저장용 TS 코드가 복사되었습니다."),
      () => setStatusMessage("클립보드 복사에 실패했습니다. 아래 코드를 직접 복사해 주세요."),
    );
  };

  const copyIndexSnippet = async () => {
    await copyText(
      indexSnippet,
      () => setStatusMessage("index.ts 반영용 코드 블록이 복사되었습니다."),
      () => setStatusMessage("클립보드 복사에 실패했습니다. 아래 코드를 직접 복사해 주세요."),
    );
  };

  const downloadPreviewTs = () => {
    if (!previewGame || !previewTsSnippet) {
      setStatusMessage("필수 입력값을 먼저 채우면 TS 파일을 바로 내려받을 수 있습니다.");
      return;
    }

    const fileName = `${createSafeEntryFileName(previewGame.slug)}.ts`;
    downloadTextFile(fileName, previewTsSnippet, "text/typescript;charset=utf-8");
    setStatusMessage(`TS 파일 ${fileName} 을(를) 다운로드했습니다.`);
  };

  const downloadPreviewJson = () => {
    if (!previewGame || !previewJsonSnippet) {
      setStatusMessage("필수 입력값을 먼저 채우면 JSON 파일을 바로 내려받을 수 있습니다.");
      return;
    }

    const fileName = `${createSafeEntryFileName(previewGame.slug)}.json`;
    downloadTextFile(fileName, previewJsonSnippet, "application/json;charset=utf-8");
    setStatusMessage(`JSON 파일 ${fileName} 을(를) 다운로드했습니다.`);
  };

  const downloadSelectedTs = () => {
    if (!selectedGame || !selectedTsSnippet) {
      return;
    }

    const fileName = `${createSafeEntryFileName(selectedGame.slug)}.ts`;
    downloadTextFile(fileName, selectedTsSnippet, "text/typescript;charset=utf-8");
    setStatusMessage(`TS 파일 ${fileName} 을(를) 다운로드했습니다.`);
  };

  const downloadSelectedJson = () => {
    if (!selectedGame || !selectedJsonSnippet) {
      return;
    }

    const fileName = `${createSafeEntryFileName(selectedGame.slug)}.json`;
    downloadTextFile(fileName, selectedJsonSnippet, "application/json;charset=utf-8");
    setStatusMessage(`JSON 파일 ${fileName} 을(를) 다운로드했습니다.`);
  };

  const downloadIndexSnippet = () => {
    downloadTextFile("index-update-snippet.txt", indexSnippet, "text/plain;charset=utf-8");
    setStatusMessage("index.ts 반영용 코드 블록을 다운로드했습니다.");
  };

  return (
    <div className="shell admin-layout">
      <section className="panel detail-hero">
        <div className="detail-hero__meta">
          <span className="meta-pill">관리자</span>
          <span className="meta-pill meta-pill--light">자동 등록</span>
          <span className="meta-pill meta-pill--light">일괄 업로드</span>
          <span className="meta-pill meta-pill--light">운영 목록 삭제</span>
        </div>
        <h1 className="detail-hero__title">미니 관리자 페이지</h1>
        <p className="detail-hero__desc">
          저장한 주제는 현재 브라우저의 게임 목록에 자동 반영됩니다. JSON 파일로 여러 주제를 한 번에 올려도 바로 카드 섹션에 추가되고, 아래 운영 목록에서 현재 노출 중인 게임을 쉽게 제거할 수 있습니다.
        </p>
        <div className="hero__meta hero__meta--compact" style={{ marginTop: 16 }}>
          <span className="meta-pill">기본 주제 {baseGames.length}개</span>
          <span className="meta-pill">자동 등록 {publishedGames.length}개</span>
          <span className="meta-pill">현재 운영 목록 {visibleCatalogGames.length}개</span>
          <span className="meta-pill">관리자 작업 내역 {savedGames.length}개</span>
        </div>
        <div className="result-actions" style={{ marginTop: 16 }}>
          <Link href="/" className="action-link action-button--primary">
            홈으로 이동
          </Link>
        </div>
      </section>

      <section className="admin-grid">
        <form className="panel panel--padded admin-form" onSubmit={handleSubmit}>
          <div className="section-head section-head--stack">
            <div>
              <h2 className="page-section-title">새 밸런스게임 추가</h2>
              <p className="section-head__sub">
                저장과 동시에 현재 브라우저의 게임 목록에도 자동 등록됩니다. JSON 업로드는 현재 구조 기준 자동 등록용, TS 다운로드는 배포 소스 반영용으로 보면 됩니다.
              </p>
            </div>
          </div>

          <div className="admin-fields">
            <label className="field">
              <span className="field__label">주제 제목</span>
              <input
                className="text-input text-input--light"
                value={draft.title}
                onChange={handleTitleChange}
                placeholder="예: 여름 휴가 바다 vs 계곡"
              />
            </label>

            <div className="field-grid field-grid--2">
              <label className="field field--slug-helper">
                <span className="field__label">영문 slug</span>
                <input
                  className="text-input text-input--light"
                  value={draft.slug}
                  onChange={handleSlugChange}
                  placeholder="비워두면 제목 기반 추천값 사용"
                />
                <div className="slug-preview slug-preview--tight">
                  <strong>현재 적용 slug</strong>
                  <div>{currentSlugValue || "(제목을 입력하면 자동 생성)"}</div>
                  <div style={{ marginTop: 8 }}>추천 파일명: {suggestedEntryFileName}.ts / {suggestedEntryFileName}.json</div>
                  <div className="admin-snippet__actions" style={{ marginTop: 10 }}>
                    <button type="button" className="action-button action-button--small" onClick={applySuggestedSlug}>
                      추천 slug 다시 적용
                    </button>
                  </div>
                </div>
              </label>

              <div className="field-grid">
                <label className="field">
                  <span className="field__label">카테고리</span>
                  <input
                    className="text-input text-input--light"
                    value={draft.category}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("category", event.target.value)}
                    placeholder="예: 여행·휴식"
                  />
                </label>
                <label className="field">
                  <span className="field__label">태그</span>
                  <input
                    className="text-input text-input--light"
                    value={draft.tags}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("tags", event.target.value)}
                    placeholder="예: 여행,풍경,휴식"
                  />
                </label>
              </div>
            </div>

            <div className="field-grid field-grid--2">
              <div className="choice-editor">
                <div className="choice-editor__head">
                  <span className="choice-editor__badge">A</span>
                  <h3 className="choice-editor__title">왼쪽 선택지</h3>
                </div>
                <div className="choice-editor__fields">
                  <label className="field">
                    <span className="field__label">선택지 이름</span>
                    <input
                      className="text-input text-input--light"
                      value={draft.choiceA.label}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => updateChoice("choiceA", "label", event.target.value)}
                      placeholder="예: 바다"
                    />
                  </label>
                </div>
              </div>

              <div className="choice-editor">
                <div className="choice-editor__head">
                  <span className="choice-editor__badge choice-editor__badge--right">B</span>
                  <h3 className="choice-editor__title">오른쪽 선택지</h3>
                </div>
                <div className="choice-editor__fields">
                  <label className="field">
                    <span className="field__label">선택지 이름</span>
                    <input
                      className="text-input text-input--light"
                      value={draft.choiceB.label}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => updateChoice("choiceB", "label", event.target.value)}
                      placeholder="예: 계곡"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-actions admin-actions--wide">
            <button type="submit" className="action-link action-button--primary">
              저장 + 게임목록 자동 등록
            </button>
            <button type="button" className="action-button" onClick={downloadPreviewTs}>
              현재 입력값 TS 다운로드
            </button>
            <button type="button" className="action-button" onClick={downloadPreviewJson}>
              현재 입력값 JSON 다운로드
            </button>
            <button type="button" className="action-button" onClick={resetDraft}>
              입력 초기화
            </button>
          </div>

          {statusMessage ? <div className="loading-note loading-note--light">{statusMessage}</div> : null}
        </form>

        <div className="admin-side">
          <section className="panel panel--padded admin-list-panel">
            <div className="section-head section-head--stack">
              <div>
                <h2 className="page-section-title">JSON 일괄 업로드</h2>
                <p className="section-head__sub">
                  엑셀 템플릿 기준으로 만든 JSON 파일을 업로드하면 현재 게임 목록에 자동 등록됩니다. 즉, JSON 업로드만으로 코드 수정 없이 현재 카드 섹션에 반영할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="admin-note-card">
              <strong>엑셀 템플릿 + JSON 규칙</strong>
              <p>
                이 프로젝트는 <code>guide</code>, <code>all_topics</code> 시트로 나눈 엑셀 템플릿을 제공합니다. 컬럼은 <code>{IMPORT_TEMPLATE_COLUMNS.join(", ")}</code> 기준입니다.
              </p>
              <div className="admin-actions admin-actions--wide" style={{ marginTop: 12 }}>
                <a href="/templates/balance-game-import-template.xlsx" download className="action-button">
                  엑셀 템플릿 다운로드
                </a>
                <a href="/templates/balance-game-import-example.json" download className="action-button">
                  샘플 JSON 다운로드
                </a>
              </div>
            </div>

            <label className="file-input-card">
              <span className="field__label">JSON 파일 여러 개 선택</span>
              <input
                className="file-input"
                type="file"
                accept="application/json,.json"
                multiple
                onChange={handleBulkJsonImport}
                disabled={isImportingJson}
              />
              <span className="field__hint">
                업로드가 끝나면 홈 화면과 상세 페이지에서 바로 열 수 있습니다.
              </span>
            </label>
          </section>

          <section className="panel panel--padded admin-list-panel">
            <div className="section-head section-head--stack">
              <div>
                <h2 className="page-section-title">현재 운영 중인 게임</h2>
                <p className="section-head__sub">
                  홈 카드 섹션에 실제로 노출되는 게임 목록입니다. 여기서 제거하면 현재 브라우저 운영 목록에서 바로 빠집니다.
                </p>
              </div>
            </div>

            <div className="admin-list-toolbar">
              <div className="admin-list-toolbar__count">
                총 <strong>{visibleCatalogGames.length}</strong>개
              </div>
              <input
                className="text-input text-input--light text-input--compact"
                value={activeGameQuery}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setActiveGameQuery(event.target.value)}
                placeholder="현재 운영 게임 검색"
              />
            </div>

            {visibleCatalogGames.length === 0 ? (
              <div className="empty-state empty-state--light">현재 운영 중인 게임이 없습니다.</div>
            ) : filteredActiveGames.length === 0 ? (
              <div className="empty-state empty-state--light">검색 조건에 맞는 운영 게임이 없습니다.</div>
            ) : (
              <>
                <div className={`admin-list ${showAllActiveGames ? "admin-list--scroll" : ""}`}>
                  {visibleActiveGames.map((game) => (
                    <article key={game.slug} className="admin-list__item">
                      <div className="admin-list__meta">
                        <span className="game-card__category">{game.category}</span>
                        <span className="admin-list__slug">/{game.slug}</span>
                      </div>
                      <h3 className="admin-list__title">{game.title}</h3>
                      <div className="game-card__tags game-card__tags--compact">
                        {game.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="game-card__tag game-card__tag--compact">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="admin-list__actions">
                        <Link href={`/games/${encodeURIComponent(game.slug)}`} className="action-button">
                          열기
                        </Link>
                        <button type="button" className="action-button" onClick={() => setSelectedSnippetSlug(game.slug)}>
                          코드 보기
                        </button>
                        <button type="button" className="action-button action-button--danger" onClick={() => handleRemoveActiveGame(game.slug)}>
                          운영 목록 제거
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {filteredActiveGames.length > ACTIVE_VISIBLE_COUNT ? (
                  <button
                    type="button"
                    className="action-button admin-toggle-button"
                    onClick={() => setShowAllActiveGames((prev) => !prev)}
                  >
                    {showAllActiveGames ? "운영 목록 접기" : `전체 ${filteredActiveGames.length}개 보기 (+${hiddenActiveGameCount}개)`}
                  </button>
                ) : null}
              </>
            )}
          </section>

          <section className="panel panel--padded admin-list-panel">
            <div className="section-head section-head--stack">
              <div>
                <h2 className="page-section-title">관리자 작업 내역</h2>
                <p className="section-head__sub">
                  여기서 삭제해도 현재 운영 목록에서는 바로 사라지지 않습니다. 대신 입력 이력 정리에만 사용합니다.
                </p>
              </div>
            </div>

            <div className="admin-list-toolbar">
              <div className="admin-list-toolbar__count">
                총 <strong>{savedGames.length}</strong>개
              </div>
              <input
                className="text-input text-input--light text-input--compact"
                value={savedGameQuery}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSavedGameQuery(event.target.value)}
                placeholder="제목, 태그, slug 검색"
              />
            </div>

            {savedGames.length === 0 ? (
              <div className="empty-state empty-state--light">아직 관리자 작업 내역이 없습니다.</div>
            ) : filteredSavedGames.length === 0 ? (
              <div className="empty-state empty-state--light">검색 조건에 맞는 작업 내역이 없습니다.</div>
            ) : (
              <>
                <div className={`admin-list ${showAllSavedGames ? "admin-list--scroll" : ""}`}>
                  {visibleSavedGames.map((game) => (
                    <article key={game.slug} className="admin-list__item">
                      <div className="admin-list__meta">
                        <span className="game-card__category">{game.category}</span>
                        <span className="admin-list__slug">/{game.slug}</span>
                      </div>
                      <h3 className="admin-list__title">{game.title}</h3>
                      <div className="game-card__tags game-card__tags--compact">
                        {game.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="game-card__tag game-card__tag--compact">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="admin-list__actions">
                        <Link href={`/games/${encodeURIComponent(game.slug)}`} className="action-button">
                          열기
                        </Link>
                        <button type="button" className="action-button" onClick={() => setSelectedSnippetSlug(game.slug)}>
                          코드 보기
                        </button>
                        <button type="button" className="action-button action-button--danger" onClick={() => handleDeleteSavedRecord(game.slug)}>
                          작업 내역 삭제
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {filteredSavedGames.length > RECENT_VISIBLE_COUNT ? (
                  <button
                    type="button"
                    className="action-button admin-toggle-button"
                    onClick={() => setShowAllSavedGames((prev) => !prev)}
                  >
                    {showAllSavedGames ? "최근 항목 위주로 접기" : `전체 ${filteredSavedGames.length}개 보기 (+${hiddenSavedGameCount}개)`}
                  </button>
                ) : null}
              </>
            )}
          </section>

          <section className="panel panel--padded admin-list-panel">
            <div className="section-head section-head--stack">
              <div>
                <h2 className="page-section-title">파일 저장용 코드</h2>
                <p className="section-head__sub">
                  TS는 현재 소스 구조에 바로 넣기 좋고, JSON은 데이터 백업·검수·향후 DB 입력용으로 쓰기 좋습니다.
                </p>
              </div>
            </div>

            {selectedGame ? (
              <>
                <div className="admin-snippet__head">
                  <div>
                    <strong>{selectedGame.title}</strong>
                    <p className="section-head__sub">추천 경로: src/data/games/entries/{createSafeEntryFileName(selectedGame.slug)}.ts</p>
                    <p className="section-head__sub">JSON 업로드는 자동 등록용, 이 파일은 배포 소스 반영용입니다.</p>
                  </div>
                  <div className="admin-snippet__actions">
                    <button type="button" className="action-button" onClick={downloadSelectedTs}>
                      TS 다운로드
                    </button>
                    <button type="button" className="action-button" onClick={downloadSelectedJson}>
                      JSON 다운로드
                    </button>
                    <button type="button" className="action-button" onClick={copySelectedSnippet}>
                      코드 복사
                    </button>
                  </div>
                </div>
                <pre className="admin-snippet"><code>{selectedTsSnippet}</code></pre>
              </>
            ) : (
              <div className="empty-state empty-state--light">코드를 생성할 주제를 먼저 선택해 주세요.</div>
            )}
          </section>

          <section className="panel panel--padded admin-list-panel">
            <div className="section-head section-head--stack">
              <div>
                <h2 className="page-section-title">index.ts 반영용 코드</h2>
                <p className="section-head__sub">
                  다운로드한 TS 파일을 <code>src/data/games/entries</code> 폴더에 넣은 뒤 아래 블록을 <code>src/data/games/index.ts</code>에 붙여넣으면 import 문과 games 배열 항목을 한 번에 정리할 수 있습니다.
                </p>
              </div>
            </div>
            <div className="admin-snippet__actions">
              <button type="button" className="action-button" onClick={downloadIndexSnippet}>
                index 코드 다운로드
              </button>
              <button type="button" className="action-button" onClick={copyIndexSnippet}>
                index 코드 복사
              </button>
            </div>
            <pre className="admin-snippet admin-snippet--compact"><code>{indexSnippet}</code></pre>
          </section>
        </div>
      </section>
    </div>
  );
}
