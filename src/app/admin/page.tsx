import type { Metadata } from "next";

import AdminClient from "@/components/AdminClient";

export const metadata: Metadata = {
  title: "BALANCE LAB 관리자",
  description: "주제를 쉽게 추가하는 밸런스게임 미니 관리자 페이지",
};

export default function AdminPage() {
  return <AdminClient />;
}
