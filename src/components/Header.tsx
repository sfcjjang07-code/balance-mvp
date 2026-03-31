"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

export default function Header() {
  const pathname = usePathname();

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") {
      return;
    }

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="site-logo" aria-label="홈으로 이동" onClick={handleHomeClick}>
          <span className="site-logo__badge">B</span>
          <span className="site-logo__text-wrap">
            <span className="site-logo__title">BALANCE LAB</span>
            <span className="site-logo__sub">심플한 밸런스게임 아카이브</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="상단 메뉴">
          <Link href="/" className="site-nav__link" onClick={handleHomeClick}>
            홈
          </Link>
          <Link href="/about" className="site-nav__link site-nav__link--ghost">
            설명
          </Link>
        </nav>
      </div>
    </header>
  );
}
