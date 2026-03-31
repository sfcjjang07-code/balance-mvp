export const siteConfig = {
  siteName: "BALANCE LAB",
  legalServiceName: "BALANCE LAB",
  operatorName: "운영자 정보 입력 필요",
  contactEmail: "contact@example.com",
  contactResponseHours: "평일 기준 3영업일 이내 회신",
  mailingAddress: "운영 주소 입력 필요",
  businessRegistrationNumber: "",
  effectiveDate: "2026-03-30",
  description: "일반 취향형 밸런스게임 콘텐츠 서비스",
  supportNotice:
    "배포 전 실제 운영자명, 문의 이메일, 주소를 src/config/site.ts에서 실제 정보로 바꾸는 것을 권장합니다.",
} as const;

export function hasOperatorPlaceholders() {
  return (
    siteConfig.operatorName.includes("입력 필요") ||
    siteConfig.contactEmail === "contact@example.com" ||
    siteConfig.mailingAddress.includes("입력 필요")
  );
}
