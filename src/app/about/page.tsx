import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="shell about-grid">
      <section className="panel detail-hero">
        <div className="detail-hero__meta">
          <span className="meta-pill">설명</span>
          <span className="meta-pill">MVP 범위</span>
        </div>
        <h1 className="detail-hero__title">이 사이트는 이렇게 동작합니다</h1>
        <p className="detail-hero__desc">
          BALANCE LAB은 최대한 단순한 동선으로 밸런스게임을 소비하게 만드는 MVP입니다.
          홈에서는 텍스트 중심 카드로 빠르게 둘러보고, 상세 페이지에서 이미지와 함께 바로
          선택하게 설계했습니다.
        </p>
      </section>

      <section className="panel panel--padded">
        <ul className="about-list">
          <li>
            <strong>홈 구조</strong> — 검색창과 카테고리 필터로 원하는 게임을 빠르게 찾을 수
            있습니다.
          </li>
          <li>
            <strong>상세 구조</strong> — A/B 선택지는 이미지 카드로 보여주며, 클릭 또는 키보드
            좌우 화살표로 선택할 수 있습니다.
          </li>
          <li>
            <strong>투표 확인</strong> — 선택 직후 결과 패널이 같은 페이지 아래에 바로 열려,
            어떤 선택이 얼마나 선택되었는지 즉시 확인할 수 있습니다.
          </li>
          <li>
            <strong>현재 투표 저장 방식</strong> — 이 MVP는 서버 메모리 기반 데모 저장소를 사용합니다.
            개발/시연용으로는 충분하지만, 실제 서비스에서는 Supabase나 Firebase 같은 DB로 교체하면 됩니다.
          </li>
        </ul>

        <div className="result-actions" style={{ marginTop: 18 }}>
          <Link href="/" className="action-link action-button--primary">
            홈으로 돌아가기
          </Link>
        </div>
      </section>
    </div>
  );
}
