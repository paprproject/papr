import { supabase } from "../../lib/supabase";

export type DeliveryMethod = "standard" | "priority";

export type CheckoutSessionRequest = {
  cartItemIds: string[];
  savedAddressId: string;
  contactEmail: string;
  deliveryMethod: DeliveryMethod;
};

export type CheckoutSession = {
  checkoutUrl: string;
};

export type CheckoutVerification = {
  orderId: string;
  status:
    | "pending_payment"
    | "paid"
    | "payment_failed"
    | "cancelled"
    | "refunded";
  paymentStatus: "paid" | "unpaid" | "no_payment_required";
  currency: "sgd";
  totalCents: number;
};

export const PAYMENT_GATEWAY_READY =
  import.meta.env.VITE_STRIPE_SANDBOX_ENABLED === "true";

async function getFunctionErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") return fallback;
  const context = "context" in error ? error.context : null;

  if (context instanceof Response) {
    try {
      const payload = (await context.clone().json()) as { error?: unknown };
      if (typeof payload.error === "string") return payload.error;
    } catch {
      // Fall back to the SDK message when the response is not JSON.
    }
  }

  return "message" in error && typeof error.message === "string"
    ? error.message
    : fallback;
}

export async function createCheckoutSession(
  request: CheckoutSessionRequest,
): Promise<CheckoutSession> {
  if (!PAYMENT_GATEWAY_READY) {
    throw new Error("Stripe sandbox checkout is not enabled yet.");
  }

  const { data, error } = await supabase.functions.invoke<CheckoutSession>(
    "create-checkout-session",
    { body: request },
  );

  if (error) {
    throw new Error(
      await getFunctionErrorMessage(
        error,
        "Secure payment could not be started. Please try again.",
      ),
    );
  }
  if (!data?.checkoutUrl) {
    throw new Error("Stripe did not return a secure payment link.");
  }

  const checkoutUrl = new URL(data.checkoutUrl);
  if (
    checkoutUrl.protocol !== "https:" ||
    (checkoutUrl.hostname !== "checkout.stripe.com" &&
      !checkoutUrl.hostname.endsWith(".checkout.stripe.com"))
  ) {
    throw new Error("The payment provider returned an invalid checkout link.");
  }

  return { checkoutUrl: checkoutUrl.toString() };
}

export async function verifyCheckoutSession(sessionId: string) {
  const { data, error } = await supabase.functions.invoke<CheckoutVerification>(
    "verify-checkout-session",
    { body: { sessionId } },
  );

  if (error) {
    throw new Error(
      await getFunctionErrorMessage(
        error,
        "We could not verify this payment. Please contact us before paying again.",
      ),
    );
  }
  if (!data) throw new Error("The checkout verification response was empty.");
  return data;
}
