import Stripe from "npm:stripe@18.5.0";
import { createAdminClient } from "../_shared/supabase.ts";

function requireEnvironment(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

function paymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id ?? null;
}

async function completeOrder(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  const userId = session.metadata?.user_id;
  if (!orderId || !userId) throw new Error("Stripe session metadata is incomplete.");

  const admin = createAdminClient();
  const { data: order, error: orderReadError } = await admin
    .from("orders")
    .select("id, total_cents")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (orderReadError) throw orderReadError;
  if (!order) throw new Error("The matching order does not exist.");
  if (session.currency !== "sgd" || session.amount_total !== order.total_cents) {
    throw new Error("Stripe total does not match the saved order total.");
  }

  const now = new Date().toISOString();
  const { error: orderUpdateError } = await admin
    .from("orders")
    .update({
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId(session),
      status: "paid",
      tax_cents: session.total_details?.amount_tax ?? 0,
      total_cents: session.amount_total,
      paid_at: now,
      updated_at: now,
    })
    .eq("id", orderId)
    .eq("user_id", userId);
  if (orderUpdateError) throw orderUpdateError;

  const { data: orderItems, error: itemError } = await admin
    .from("order_items")
    .select("cart_item_id")
    .eq("order_id", orderId)
    .eq("user_id", userId);
  if (itemError) throw itemError;

  const cartItemIds = (orderItems ?? [])
    .map((item) => item.cart_item_id as string | null)
    .filter((id): id is string => Boolean(id));

  if (cartItemIds.length > 0) {
    const { error: fileError } = await admin
      .from("customer_files")
      .update({
        order_id: orderId,
        cart_item_id: null,
        status: "submitted",
        updated_at: now,
      })
      .eq("user_id", userId)
      .in("cart_item_id", cartItemIds);
    if (fileError) throw fileError;

    const { error: cartError } = await admin
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .in("id", cartItemIds);
    if (cartError) throw cartError;
  }
}

async function updateOrderStatus(
  session: Stripe.Checkout.Session,
  status: "payment_failed" | "cancelled",
) {
  const orderId = session.metadata?.order_id;
  const userId = session.metadata?.user_id;
  if (!orderId || !userId) return;

  const { error } = await createAdminClient()
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("user_id", userId)
    .neq("status", "paid");
  if (error) throw error;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const stripe = new Stripe(requireEnvironment("STRIPE_SECRET_KEY"));
    const signature = request.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing Stripe signature.");

    const event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      signature,
      requireEnvironment("STRIPE_WEBHOOK_SECRET"),
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;
      if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        await completeOrder(session);
      }
    } else if (event.type === "checkout.session.async_payment_failed") {
      await updateOrderStatus(event.data.object, "payment_failed");
    } else if (event.type === "checkout.session.expired") {
      await updateOrderStatus(event.data.object, "cancelled");
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe webhook failed:", error);
    return new Response("Webhook verification failed", { status: 400 });
  }
});
