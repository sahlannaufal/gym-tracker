import { NextResponse } from "next/server";
import { formatMayarError, getCoachPaymentConfig, getRequestUser } from "@/lib/coachPayments";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function profileName(user: { user_metadata?: Record<string, unknown> }): string {
  const metadata = user.user_metadata ?? {};
  const name = metadata.full_name ?? metadata.name;
  return typeof name === "string" ? name.trim() : "";
}

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  const orderId = new URL(request.url).searchParams.get("orderId");
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "service_unavailable" }, { status: 503 });

  if (orderId) {
    const { data: order, error } = await admin
      .from("coach_payment_orders")
      .select("id,status,checkout_url,expires_at,paid_at,provider_transaction_id,amount_idr")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "order_unavailable" }, { status: 503 });
    if (!order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });
    let status = order.status;
    if (status === "pending" && order.expires_at && Date.parse(order.expires_at) <= Date.now()) {
      status = "expired";
      await admin.from("coach_payment_orders").update({ status, updated_at: new Date().toISOString() }).eq("id", order.id);
    } else if (status === "pending" && order.provider_transaction_id) {
      const { apiKey, apiBaseUrl } = getCoachPaymentConfig();
      if (apiKey && apiBaseUrl) {
        try {
          const response = await fetch(`${apiBaseUrl}/transactions/${encodeURIComponent(order.provider_transaction_id)}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            cache: "no-store",
            signal: AbortSignal.timeout(12_000),
          });
          const payload: unknown = response.ok ? await response.json() : null;
          const transaction = isRecord(payload) && isRecord(payload.data) ? payload.data : null;
          const extraData = transaction && isRecord(transaction.extraData) ? transaction.extraData : null;
          if (
            typeof transaction?.status === "string" && transaction.status.toLowerCase() === "paid" &&
            transaction.id === order.provider_transaction_id &&
            Number(transaction.amount) === order.amount_idr &&
            extraData?.orderId === order.id
          ) {
            const { error: activationError } = await admin.rpc("activate_coach_payment_order", {
              p_order_id: order.id,
              p_provider_customer_id: typeof transaction.customerId === "string" ? transaction.customerId : null,
            });
            if (activationError) return NextResponse.json({ error: "entitlement_activation_failed" }, { status: 503 });
            status = "paid";
          }
        } catch {
          // A delayed provider response should not prevent the pending state from being shown.
        }
      }
    }
    return NextResponse.json({
      order: {
        id: order.id,
        status,
        checkout_url: order.checkout_url,
        expires_at: order.expires_at,
        paid_at: order.paid_at,
      },
    }, { headers: { "Cache-Control": "private, no-store" } });
  }

  const { amount, apiKey, apiBaseUrl } = getCoachPaymentConfig();
  return NextResponse.json({
    available: Boolean(amount && apiKey && apiBaseUrl),
    amount,
    customerName: profileName(user),
    customerEmail: user.email ?? "",
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  const { amount, apiKey, apiBaseUrl } = getCoachPaymentConfig();
  const admin = getSupabaseAdmin();
  if (!amount || !apiKey || !apiBaseUrl || !admin) {
    return NextResponse.json({ error: "checkout_unavailable" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!isRecord(body) || typeof body.name !== "string" || typeof body.mobile !== "string") {
    return NextResponse.json({ error: "invalid_customer" }, { status: 400 });
  }
  const name = body.name.trim().slice(0, 120);
  const mobile = body.mobile.replace(/[\s()-]/g, "").slice(0, 24);
  const email = user.email?.trim();
  if (name.length < 2 || !/^\+?[0-9]{8,20}$/.test(mobile) || !email) {
    return NextResponse.json({ error: "invalid_customer" }, { status: 400 });
  }

  const { data: pendingOrder, error: pendingError } = await admin
    .from("coach_payment_orders")
    .select("id,checkout_url,expires_at")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (pendingError) return NextResponse.json({ error: "order_lookup_failed" }, { status: 503 });
  if (pendingOrder?.checkout_url && pendingOrder.expires_at && Date.parse(pendingOrder.expires_at) > Date.now()) {
    return NextResponse.json({ orderId: pendingOrder.id, checkoutUrl: pendingOrder.checkout_url, expiresAt: pendingOrder.expires_at });
  }
  if (pendingOrder) {
    if (!pendingOrder.expires_at || Date.parse(pendingOrder.expires_at) > Date.now()) {
      return NextResponse.json({ error: "checkout_in_progress" }, { status: 409 });
    }
    await admin.from("coach_payment_orders").update({ status: "expired", updated_at: new Date().toISOString() }).eq("id", pendingOrder.id);
  }

  const { data: order, error: insertError } = await admin
    .from("coach_payment_orders")
    .insert({ user_id: user.id, amount_idr: amount })
    .select("id")
    .single();
  if (insertError || !order) return NextResponse.json({ error: "order_create_failed" }, { status: 503 });

  const invoiceExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
  let invoicePayload: unknown;
  try {
    const response = await fetch(`${apiBaseUrl}/invoices/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        mobile,
        redirectUrl: new URL("/account?coach_payment=return", process.env.APP_BASE_URL ?? new URL(request.url).origin).toString(),
        description: "Coach Personal — akses selamanya",
        expiredAt: invoiceExpiry.toISOString(),
        items: [{ quantity: 1, rate: amount, description: "Akses Coach Personal selamanya" }],
        extraData: { orderId: order.id },
      }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    invoicePayload = await response.json();
    if (!response.ok) throw new Error(formatMayarError(invoicePayload));
  } catch {
    await admin.from("coach_payment_orders").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", order.id);
    return NextResponse.json({ error: "invoice_create_failed" }, { status: 502 });
  }

  const invoiceData = isRecord(invoicePayload) && isRecord(invoicePayload.data) ? invoicePayload.data : null;
  const invoiceId = invoiceData?.id;
  const transactionId = invoiceData?.transactionId;
  const checkoutUrl = invoiceData?.link ?? invoiceData?.paymentUrl;
  let parsedCheckoutUrl: URL | null = null;
  if (typeof checkoutUrl === "string") {
    try { parsedCheckoutUrl = new URL(checkoutUrl); } catch { parsedCheckoutUrl = null; }
  }
  if (
    !invoiceData || typeof invoiceId !== "string" || typeof transactionId !== "string" ||
    !parsedCheckoutUrl || parsedCheckoutUrl.protocol !== "https:"
  ) {
    await admin.from("coach_payment_orders").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", order.id);
    return NextResponse.json({ error: "invalid_invoice_response" }, { status: 502 });
  }

  const expiresAtMs = Number(invoiceData.expiredAt);
  const expiresAt = Number.isFinite(expiresAtMs) && expiresAtMs > 0
    ? new Date(expiresAtMs).toISOString()
    : invoiceExpiry.toISOString();
  const { error: updateError } = await admin
    .from("coach_payment_orders")
    .update({
      provider_invoice_id: invoiceId,
      provider_transaction_id: transactionId,
      checkout_url: parsedCheckoutUrl.toString(),
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);
  if (updateError) return NextResponse.json({ error: "order_save_failed" }, { status: 503 });

  return NextResponse.json({
    orderId: order.id,
    checkoutUrl: parsedCheckoutUrl.toString(),
    expiresAt,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
