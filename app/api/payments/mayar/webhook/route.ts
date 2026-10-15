import { NextResponse } from "next/server";
import { getCoachPaymentConfig } from "@/lib/coachPayments";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  if (!isRecord(payload) || !isRecord(payload.data)) {
    return NextResponse.json({ received: true });
  }

  const eventType = typeof payload.event === "string"
    ? payload.event
    : isRecord(payload.event)
      ? payload.event.received ?? payload.event.type
      : payload.type;
  // Mayar sends this probe from its dashboard's “Test URL” action. It is not
  // a payment and must be acknowledged even before payment secrets are set.
  if (typeof eventType === "string" && eventType.toLowerCase() === "testing") {
    return NextResponse.json({ received: true });
  }
  if (eventType !== "payment.received") return NextResponse.json({ received: true });

  const admin = getSupabaseAdmin();
  const { apiKey, apiBaseUrl } = getCoachPaymentConfig();
  if (!admin || !apiKey || !apiBaseUrl) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  const data = payload.data;
  const transactionId = typeof data.transactionId === "string"
    ? data.transactionId
    : typeof data.transaction_id === "string"
      ? data.transaction_id
      : typeof data.id === "string" ? data.id : null;
  const invoiceId = typeof data.invoiceId === "string"
    ? data.invoiceId
    : typeof data.invoice_id === "string"
      ? data.invoice_id
      : typeof data.paymentLinkId === "string" ? data.paymentLinkId : null;
  const extraData = isRecord(data.extraData) ? data.extraData : {};
  const orderId = typeof extraData.orderId === "string"
    ? extraData.orderId
    : typeof data.orderId === "string" ? data.orderId : null;

  // Mayar webhook versions differ in which identifiers they include. Resolve
  // against provider IDs and our own order ID, then verify the stored transaction.
  let order = null;
  for (const [column, value] of [
    ["provider_transaction_id", transactionId],
    ["provider_invoice_id", invoiceId],
    ["id", orderId],
  ] as const) {
    if (!value) continue;
    const { data: candidate, error } = await admin
      .from("coach_payment_orders")
      .select("id,user_id,provider_invoice_id,provider_transaction_id,amount_idr,status")
      .eq("status", "pending")
      .eq(column, value)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "order_lookup_failed" }, { status: 503 });
    if (candidate) {
      order = candidate;
      break;
    }
  }
  if (!order?.provider_invoice_id || !order.provider_transaction_id) return NextResponse.json({ received: true });

  // Webhook diperlakukan sebagai pemicu pemeriksaan saja. Hak akses hanya
  // diberikan jika API Mayar menyatakan transaksi lunas dan nilainya cocok.
  let transactionResponse: Response;
  try {
    transactionResponse = await fetch(`${apiBaseUrl}/transactions/${encodeURIComponent(order.provider_transaction_id)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    return NextResponse.json({ error: "invoice_verification_unavailable" }, { status: 503 });
  }
  if (!transactionResponse.ok) return NextResponse.json({ error: "transaction_verification_failed" }, { status: 503 });

  let transactionPayload: unknown;
  try {
    transactionPayload = await transactionResponse.json();
  } catch {
    return NextResponse.json({ error: "invalid_transaction_response" }, { status: 503 });
  }
  const transaction = isRecord(transactionPayload) && isRecord(transactionPayload.data) ? transactionPayload.data : null;
  if (!transaction || typeof transaction.status !== "string") {
    return NextResponse.json({ error: "invalid_transaction_response" }, { status: 503 });
  }
  if (transaction.status.toLowerCase() !== "paid") return NextResponse.json({ received: true });
  if (Number(transaction.amount) !== order.amount_idr) {
    return NextResponse.json({ error: "transaction_amount_mismatch" }, { status: 400 });
  }
  if (transaction.id !== order.provider_transaction_id) {
    return NextResponse.json({ error: "transaction_id_mismatch" }, { status: 400 });
  }
  const { error: activationError } = await admin.rpc("activate_coach_payment_order", {
    p_order_id: order.id,
    p_provider_customer_id: typeof transaction.customerId === "string"
      ? transaction.customerId
      : isRecord(transaction.customer) && typeof transaction.customer.id === "string"
        ? transaction.customer.id
        : null,
  });
  if (activationError) {
    console.error("[mayar-webhook] entitlement activation failed", {
      orderId: order.id,
      code: activationError.code,
      message: activationError.message,
    });
    return NextResponse.json({ error: "entitlement_activation_failed" }, { status: 503 });
  }

  return NextResponse.json({ received: true, activated: true });
}
