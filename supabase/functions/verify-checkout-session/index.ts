import Stripe from "npm:stripe@18.5.0";
import {
  handleOptions,
  jsonResponse,
  requireAllowedOrigin,
} from "../_shared/http.ts";
import { requireUser } from "../_shared/supabase.ts";

function requireEnvironment(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

function publicVerificationMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const safeMessages = new Set([
    "That checkout session is not valid.",
    "This checkout does not belong to your account.",
    "The matching order could not be found.",
    "Your session has expired. Please sign in again.",
    "Sign in before starting checkout.",
  ]);

  return safeMessages.has(message)
    ? message
    : "We could not verify this payment. Please contact us before paying again.";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return handleOptions(request);
  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Method not allowed." }, 405);
  }
  if (!requireAllowedOrigin(request)) {
    return jsonResponse(request, { error: "Origin is not allowed." }, 403);
  }

  try {
    const body = (await request.json()) as { sessionId?: unknown };
    if (typeof body.sessionId !== "string" || !body.sessionId.startsWith("cs_test_")) {
      throw new Error("That checkout session is not valid.");
    }

    const stripeSecretKey = requireEnvironment("STRIPE_SECRET_KEY");
    if (!stripeSecretKey.startsWith("sk_test_")) {
      throw new Error("Checkout is configured for Stripe sandbox keys only.");
    }

    const { admin, user } = await requireUser(request);
    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(body.sessionId);

    if (session.metadata?.user_id !== user.id || !session.metadata?.order_id) {
      throw new Error("This checkout does not belong to your account.");
    }

    const { data: order, error } = await admin
      .from("orders")
      .select("id, status, currency, total_cents")
      .eq("id", session.metadata.order_id)
      .eq("user_id", user.id)
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (error) throw error;
    if (!order) throw new Error("The matching order could not be found.");

    return jsonResponse(request, {
      orderId: order.id,
      status: order.status,
      paymentStatus: session.payment_status,
      currency: order.currency,
      totalCents: order.total_cents,
    });
  } catch (error) {
    console.error("Could not verify checkout session:", error);
    return jsonResponse(
      request,
      {
        error: publicVerificationMessage(error),
      },
      400,
    );
  }
});
