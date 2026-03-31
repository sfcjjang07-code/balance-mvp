export const IMPORT_TEMPLATE_COLUMNS = [
  "slug",
  "title",
  "category",
  "tags",
  "choice_a_label",
  "choice_b_label",
] as const;

export type ImportTemplateColumn = (typeof IMPORT_TEMPLATE_COLUMNS)[number];

export const IMPORT_TEMPLATE_SHEETS = ["guide", "all_topics"] as const;

export const IMPORT_TEMPLATE_EXAMPLE_ROW = {
  slug: "sea-stay-vs-valley-stay",
  title: "바다 숙소 vs 계곡 숙소",
  category: "여행·휴식",
  tags: "여행,숙소,자연,휴식",
  choice_a_label: "바다 숙소",
  choice_b_label: "계곡 숙소",
} as const;

export const IMPORT_TEMPLATE_COLUMN_GUIDE = [
  ["slug", "권장", "같은 주제는 제목이 바뀌어도 같은 slug를 유지하세요."],
  ["title", "필수", "홈과 상세 페이지에 보일 주제 제목"],
  ["category", "필수", "홈 필터와 카테고리 뱃지에 사용"],
  ["tags", "권장", "쉼표로 구분해 입력하세요. 예: 여행,숙소,자연"],
  ["choice_a_label", "필수", "왼쪽 선택지 제목"],
  ["choice_b_label", "필수", "오른쪽 선택지 제목"],
] as const;
