import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { APP_HOST, APP_ORIGIN, MARKETING_HOST, MARKETING_ORIGIN } from "@/lib/site";

// Rute aplikasi yang hanya valid di gym.abadikan.com. Saat diakses dari
// domain marketing, di-301 ke aplikasi agar login & data tidak terpecah.
const APP_ROUTE_PREFIXES = [
  "/login",
  "/forgot-password",
  "/auth",
  "/today",
  "/progress",
  "/workout",
  "/account",
  "/history",
  "/routine",
  "/~offline",
];

// Rute marketing yang boleh hidup di domain marketing selain landing/blog.
const MARKETING_PATHS = new Set(["/aplikasi-tracking-gym", "/terms"]);

function normalizeHost(host: string): string {
  return host.replace(/:\d+$/, "").toLowerCase();
}

function isMarketingHost(hostname: string): boolean {
  return hostname === MARKETING_HOST || hostname === `www.${MARKETING_HOST}`;
}

// Di belakang Caddy, host asli tersedia lewat X-Forwarded-Host (dan Host).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const rawHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const hostname = normalizeHost(rawHost);

  if (isMarketingHost(hostname)) {
    // Landing berada di / pada domain marketing; /aplikasi-tracking-gym adalah
    // route implementasi yang di-rewrite agar address bar tetap abadikan.com/.
    if (pathname === "/" || pathname === "/aplikasi-tracking-gym") {
      const url = request.nextUrl.clone();
      url.pathname = "/aplikasi-tracking-gym";
      return NextResponse.rewrite(url);
    }
    // Rute aplikasi diarahkan ke gym.abadikan.com; aset/marketing path lain
    // (blog, terms, _next, icons, data, dist) dilayani lokal.
    if (APP_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return NextResponse.redirect(`${APP_ORIGIN}${pathname}${search}`, 301);
    }
    return NextResponse.next();
  }

  // gym.abadikan.com: konten marketing lama dipindah ke abadikan.com via 301
  // agar sinyal SEO berkumpul di satu canonical. Host lain (localhost, IP,
  // domain sementara) dibiarkan lewat agar development tidak terganggu.
  if (hostname === APP_HOST) {
    if (pathname === "/aplikasi-tracking-gym") {
      return NextResponse.redirect(MARKETING_ORIGIN, 301);
    }
    if (pathname === "/blog" || pathname.startsWith("/blog/") || pathname === "/terms") {
      return NextResponse.redirect(`${MARKETING_ORIGIN}${pathname}${search}`, 301);
    }
  }

  return NextResponse.next();
}