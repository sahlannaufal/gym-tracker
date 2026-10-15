import { createClient, type User } from "@supabase/supabase-js";

export function getCoachPaymentConfig() {
  const amount = Number(process.env.COACH_PRICE_IDR);
  const apiKey = process.env.MAYAR_API_KEY;
  const apiBaseUrl = process.env.MAYAR_API_BASE_URL?.replace(/\/+$/, "");
  const validBaseUrl = apiBaseUrl === "https://api.mayar.id/hl/v2" || apiBaseUrl === "https://api.mayar.io/hl/v2";

  return {
    amount: Number.isSafeInteger(amount) && amount > 0 ? amount : null,
    apiKey: apiKey || null,
    apiBaseUrl: validBaseUrl ? apiBaseUrl : null,
  };
}

export async function getRequestUser(request: Request): Promise<User | null> {
  const accessToken = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!accessToken || !url || !anonKey) return null;

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.auth.getUser(accessToken);
  return error ? null : data.user;
}

export function formatMayarError(payload: unknown): string {
  if (typeof payload === "object" && payload !== null && "messages" in payload) {
    const messages = (payload as { messages?: unknown }).messages;
    if (typeof messages === "string") return messages;
  }
  return "Mayar API request failed";
}
