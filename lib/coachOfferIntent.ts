const STORAGE_KEY = "gym_tracker_coach_offer_intent_v1";
const SESSION_OFFER_KEY_PREFIX = "gym_tracker_coach_session_offer_shown_v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type CoachOfferIntent = { createdAt: number };

export function saveCoachOfferIntent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ createdAt: Date.now() }));
  } catch {
    // Penawaran tetap opsional jika browser membatasi penyimpanan lokal.
  }
}

export function saveCoachOfferIntentFromUrl(query: URLSearchParams): boolean {
  if (query.get("offer") !== "coach") return false;
  saveCoachOfferIntent();
  return true;
}

export function hasCoachOfferIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const intent = JSON.parse(raw) as Partial<CoachOfferIntent>;
    const valid = typeof intent.createdAt === "number" &&
      Date.now() - intent.createdAt >= 0 &&
      Date.now() - intent.createdAt <= MAX_AGE_MS;
    if (valid) return true;
  } catch {
    // Intent yang rusak atau storage yang dibatasi cukup diabaikan.
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Browser mungkin membatasi akses storage.
  }
  return false;
}

export function consumeCoachOfferIntent(): boolean {
  const available = hasCoachOfferIntent();
  try {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Penawaran sudah diperiksa; kegagalan cleanup tidak menghalangi alur.
  }
  return available;
}

function sessionOfferKey(userId: string): string {
  return `${SESSION_OFFER_KEY_PREFIX}_${userId}`;
}

export function hasShownCoachOfferThisSession(userId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(sessionOfferKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function markCoachOfferShownThisSession(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(sessionOfferKey(userId), "1");
  } catch {
    // Component hanya dipasang sekali di AppShell; sessionStorage bersifat best effort.
  }
}

export function clearCoachOfferShownThisSession(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(sessionOfferKey(userId));
  } catch {
    // Penanda sesi hanya mengatur frekuensi tampilan penawaran.
  }
}
