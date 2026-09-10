export type OAuthIntent = {
  provider: "google";
  action: "login" | "signup";
  startedAt: number;
};

const STORAGE_KEY = "gym_tracker_oauth_intent_v1";

export function saveOAuthIntent(intent: OAuthIntent): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
}

export function consumeOAuthIntent(): OAuthIntent | null {
  if (typeof window === "undefined") return null;

  const value = window.sessionStorage.getItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
  if (!value) return null;

  try {
    const intent = JSON.parse(value) as Partial<OAuthIntent>;
    if (
      intent.provider === "google" &&
      (intent.action === "login" || intent.action === "signup") &&
      typeof intent.startedAt === "number"
    ) {
      return intent as OAuthIntent;
    }
  } catch {
    // Data session yang tidak valid cukup diabaikan.
  }
  return null;
}
