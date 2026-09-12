import Stripe from "npm:stripe@18.5.0";
import {
  handleOptions,
  jsonResponse,
  requireAllowedOrigin,
} from "../_shared/http.ts";
import {
  calculateCartItemPrice,
  type CurrentProduct,
  type PricedCartItem,
} from "../_shared/pricing.ts";
import { requireUser } from "../_shared/supabase.ts";

type CheckoutRequest = {
  cartItemIds?: unknown;
  savedAddressId?: unknown;
  contactEmail?: unknown;
  deliveryMethod?: unknown;
};

type SavedAddressRow = {
  id: string;
  label: string;
  recipient_name: string;
  company: string | null;
  phone: string;
  line_1: string;
  line_2: string | null;
  postal_code: string;
  country_code: string;
};

const MAX_CART_ITEMS = 50;

function requireEnvironment(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

function publicCheckoutMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const safePrefixes = [
    "Your cart",
    "Choose a",
    "Enter a",
    "That delivery address",
    "Checkout currently",
    "A product in your cart",
    "The quantity for",
    "The selected",
    "The order total",
    "Your session has expired",
    "Sign in before",
  ];

  return safePrefixes.some((prefix) => message.startsWith(prefix))
    ? message
    : "Secure payment could not be started. Please try again.";
}

