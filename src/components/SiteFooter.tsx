import Link from "next/link";

import { siteConfig } from "@/config/site";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div className="site-footer__brand">
          <strong className="site-footer__title">{siteConfig.siteName}</strong>
          <p className="site-footer__text">
            일반 취향형 밸런스게임 콘텐츠를 제공하는 비회원형 서비스입니다. 특정 인물·단체·제품과의
            공식 제휴를 의미하지 않으며, 권리 침해 신고는 운영 고지의 문의 채널로 접수할 수 있습니다.
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="하단 법적 고지 메뉴">
          <Link href="/privacy" className="site-footer__link">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="site-footer__link">
            이용약관
          </Link>
          <Link href="/notice" className="site-footer__link">
            운영 고지
          </Link>
        </nav>

        <div className="site-footer__meta">
          <span>© {currentYear} {siteConfig.siteName}</span>
          <span>{siteConfig.description}</span>
        </div>
      </div>
    </footer>
  );
}
