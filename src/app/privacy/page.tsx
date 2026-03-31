import { hasOperatorPlaceholders, siteConfig } from "@/config/site";

export const metadata = {
  title: `개인정보처리방침 | ${siteConfig.siteName}`,
  description: `${siteConfig.siteName} 개인정보처리방침`,
};

export default function PrivacyPage() {
  const hasPlaceholders = hasOperatorPlaceholders();

  return (
    <div className="shell legal-shell">
      <section className="legal-card">
        <span className="legal-eyebrow">PRIVACY POLICY</span>
        <h1 className="legal-title">개인정보처리방침</h1>
        <p className="legal-desc">
          {siteConfig.legalServiceName}(이하 “사이트”)는 이용자의 개인정보를 보호하고 관련 문의를 원활히
          처리하기 위하여 본 개인정보처리방침을 공개합니다.
        </p>
        <div className="legal-meta-row">
          <span className="legal-meta-pill">시행일: {siteConfig.effectiveDate}</span>
          <span className="legal-meta-pill">비회원형 콘텐츠 서비스</span>
          <span className="legal-meta-pill">쿠키·로컬 저장소 사용 안내 포함</span>
        </div>
        {hasPlaceholders ? (
          <div className="legal-warning">
            <strong>배포 전 확인 필요</strong>
            <p>{siteConfig.supportNotice}</p>
          </div>
        ) : null}
      </section>

      <section className="legal-card legal-card--body">
        <h2>1. 처리하는 개인정보 항목 및 수집 방법</h2>
        <p>
          사이트는 회원가입 없이 이용할 수 있는 구조를 기본으로 하며, 서비스 제공 과정에서 다음 정보가
          자동 또는 이용자 기기 내 저장 방식으로 처리될 수 있습니다.
        </p>
        <ul className="legal-list">
          <li>브라우저가 자동으로 전송하는 접속기록, IP 주소, 기기·브라우저 정보, 방문 시각</li>
          <li>투표 제한 및 서비스 상태 유지를 위한 localStorage/sessionStorage 값</li>
          <li>관리자 페이지에서 임시 저장하는 게임 작성 데이터(동일 브라우저 내부 저장)</li>
          <li>문의 메일을 보내는 경우 이용자가 메일 본문에 직접 기재한 정보</li>
        </ul>

        <h2>2. 개인정보의 처리 목적</h2>
        <ul className="legal-list">
          <li>밸런스게임 제공, 투표 제한, 결과 표시, 공유 기능 제공</li>
          <li>방문 수 집계, 서비스 품질 유지, 오류 확인 및 악용 방지</li>
          <li>문의 대응 및 권리 침해 신고 처리</li>
          <li>운영상 필요한 범위의 통계 작성 및 보안 점검</li>
        </ul>

        <h2>3. 보유 및 이용 기간</h2>
        <ul className="legal-list">
          <li>브라우저 내 저장값은 이용자가 삭제하거나 브라우저 저장소를 초기화할 때까지 유지될 수 있습니다.</li>
          <li>서버 로그 및 통계성 기록은 보안·운영 목적의 합리적인 기간 동안 보관 후 파기할 수 있습니다.</li>
          <li>문의 메일은 문의 해결 및 분쟁 대응에 필요한 기간 동안 보관할 수 있습니다.</li>
        </ul>

        <h2>4. 제3자 제공 및 처리위탁</h2>
        <p>
          사이트는 원칙적으로 이용자의 개인정보를 외부에 판매하거나 임의 제공하지 않습니다. 다만 웹
          호스팅, 로그 보관, 향후 제3자 광고(예: Google AdSense) 도입 시 서비스 제공에 필요한 범위에서
          관련 사업자의 쿠키 또는 식별자가 사용될 수 있으며, 그 경우 관련 사실을 본 방침 또는 별도 고지를
          통해 안내합니다.
        </p>

        <h2>5. 자동 수집 장치의 설치·운영 및 거부</h2>
        <p>
          사이트는 투표 제한, 방문 카운트, 관리자 임시 저장을 위해 브라우저 저장소(localStorage,
          sessionStorage) 및 기술적으로 필요한 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정에서
          쿠키·사이트 데이터 삭제 또는 차단을 선택할 수 있으나, 이 경우 일부 기능이 정상적으로 동작하지 않을
          수 있습니다.
        </p>

        <h2>6. 정보주체의 권리와 행사 방법</h2>
        <p>
          이용자는 자신의 개인정보 처리에 관하여 열람, 정정, 삭제, 처리정지 요청을 할 수 있으며, 문의 또는
          권리행사는 아래 연락처로 접수할 수 있습니다. 다만 브라우저 내에만 저장된 데이터는 이용자가 직접
          브라우저 설정에서 삭제하는 것이 가장 신속한 방법입니다.
        </p>

        <h2>7. 안전성 확보 조치</h2>
        <ul className="legal-list">
          <li>접근 권한 최소화 및 운영상 필요한 범위의 로그 관리</li>
          <li>파일·서버 접근 통제 및 비정상 트래픽 확인</li>
          <li>서비스 코드 및 저장 데이터의 정기 점검</li>
        </ul>

        <h2>8. 아동의 개인정보</h2>
        <p>
          사이트는 만 14세 미만 아동을 대상으로 한 회원제 서비스를 운영하지 않습니다. 다만 이용자가 문의 메일
          등에 개인정보를 자발적으로 기재하는 경우, 법정대리인의 요청이 있으면 관련 법령에 따라 조치할 수
          있습니다.
        </p>

        <h2>9. 문의처</h2>
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

        <h2>10. 방침 변경</h2>
        <p>
          본 방침은 법령, 서비스 구조, 광고 도입 여부, 개인정보 처리 현황의 변화에 따라 수정될 수 있으며,
          중요한 변경이 있는 경우 본 페이지를 통해 공지합니다.
        </p>
      </section>
    </div>
  );
}
