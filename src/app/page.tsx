import HomeClient from "@/components/HomeClient";
import { getKstDateKey } from "@/lib/kstDate";
import { getVisitorStats } from "@/lib/server/visitorsStore";

export default async function HomePage() {
  const initialVisitorStats = await getVisitorStats().catch(() => ({
    today: 0,
    total: 0,
    date: getKstDateKey(),
    mode: "file" as const,
  }));

  return <HomeClient initialVisitorStats={initialVisitorStats} />;
}