function validateRequest(body: CheckoutRequest) {
  const cartItemIds = Array.isArray(body.cartItemIds)
    ? [...new Set(body.cartItemIds.filter((id): id is string => typeof id === "string"))]
    : [];
  const contactEmail =
    typeof body.contactEmail === "string"
      ? body.contactEmail.trim().toLowerCase()
      : "";

  if (cartItemIds.length === 0 || cartItemIds.length > MAX_CART_ITEMS) {
    throw new Error("Your cart must contain between 1 and 50 items.");
  }
  if (typeof body.savedAddressId !== "string") {
    throw new Error("Choose a saved delivery address.");
  }
  if (!/^\S+@\S+\.\S+$/.test(contactEmail) || contactEmail.length > 254) {
    throw new Error("Enter a valid email address.");
  }
  if (body.deliveryMethod !== "standard" && body.deliveryMethod !== "priority") {
    throw new Error("Choose a valid delivery method.");
  }

  return {
    cartItemIds,
    savedAddressId: body.savedAddressId,
    contactEmail,
    deliveryMethod: body.deliveryMethod,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return handleOptions(request);
  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Method not allowed." }, 405);
  }
  if (!requireAllowedOrigin(request)) {
    return jsonResponse(request, { error: "Origin is not allowed." }, 403);
  }

  let orderId: string | null = null;

  try {
    const stripeSecretKey = requireEnvironment("STRIPE_SECRET_KEY");
    if (!stripeSecretKey.startsWith("sk_test_")) {
      throw new Error("Checkout is configured for Stripe sandbox keys only.");
    }

    const siteUrl = new URL(requireEnvironment("SITE_URL"));
    const payload = validateRequest((await request.json()) as CheckoutRequest);
    const { admin, user } = await requireUser(request);

    const [cartResult, addressResult] = await Promise.all([
      admin
        .from("cart_items")
        .select(
          "id, product_id, size, material, quantity, finish, sides, turnaround, design_method, design_file_name",
        )
        .eq("user_id", user.id)
        .in("id", payload.cartItemIds),
      admin
        .from("saved_addresses")
        .select(
          "id, label, recipient_name, company, phone, line_1, line_2, postal_code, country_code",
        )
        .eq("user_id", user.id)
        .eq("id", payload.savedAddressId)
        .maybeSingle(),
    ]);

    if (cartResult.error) throw cartResult.error;
    if (addressResult.error) throw addressResult.error;

    const cartItems = (cartResult.data ?? []) as PricedCartItem[];
    const address = addressResult.data as SavedAddressRow | null;

    if (cartItems.length !== payload.cartItemIds.length) {
      throw new Error("Your cart changed. Refresh the page and try again.");
    }
    if (!address) {
      throw new Error("That delivery address is no longer available.");
    }
    if (address.country_code !== "SG") {
      throw new Error("Checkout currently supports Singapore addresses only.");
    }

    const productIds = [...new Set(cartItems.map((item) => item.product_id))];
    const { data: productData, error: productError } = await admin
      .from("products")
      .select(
        "id, name, description, category, starting_price, delivery_days",
      )
      .in("id", productIds);

    if (productError) throw productError;
    const products = (productData ?? []) as CurrentProduct[];
    const productsById = new Map(products.map((product) => [product.id, product]));

    const pricedItems = cartItems.map((item) => {
      const product = productsById.get(item.product_id);
      if (!product) throw new Error("A product in your cart is no longer available.");
      return { item, product, price: calculateCartItemPrice(item, product) };
    });

    const subtotalCents = pricedItems.reduce(
      (total, pricedItem) => total + pricedItem.price.totalCents,
      0,
    );
    const deliveryFeeCents = payload.deliveryMethod === "priority" ? 1200 : 0;
    const totalCents = subtotalCents + deliveryFeeCents;

    if (totalCents < 50) {
      throw new Error("The order total is too low to process.");
    }

    orderId = crypto.randomUUID();
    const addressSnapshot = {
      label: address.label,
      recipientName: address.recipient_name,
      company: address.company,
      phone: address.phone,
      line1: address.line_1,
      line2: address.line_2,
      postalCode: address.postal_code,
      countryCode: address.country_code,
    };

    const { error: orderError } = await admin.from("orders").insert({
      id: orderId,
      user_id: user.id,
      status: "pending_payment",
      currency: "sgd",
      subtotal_cents: subtotalCents,
      delivery_fee_cents: deliveryFeeCents,
      total_cents: totalCents,
      contact_email: payload.contactEmail,
      delivery_method: payload.deliveryMethod,
      delivery_address: addressSnapshot,
    });
    if (orderError) throw orderError;

    const { error: orderItemsError } = await admin.from("order_items").insert(
      pricedItems.map(({ item, product, price }) => ({
        order_id: orderId,
        user_id: user.id,
        cart_item_id: item.id,
        product_id: product.id,
        product_snapshot: product,
        configuration: {
          size: item.size,
          material: item.material,
          finish: item.finish,
          sides: item.sides,
          turnaround: item.turnaround,
          designMethod: item.design_method,
          designFileName: item.design_file_name,
        },
        quantity: item.quantity,
        unit_price_cents: price.unitPriceCents,
        total_price_cents: price.totalCents,
      })),
    );
    if (orderItemsError) throw orderItemsError;

    const stripe = new Stripe(stripeSecretKey);
    // Stripe replaces this literal placeholder after payment. URLSearchParams
    // percent-encodes the braces, which prevents Stripe from substituting it.
    const successUrl = `${new URL("/checkout/success", siteUrl).toString()}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = new URL("/checkout", siteUrl);
    cancelUrl.searchParams.set("payment", "cancelled");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: payload.contactEmail,
      client_reference_id: orderId,
      payment_method_types: ["card"],
      line_items: [
        ...pricedItems.map(({ item, product, price }) => ({
          quantity: 1,
          price_data: {
            currency: "sgd",
            unit_amount: price.totalCents,
            product_data: {
              name: product.name,
              description: `${item.size} · ${item.material} · ${item.quantity.toLocaleString()} pcs`,
            },
          },
        })),
        ...(deliveryFeeCents > 0
          ? [{
              quantity: 1,
              price_data: {
                currency: "sgd",
                unit_amount: deliveryFeeCents,
                product_data: { name: "Priority courier" },
              },
            }]
          : []),
      ],
      metadata: { order_id: orderId, user_id: user.id },
      payment_intent_data: { metadata: { order_id: orderId, user_id: user.id } },
      success_url: successUrl,
      cancel_url: cancelUrl.toString(),
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");

    const { error: updateError } = await admin
      .from("orders")
      .update({
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("user_id", user.id);
    if (updateError) throw updateError;

    return jsonResponse(request, { checkoutUrl: session.url });
  } catch (error) {
    console.error("Could not create checkout session:", error);

    if (orderId) {
      try {
        const { admin } = await requireUser(request);
        await admin
          .from("orders")
          .delete()
          .eq("id", orderId)
          .eq("status", "pending_payment")
          .is("stripe_checkout_session_id", null);
      } catch (cleanupError) {
        console.error("Could not clean up pending checkout:", cleanupError);
      }
    }

    return jsonResponse(
      request,
      {
        error: publicCheckoutMessage(error),
      },
      400,
    );
  }
});
