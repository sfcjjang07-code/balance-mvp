import { hasOperatorPlaceholders, siteConfig } from "@/config/site";

export const metadata = {
  title: `이용약관 | ${siteConfig.siteName}`,
  description: `${siteConfig.siteName} 이용약관`,
};

export default function TermsPage() {
  const hasPlaceholders = hasOperatorPlaceholders();

  return (
    <div className="shell legal-shell">
      <section className="legal-card">
        <span className="legal-eyebrow">TERMS OF USE</span>
        <h1 className="legal-title">이용약관</h1>
        <p className="legal-desc">
          본 약관은 {siteConfig.legalServiceName}(이하 “사이트”)가 제공하는 밸런스게임 콘텐츠 서비스의 이용
          조건과 운영 기준을 정합니다.
        </p>
        <div className="legal-meta-row">
          <span className="legal-meta-pill">시행일: {siteConfig.effectiveDate}</span>
          <span className="legal-meta-pill">비회원형 서비스 기준</span>
        </div>
        {hasPlaceholders ? (
          <div className="legal-warning">
            <strong>배포 전 확인 필요</strong>
            <p>{siteConfig.supportNotice}</p>
          </div>
        ) : null}
      </section>

      <section className="legal-card legal-card--body">
        <h2>1. 서비스의 성격</h2>
        <p>
          사이트는 일반 취향형 밸런스게임, 투표 결과 확인, 검색, 공유 기능 등을 제공하는 콘텐츠 서비스입니다.
          특정 인물, 단체, 브랜드, 제품과의 공식 제휴를 의미하지 않으며, 법률·의료·투자 조언을 제공하지
          않습니다.
        </p>

        <h2>2. 이용자의 준수사항</h2>
        <ul className="legal-list">
          <li>서비스를 비정상적으로 우회하거나 자동화 수단으로 악용해서는 안 됩니다.</li>
          <li>관리자 기능 또는 업로드 기능을 통해 권리를 침해하는 자료를 반영해서는 안 됩니다.</li>
          <li>타인의 명예를 훼손하거나 차별·혐오·비방을 유도하는 콘텐츠를 등록해서는 안 됩니다.</li>
          <li>사이트의 보안, 안정성, 정상 운영을 방해하는 행위를 해서는 안 됩니다.</li>
        </ul>

        <h2>3. 콘텐츠 및 지식재산권</h2>
        <p>
          사이트에 게시된 텍스트, 구조, 편집물, 디자인, 코드 등은 운영자 또는 정당한 권리자에게 권리가 있을
          수 있습니다. 이용자는 관련 법령이 허용하는 범위를 넘어 무단 복제·배포·2차 이용을 해서는 안 됩니다.
          권리 침해 신고가 접수되면 운영자는 검토 후 비공개·삭제 등 필요한 조치를 할 수 있습니다.
        </p>

        <h2>4. 공유 기능과 외부 서비스</h2>
        <p>
          사이트는 결과 공유 또는 외부 링크 이동 기능을 제공할 수 있습니다. 외부 서비스는 해당 서비스의 약관과
          정책이 적용되며, 운영자는 외부 서비스의 내용이나 가용성까지 보증하지 않습니다.
        </p>

        <h2>5. 서비스 변경 및 중단</h2>
        <p>
          운영자는 시스템 점검, 정책 변경, 기능 개편, 법령 준수, 보안 대응 등을 위해 서비스의 전부 또는 일부를
          변경·중단할 수 있습니다. 중요한 사항은 사이트 내 공지 또는 관련 페이지를 통해 안내합니다.
        </p>

        <h2>6. 면책</h2>
        <ul className="legal-list">
          <li>사이트는 무료 콘텐츠형 서비스를 기준으로 제공되며, 특정 목적 적합성이나 무중단 제공을 보증하지 않습니다.</li>
          <li>이용자의 브라우저 설정, 네트워크 환경, 기기 상태로 인한 문제에 대해 운영자는 제한적으로 책임을 집니다.</li>
          <li>이용자가 직접 입력·업로드한 데이터로 인한 분쟁은 해당 이용자 책임이 우선합니다.</li>
        </ul>

        <h2>7. 권리 침해 신고</h2>
        <p>
          저작권, 상표권, 초상·성명 관련 권리 등 침해 우려가 있는 경우 아래 운영자 연락처로 신고할 수 있으며,
          운영자는 합리적인 기간 내 검토 후 임시 비공개, 삭제, 수정 등 필요한 조치를 할 수 있습니다.
        </p>

        <h2>8. 준거와 해석</h2>
        <p>
          본 약관은 대한민국 법령을 기준으로 해석합니다. 개별 약관 조항이 무효가 되더라도 나머지 조항은 가능한
          범위에서 계속 효력을 가집니다.
        </p>
      </section>
    </div>
  );
}
