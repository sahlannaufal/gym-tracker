"use client";

import mixpanel from "mixpanel-browser";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | string[] | null | undefined
>;

type AnalyticsUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const isProduction =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_APP_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

let initialized = false;

function cleanProperties(properties: AnalyticsProperties): AnalyticsProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

export function initMixpanel(): void {
  if (!isProduction || !token || initialized) return;

  try {
    mixpanel.init(token, {
      debug: false,
      track_pageview: false,
      persistence: "localStorage",
    });
    initialized = true;
  } catch {
    // Analytics tidak boleh mengganggu fungsi utama aplikasi.
  }
}

export function trackEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
): void {
  const safeProperties = cleanProperties(properties);

  if (!isProduction) {
    if (isDevelopment) console.debug("[Mixpanel preview]", eventName, safeProperties);
    return;
  }
  if (!token || !initialized) return;

  try {
    mixpanel.track(eventName, safeProperties);
  } catch {
    // Analytics tidak boleh mengganggu fungsi utama aplikasi.
  }
}

export function identifyUser(user: AnalyticsUser): void {
  if (!isProduction || !token || !initialized) return;

  try {
    mixpanel.identify(String(user.id));
  } catch {
    // Analytics tidak boleh mengganggu autentikasi.
  }
}

export function setUserProperties(properties: AnalyticsProperties): void {
  if (!isProduction || !token || !initialized) return;

  try {
    mixpanel.people.set(cleanProperties(properties));
  } catch {
    // Analytics tidak boleh mengganggu autentikasi.
  }
}

export function identifyAndSetUser(user: AnalyticsUser): void {
  initMixpanel();
  identifyUser(user);

  const metadata = user.user_metadata ?? {};
  const appMetadata = user.app_metadata ?? {};
  const name = metadata.full_name ?? metadata.name;
  const role = appMetadata.role ?? metadata.role;

  setUserProperties({
    $name: typeof name === "string" ? name : undefined,
    $email: user.email ?? undefined,
    role: typeof role === "string" ? role : undefined,
  });
}

export function resetMixpanel(): void {
  if (!isProduction || !token || !initialized) return;

  try {
    mixpanel.reset();
  } catch {
    // Analytics tidak boleh mengganggu logout.
  }
}

export function isMixpanelEnabled(): boolean {
  return isProduction && Boolean(token);
}
