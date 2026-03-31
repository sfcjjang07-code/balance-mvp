# BALANCE LAB MVP

Next.js + TypeScript 기반의 심플한 밸런스게임 MVP입니다.

## 실행

```bash
npm install
npm run dev
```

## 이번 구조의 핵심

- 홈 상단 소개와 목록 사이에 가로형 광고 슬롯 1개 배치
- 홈 카드는 흰색의 작은 인덱스 카드 형태로 압축
- 상세 선택 카드는 더 작고 흰색으로 조정
- 게임 데이터는 파일 1개에 몰아넣지 않고 `src/data/games/entries` 아래로 분리

## 새 주제 추가 방법

1. `src/data/games/_template.ts` 파일을 복사
2. `src/data/games/entries/새슬러그.ts` 생성
3. `slug`, `title`, `category`, `tags`, `choices` 안의 `label`, `image` 등을 입력
4. `src/data/games/index.ts` 에 import 1줄 추가 후 `games` 배열에 넣기

이렇게 하면 홈 목록과 상세 페이지가 바로 연결됩니다.

## 광고 붙이는 방법

현재 `src/components/AdBanner.tsx` 는 자리 표시용 컴포넌트입니다.
나중에 애드센스 등을 붙일 때는 이 컴포넌트 내부를 실제 광고 스크립트 또는 광고 컴포넌트로 교체하면 됩니다.
