"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/workout/new", label: "Tambah Latihan" },
  { href: "/history", label: "Histori" },
  { href: "/progress", label: "Grafik" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-2xl items-center gap-1 overflow-x-auto px-4 py-3">
        <span className="mr-2 shrink-0 text-sm font-bold text-lime-400">
          GymProgress
        </span>
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-lime-400 font-semibold text-gray-950"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
