"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Beranda",
    active: (pathname: string) => pathname === "/",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    href: "/today",
    label: "Hari Ini",
    active: (pathname: string) => pathname === "/today",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 9h18" />
      </svg>
    ),
  },
  {
    href: "/progress",
    label: "Progres",
    active: (pathname: string) => pathname.startsWith("/progress"),
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 20V10M10 20V4M16 20v-8M21 20H3" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-800 bg-gray-950/90 backdrop-blur">
      <div className="relative mx-auto grid w-full max-w-2xl grid-cols-5 items-center px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        <TabLink tab={tabs[0]} pathname={pathname} />
        <TabLink tab={tabs[1]} pathname={pathname} />

        <div className="relative flex justify-center">
          <Link
            href="/workout/new"
            aria-label="Tambah Latihan"
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-gray-950 shadow-lg shadow-lime-400/30 transition-transform hover:scale-105 active:scale-95"
          >
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        </div>

        <TabLink tab={tabs[2]} pathname={pathname} />
      </div>
    </nav>
  );
}

function TabLink({
  tab,
  pathname,
}: {
  tab: (typeof tabs)[number];
  pathname: string;
}) {
  const active = tab.active(pathname);
  return (
    <Link
      href={tab.href}
      className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors ${
        active ? "text-lime-400" : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {tab.icon}
      {tab.label}
    </Link>
  );
}
