import BlogAdSense from "@/components/BlogAdSense";
import { MarketingSiteFooter, MarketingSiteHeader } from "@/components/MarketingSiteChrome";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-site min-h-screen bg-gray-950 text-gray-100">
      <BlogAdSense />
      <MarketingSiteHeader active="blog" />
      <main>{children}</main>
      <MarketingSiteFooter />
    </div>
  );
}
