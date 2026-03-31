import { hasOperatorPlaceholders, siteConfig } from "@/config/site";

export const metadata = {
  title: `운영 고지 | ${siteConfig.siteName}`,
  description: `${siteConfig.siteName} 운영 고지`,
};

export default function NoticePage() {
  const hasPlaceholders = hasOperatorPlaceholders();

  return (
    <div className="shell legal-shell">
      <section className="legal-card">
        <span className="legal-eyebrow">SITE NOTICE</span>
        <h1 className="legal-title">운영 고지</h1>
        <p className="legal-desc">
          본 페이지는 사이트의 운영 성격, 권리 침해 신고 경로, 광고·콘텐츠 운영 원칙을 안내하기 위한 페이지입니다.
        </p>
        {hasPlaceholders ? (
          <div className="legal-warning">
            <strong>배포 전 확인 필요</strong>
            <p>{siteConfig.supportNotice}</p>
          </div>
        ) : null}
      </section>

      <section className="legal-card legal-card--body">
        <h2>1. 사이트 성격</h2>
        <p>
          사이트는 일반 취향형 밸런스게임 콘텐츠를 제공하는 비회원형 서비스입니다. 운영 목적은 가벼운 선택형
          콘텐츠 제공이며, 특정 인물·단체·브랜드·제품에 관한 공식 발표나 홍보를 대행하지 않습니다.
        </p>

        <h2>2. 콘텐츠 운영 원칙</h2>
        <ul className="legal-list">
          <li>비방, 혐오, 차별, 외모 평가, 명예훼손 우려가 큰 주제는 지양합니다.</li>
          <li>실존 인물, 브랜드, 저작권 보호 표현은 운영상 필요한 경우에도 신중하게 다룹니다.</li>
          <li>권리 침해 또는 분쟁 우려가 접수되면 임시 비공개 또는 삭제 조치를 할 수 있습니다.</li>
        </ul>

        <h2>3. 광고 및 분석</h2>
        <p>
          사이트는 운영 상황에 따라 광고를 표시하거나 기본적인 접속 통계를 집계할 수 있습니다. 쿠키, 브라우저
          저장소, 접속기록 등 자동 수집 장치 관련 사항은 개인정보처리방침에서 함께 안내합니다.
        </p>

        <h2>4. 권리 침해 신고 및 문의</h2>
        <div className="legal-contact-grid">
          <div>
            <strong>운영자</strong>
            <span>{siteConfig.operatorName}</span>
          </div>
          <div>
            <strong>이메일</strong>
            <span>{siteConfig.contactEmail}</span>
          </div>
          <div>
            <strong>주소</strong>
            <span>{siteConfig.mailingAddress}</span>
          </div>
          <div>
            <strong>회신 기준</strong>
            <span>{siteConfig.contactResponseHours}</span>
          </div>
        </div>

        <h2>5. 신고 시 포함하면 좋은 내용</h2>
        <ul className="legal-list">
          <li>문제가 되는 페이지 주소(URL)</li>
          <li>침해 주장 내용과 권리 근거</li>
          <li>신청인 이름, 소속, 연락 가능한 이메일</li>
          <li>필요 시 권리 보유를 확인할 수 있는 자료</li>
        </ul>

        <h2>6. 공개 전 최종 점검 권장 사항</h2>
        <ul className="legal-list">
          <li>실제 운영자명, 이메일, 주소를 정확한 정보로 입력</li>
          <li>광고 도입 여부에 따라 개인정보처리방침의 광고 문구 재확인</li>
          <li>문의 채널이 실제로 수신 가능한지 테스트</li>
        </ul>
      </section>
    </div>
  );
}
