import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import { useCart } from "../../features/cart/CartContext";
import {
  verifyCheckoutSession,
  type CheckoutVerification,
} from "../../features/checkout/checkoutService";

type PageState =
  | { kind: "loading" }
  | { kind: "processing"; verification: CheckoutVerification }
  | { kind: "paid"; verification: CheckoutVerification }
  | { kind: "error"; message: string };

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, loading: authLoading, refreshAccountData } = useAuth();
  const { refreshCart } = useCart();
  const refreshAccountRef = useRef(refreshAccountData);
  const refreshCartRef = useRef(refreshCart);
  const [pageState, setPageState] = useState<PageState>({ kind: "loading" });

  useEffect(() => {
    refreshAccountRef.current = refreshAccountData;
    refreshCartRef.current = refreshCart;
  }, [refreshAccountData, refreshCart]);

  useEffect(() => {
    if (authLoading || !user || !sessionId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function checkPayment() {
      try {
        const verification = await verifyCheckoutSession(sessionId as string);
        if (cancelled) return;

        if (verification.status === "paid") {
          setPageState({ kind: "paid", verification });
          await Promise.allSettled([
            refreshCartRef.current(),
            refreshAccountRef.current(),
          ]);
          return;
        }

        setPageState({ kind: "processing", verification });
        attempts += 1;
        if (attempts < 6) timer = setTimeout(checkPayment, 2000);
      } catch (error) {
        if (!cancelled) {
          setPageState({
            kind: "error",
            message:
              error instanceof Error
                ? error.message
                : "We could not verify this payment.",
          });
        }
      }
    }

    void checkPayment();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [authLoading, sessionId, user]);

  if (authLoading) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f5f1ea] px-5 py-20">
        <RefreshCw className="animate-spin text-[#ef4d11]" size={36} />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f5f1ea] px-5 py-20">
        <section className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto text-[#ef4d11]" size={40} />
          <h1 className="mt-5 text-3xl font-black">Sign in to view this order</h1>
          <p className="mt-3 text-black/55">
            Payment details are only shown to the customer who placed the order.
          </p>
          <Link to="/login" className="mt-7 inline-flex rounded-full bg-black px-6 py-3 font-extrabold text-white">
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  if (!sessionId) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f5f1ea] px-5 py-20">
        <section className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-black">Checkout reference missing</h1>
          <p className="mt-3 text-black/55">Return to your cart to start a secure checkout.</p>
          <Link to="/cart" className="mt-7 inline-flex rounded-full bg-black px-6 py-3 font-extrabold text-white">Return to cart</Link>
        </section>
      </main>
    );
  }

  const isPaid = pageState.kind === "paid";
  const isProcessing = pageState.kind === "loading" || pageState.kind === "processing";
  const verification =
    pageState.kind === "paid" || pageState.kind === "processing"
      ? pageState.verification
      : null;

  return (
    <main className="grid min-h-[70vh] place-items-center bg-[#f5f1ea] px-5 py-20 sm:px-8">
      <section className="w-full max-w-2xl rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-sm sm:p-12">
        <span className={`mx-auto grid size-20 place-items-center rounded-full ${isPaid ? "bg-emerald-100 text-emerald-700" : isProcessing ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
          {isPaid ? <Check size={38} strokeWidth={3} /> : isProcessing ? <Clock3 size={34} /> : <ShieldCheck size={34} />}
        </span>
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8440d]">
          Stripe sandbox
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">
          {isPaid ? "Payment confirmed" : isProcessing ? "Confirming your payment" : "Verification needs attention"}
        </h1>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-black/55">
          {isPaid
            ? "Your order is safely recorded and your cart has been cleared. We’ll contact you about the artwork proof next."
            : isProcessing
              ? "Stripe has returned you to PAPR. We’re waiting for the signed webhook before marking the order as paid."
              : pageState.kind === "error"
                ? pageState.message
                : "We could not verify this payment."}
        </p>

        {verification && (
          <dl className="mx-auto mt-8 max-w-md rounded-2xl bg-[#f7f3ec] p-5 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-black/50">Order reference</dt>
              <dd className="font-extrabold">{verification.orderId.slice(0, 8).toUpperCase()}</dd>
            </div>
            <div className="mt-3 flex justify-between gap-4">
              <dt className="text-black/50">Total</dt>
              <dd className="font-extrabold">{formatMoney(verification.totalCents)}</dd>
            </div>
          </dl>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/account" className="rounded-full bg-black px-6 py-3.5 font-extrabold text-white transition hover:bg-[#ef4d11]">
            Go to my account
          </Link>
          <Link to="/products" className="rounded-full border border-black/15 px-6 py-3.5 font-extrabold transition hover:border-[#ef4d11] hover:text-[#d8440d]">
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

export default CheckoutSuccessPage;
