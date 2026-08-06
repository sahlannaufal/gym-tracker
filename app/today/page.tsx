import TodayPage from "@/components/TodayPage";

export default async function TodayRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialView = params.view === "rutin" ? "rutin" : "latihan";
  return <TodayPage initialView={initialView} />;
}
