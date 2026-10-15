"use client";

import { useEffect, useRef, useState } from "react";
import CoachIcon from "./CoachIcon";
import { supabase } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

type CoachPurchaseFlowProps = {
  open: boolean;
  onClose: () => void;
  onActivated?: () => void;
  returnOrderId?: string | null;
  placement?: "dashboard" | "profile";
};

type PurchaseStep = "offer" | "checkout";

function CheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0 text-lime-300"><path d="m5 10 3.2 3.2L15.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

type PurchaseConfig = {
  available: boolean;
  amount: number | null;
  customerName: string;
  customerEmail: string;
  pendingOrder?: PurchaseOrder | null;
};
type PurchaseOrder = { id: string; status: "pending" | "paid" | "failed" | "expired"; checkout_url: string | null };

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export default function CoachPurchaseFlow({ open, onClose, onActivated, returnOrderId = null, placement = "profile" }: CoachPurchaseFlowProps) {
  const [step, setStep] = useState<PurchaseStep>("offer");
  const [config, setConfig] = useState<PurchaseConfig | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [orderId, setOrderId] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [orderStatus, setOrderStatus] = useState<PurchaseOrder["status"] | "" >("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const completedOrders = useRef(new Set<string>());

  function trackPurchaseCompleted(completedOrderId: string) {
    if (!completedOrderId || completedOrders.current.has(completedOrderId)) return;
    completedOrders.current.add(completedOrderId);
    trackEvent("Coach Purchase Completed", {
      provider: "mayar",
      access_type: "lifetime",
      amount_idr: config?.amount ?? undefined,
      currency: "IDR",
    });
  }

  useEffect(() => {
    if (!open) return;
    if (returnOrderId) {
      trackEvent("Coach Checkout Resumed", { placement, resume_source: "payment_return" });
    } else {
      trackEvent("Coach Purchase Offer Viewed", { placement });
    }
    setStep(returnOrderId ? "checkout" : "offer");
    setMessage("");
    setStatusMessage(returnOrderId ? "Memeriksa pembayaran…" : "");
    setOrderId(returnOrderId ?? "");
    setCheckoutUrl("");
    setOrderStatus(returnOrderId ? "pending" : "");
    let active = true;
    async function loadConfig() {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch("/api/coach/checkout", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      if (!response.ok) return;
      const result = await response.json() as PurchaseConfig;
      if (active) {
        setConfig(result);
        setName((currentName) => currentName || result.customerName);
        if (result.pendingOrder) {
          const pendingOrder = result.pendingOrder;
          if (pendingOrder.id !== returnOrderId) {
            trackEvent("Coach Checkout Resumed", {
              placement,
              resume_source: "app_reopen",
              payment_status: pendingOrder.status,
            });
          }
          setStep("checkout");
          setOrderId(pendingOrder.id);
          setCheckoutUrl(pendingOrder.checkout_url ?? "");
          setOrderStatus(pendingOrder.status);
          if (pendingOrder.status === "paid") {
            trackPurchaseCompleted(pendingOrder.id);
            setStatusMessage("Pembayaran berhasil. Coach Personal aktif selamanya.");
            onActivated?.();
          } else if (pendingOrder.status === "pending") {
            setStatusMessage("Pesanan sebelumnya ditemukan. Lanjutkan pembayaran atau periksa statusnya.");
          }
        }
      }
    }
    void loadConfig();
    return () => { active = false; };
  }, [open, returnOrderId, onActivated, placement]);

  async function createInvoice() {
    if (!supabase || !config?.available) return;
    setBusy(true);
    setMessage("");
    setStatusMessage("");
    trackEvent("Coach Checkout Submitted", { placement, provider: "mayar" });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
      const response = await fetch("/api/coach/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name, mobile }),
      });
      const result = await response.json() as { error?: string; orderId?: string; checkoutUrl?: string };
      if (!response.ok || !result.orderId || !result.checkoutUrl) {
        throw new Error(result.error === "invalid_customer" ? "Periksa nama dan nomor ponsel." : "Invoice belum dapat dibuat. Coba lagi.");
      }
      setOrderId(result.orderId);
      setCheckoutUrl(result.checkoutUrl);
      setOrderStatus("pending");
      setStatusMessage("Mengalihkan ke halaman pembayaran Mayar…");
      trackEvent("Coach Invoice Created", {
        provider: "mayar",
        access_type: "lifetime",
        amount_idr: config.amount ?? undefined,
        currency: "IDR",
      });
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      trackEvent("Coach Invoice Creation Failed", {
        failure_reason: error instanceof Error && error.message.includes("Periksa nama") ? "invalid_customer" : "request_failed",
      });
      setMessage(error instanceof Error ? error.message : "Invoice belum dapat dibuat. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function checkPaymentStatus() {
    if (!supabase || !orderId) return;
    setBusy(true);
    setMessage("");
    setStatusMessage("Memeriksa status pembayaran…");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
      const response = await fetch(`/api/coach/checkout?orderId=${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const result = await response.json() as { order?: PurchaseOrder };
      if (!response.ok || !result.order) throw new Error("Status pembayaran belum dapat diperiksa.");
      setOrderStatus(result.order.status);
      setCheckoutUrl(result.order.checkout_url ?? "");
      trackEvent("Coach Payment Status Checked", {
        provider: "mayar",
        payment_status: result.order.status,
        check_source: "manual",
      });
      if (result.order.status === "paid") {
        trackPurchaseCompleted(result.order.id);
        setStatusMessage("Pembayaran berhasil. Coach Personal aktif selamanya.");
        onActivated?.();
      } else if (result.order.status === "pending") {
        setStatusMessage("Pembayaran masih menunggu. Jika sudah membayar, tunggu sebentar lalu periksa kembali.");
      } else {
        setStatusMessage("");
      }
      if (result.order.status === "expired" || result.order.status === "failed") {
        setMessage("Invoice tidak lagi aktif. Tutup lalu mulai transaksi baru.");
      }
    } catch (error) {
      trackEvent("Coach Payment Status Checked", {
        provider: "mayar",
        payment_status: "unavailable",
        check_source: "manual",
      });
      setStatusMessage("");
      setMessage(error instanceof Error ? error.message : "Status pembayaran belum dapat diperiksa.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const client = supabase;
    const orderIdToCheck = returnOrderId;
    if (!open || !orderIdToCheck || !client) return;
    let active = true;
    async function loadReturnedPayment() {
      setBusy(true);
      try {
        const { data: { session } } = await client!.auth.getSession();
        if (!session?.access_token) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
        // The customer may return before Mayar's transaction API has updated
        // or before its webhook has arrived. Recheck briefly so the common
        // successful-payment path activates without asking for a manual click.
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const response = await fetch(`/api/coach/checkout?orderId=${encodeURIComponent(orderIdToCheck!)}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
            cache: "no-store",
          });
          const result = await response.json() as { order?: PurchaseOrder };
          if (!response.ok || !result.order) throw new Error("Status pembayaran belum dapat diperiksa.");
          if (!active) return;
          setOrderStatus(result.order.status);
          setCheckoutUrl(result.order.checkout_url ?? "");
          if (result.order.status === "paid") {
            trackEvent("Coach Payment Status Checked", {
              provider: "mayar",
              payment_status: "paid",
              check_source: "payment_return",
            });
            trackPurchaseCompleted(result.order.id);
            setStatusMessage("Pembayaran berhasil. Coach Personal aktif selamanya.");
            onActivated?.();
            return;
          }
          if (result.order.status !== "pending") {
            trackEvent("Coach Payment Status Checked", {
              provider: "mayar",
              payment_status: result.order.status,
              check_source: "payment_return",
            });
            setStatusMessage("");
            setMessage("Invoice tidak lagi aktif. Tutup lalu mulai transaksi baru.");
            return;
          }
          setStatusMessage(attempt < 4
            ? "Pembayaran diterima. Sedang menunggu konfirmasi dari Mayar…"
            : "Pembayaran masih menunggu. Jika sudah membayar, coba periksa status kembali.");
          if (attempt === 4) {
            trackEvent("Coach Payment Status Checked", {
              provider: "mayar",
              payment_status: "pending",
              check_source: "payment_return",
            });
          }
          if (attempt < 4) await new Promise((resolve) => window.setTimeout(resolve, 3000));
        }
      } catch (error) {
        if (active) {
          trackEvent("Coach Payment Status Checked", {
            provider: "mayar",
            payment_status: "unavailable",
            check_source: "payment_return",
          });
          setStatusMessage("");
          setMessage(error instanceof Error ? error.message : "Status pembayaran belum dapat diperiksa.");
        }
      } finally {
        if (active) setBusy(false);
      }
    }
    void loadReturnedPayment();
    return () => { active = false; };
  }, [open, returnOrderId, onActivated]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-gray-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="coach-purchase-title">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Tutup" />
      <section className="relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-gray-800 bg-gray-950 shadow-2xl shadow-black/40 sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-lime-300/20 bg-lime-300/10 text-lime-300"><CoachIcon id="coach" className="h-5 w-5" /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-300">Abadikan Coach</p>
              <p className="text-xs text-gray-500">Akses Coach Personal</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-gray-400 transition hover:bg-gray-800 hover:text-white" aria-label="Tutup dialog">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>

        {step === "offer" ? (
          <div className="p-5 sm:p-6">
            <p className="text-xs font-medium text-lime-300">PROGRAM LATIHAN UNTUK PEMULA</p>
            <h2 id="coach-purchase-title" className="mt-2 max-w-sm text-2xl font-bold leading-tight text-white sm:text-[28px]">Mulai latihan dengan program yang terarah.</h2>
            <div className="mt-6 rounded-2xl border border-lime-300/20 bg-gradient-to-br from-lime-300/10 to-gray-900 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm font-semibold text-white">Coach Personal</p><p className="mt-1 text-sm text-gray-400">Akses selamanya</p></div>
                <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-2.5 py-1 text-[11px] font-semibold text-lime-200">Lifetime</span>
              </div>
              <p className="mt-5 text-sm font-medium text-gray-300">{config?.amount ? formatRupiah(config.amount) : "Harga belum dikonfigurasi"}</p>
            </div>

            <ul className="mt-5 space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-200"><CheckIcon />Program berdasarkan tujuan dan pengalaman latihan</li>
              <li className="flex items-center gap-3 text-sm text-gray-200"><CheckIcon />Pilihan gerakan menyesuaikan alat yang tersedia</li>
              <li className="flex items-center gap-3 text-sm text-gray-200"><CheckIcon />Perbarui program sesuai kebutuhan</li>
            </ul>

          <button type="button" onClick={() => { trackEvent("Coach Checkout Details Viewed", { placement }); setStep("checkout"); }} className="mt-7 w-full rounded-xl bg-lime-300 px-4 py-3.5 text-sm font-bold text-gray-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:ring-offset-2 focus:ring-offset-gray-950">Lihat ringkasan pesanan</button>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {!orderId && <button type="button" onClick={() => setStep("offer")} className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-white">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Kembali
            </button>}
            <h2 id="coach-purchase-title" className="mt-4 text-2xl font-bold text-white">
              {orderId ? (orderStatus === "paid" ? "Pembayaran berhasil" : "Status pembayaran") : "Ringkasan pesanan"}
            </h2>

            <div className="mt-6 divide-y divide-gray-800 rounded-2xl border border-gray-800 bg-gray-900/70 px-4">
              <div className="flex items-center justify-between gap-4 py-4">
                <div><p className="text-sm font-semibold text-white">Coach Personal</p><p className="mt-1 text-xs text-gray-500">Akses selamanya</p></div>
                <span className="text-xs font-semibold text-lime-300">Digital</span>
              </div>
              <div className="flex items-center justify-between py-4 text-sm"><span className="text-gray-400">Total pembayaran</span><span className="font-semibold text-white">{config?.amount ? formatRupiah(config.amount) : "Belum tersedia"}</span></div>
            </div>

            {!orderId ? (
              <div className="mt-5 space-y-4">
                <label className="block text-sm text-gray-300">Nama lengkap
                  <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={120} className="mt-1.5 w-full rounded-xl border border-gray-700 bg-gray-900 px-3.5 py-3 text-white outline-none focus:border-lime-300" />
                </label>
                <label className="block text-sm text-gray-300">Nomor ponsel
                  <input value={mobile} onChange={(event) => setMobile(event.target.value)} type="tel" autoComplete="tel" inputMode="tel" placeholder="08xxxxxxxxxx" maxLength={24} className="mt-1.5 w-full rounded-xl border border-gray-700 bg-gray-900 px-3.5 py-3 text-white outline-none focus:border-lime-300" />
                </label>
              </div>
            ) : (
              <div className="mt-5 space-y-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                <p className={`text-sm font-semibold ${orderStatus === "paid" ? "text-emerald-300" : orderStatus === "pending" ? "text-amber-200" : "text-gray-300"}`}>
                  {orderStatus === "paid" ? "Pembayaran terverifikasi. Coach aktif selamanya." : `Status: ${orderStatus === "pending" ? "Menunggu pembayaran" : orderStatus}`}
                </p>
                {statusMessage && orderStatus !== "paid" && <p role="status" className="text-sm leading-5 text-gray-300">{statusMessage}</p>}
                {orderStatus === "pending" && checkoutUrl && <a href={checkoutUrl} className="block w-full rounded-lg bg-lime-300 px-4 py-3 text-center text-sm font-bold text-gray-950 transition hover:bg-lime-200">Buka halaman pembayaran lagi</a>}
                {orderStatus !== "paid" && <button type="button" onClick={() => void checkPaymentStatus()} disabled={busy} className="w-full rounded-lg border border-gray-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Memeriksa…" : "Periksa status pembayaran"}</button>}
                {(orderStatus === "expired" || orderStatus === "failed") && <button type="button" onClick={() => { setOrderId(""); setCheckoutUrl(""); setOrderStatus(""); setMessage(""); setStatusMessage(""); }} className="w-full rounded-lg bg-lime-300 px-4 py-3 text-sm font-bold text-gray-950">Buat invoice baru</button>}
              </div>
            )}

            {orderStatus !== "paid" && <div className="mt-4 flex gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-3.5">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"><path d="M10 2.5 3.5 5v4.7c0 3.7 2.6 6.2 6.5 7.8 3.9-1.6 6.5-4.1 6.5-7.8V5L10 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="m7.3 9.8 1.8 1.8 3.7-3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <p className="text-xs leading-5 text-gray-400">Akses aktif setelah pembayaran terverifikasi.</p>
            </div>}

            {!orderId && <button type="button" onClick={() => void createInvoice()} disabled={busy || !config?.available || name.trim().length < 2 || mobile.trim().length < 8} className="mt-6 w-full rounded-xl bg-lime-300 px-4 py-3.5 text-sm font-bold text-gray-950 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500">{busy ? "Menyiapkan pembayaran…" : "Lanjutkan ke pembayaran"}</button>}
            {message && <p role="alert" className="mt-3 text-center text-sm text-rose-300">{message}</p>}
            {!config?.available && !orderId && <p className="mt-3 text-center text-xs text-gray-500">Checkout belum dikonfigurasi.</p>}
            {orderStatus === "paid" && <button type="button" onClick={onClose} className="mt-4 w-full rounded-xl bg-lime-300 px-4 py-3.5 text-sm font-bold text-gray-950">Mulai gunakan Coach</button>}
          </div>
        )}
      </section>
    </div>
  );
}
