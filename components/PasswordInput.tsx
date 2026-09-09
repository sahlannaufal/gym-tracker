"use client";

import { useId, useState, type ReactNode } from "react";

const inputClass =
  "w-full rounded-xl border border-gray-700 bg-gray-900 py-2.5 pl-4 pr-12 text-gray-100 " +
  "placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

export default function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  minLength = 6,
  action,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  action?: ReactNode;
}) {
  const inputId = useId();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm font-medium text-gray-300">
        <label htmlFor={inputId}>{label}</label>
        {action}
      </div>
      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="••••••••"
          required
          minLength={minLength}
          autoComplete={autoComplete}
          className={`${inputClass} block`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`}
          aria-pressed={showPassword}
          className="absolute right-0 top-1/2 z-10 flex h-full w-12 -translate-y-1/2 items-center justify-center rounded-r-xl text-gray-500 hover:text-lime-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-400"
        >
          {showPassword ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m3 3 18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 4 10 8a12.7 12.7 0 0 1-2.2 4.2" />
              <path d="M6.6 6.6A12.4 12.4 0 0 0 2 12c1 4 5 8 10 8a10.7 10.7 0 0 0 5.4-1.5" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
