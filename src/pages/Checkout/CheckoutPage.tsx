import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CreditCard,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import { useCart } from "../../features/cart/CartContext";
import {
  createCheckoutSession,
  PAYMENT_GATEWAY_READY,
  type DeliveryMethod,
} from "../../features/checkout/checkoutService";
import { getProductConfiguration } from "../../features/products/productConfiguration";

const deliveryOptions: Array<{
  id: DeliveryMethod;
  label: string;
  description: string;
  price: number;
}> = [
  {
    id: "standard",
    label: "Standard delivery",
    description: "Tracked Singapore delivery after production",
    price: 0,
  },
  {
    id: "priority",
    label: "Priority courier",
    description: "Priority dispatch after production",
    price: 12,
  },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }).format(value);
}

function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const {
    user,
    loading: authLoading,
    profile,
    savedAddresses,
    accountError,
  } = useAuth();
  const { cartItems, cartLoading, cartError } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [contactEmail, setContactEmail] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("standard");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const selectedAddress =
    savedAddresses.find((address) => address.id === selectedAddressId) ??
    savedAddresses.find((address) => address.isDefault) ??
    savedAddresses[0] ??
    null;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.totalPrice ?? item.product.starting_price),
    0,
  );
  const deliveryFee =
    deliveryOptions.find((option) => option.id === deliveryMethod)?.price ?? 0;
  const estimatedTotal = subtotal + deliveryFee;
  const emailValue = contactEmail ?? user?.email ?? "";

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutError("");

    if (!selectedAddress) {
      setCheckoutError("Choose a delivery address before continuing.");
      document
        .getElementById("delivery-address")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
      setCheckoutError("Enter a valid email address for order updates.");
      return;
    }

    if (!termsAccepted) {
      setCheckoutError("Confirm the order details before continuing.");
      return;
    }

    try {
      setSubmitting(true);
      const session = await createCheckoutSession({
        cartItemIds: cartItems.map((item) => item.id),
        savedAddressId: selectedAddress.id,
        contactEmail: emailValue,
        deliveryMethod,
      });
      window.location.assign(session.checkoutUrl);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Secure payment could not be started. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || cartLoading) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl animate-pulse gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <div className="h-12 w-72 rounded-2xl bg-black/10" />
            <div className="h-56 rounded-3xl bg-black/10" />
            <div className="h-80 rounded-3xl bg-black/10" />
          </div>
          <div className="h-[520px] rounded-3xl bg-black/10" />
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#ef4d11]/10 text-[#ef4d11]">
            <ShieldCheck size={29} />
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-[-0.04em]">
            Sign in to check out
          </h1>
          <p className="mt-3 text-base leading-7 text-black/55">
            Your cart, addresses, and artwork stay private to your PAPR account.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 font-extrabold text-white transition hover:bg-[#ef4d11]"
          >
            Sign in securely
          </Link>
        </div>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#ef4d11]/10 text-[#ef4d11]">
            <ShoppingBag size={29} />
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-[-0.04em]">
            Your cart is empty
          </h1>
          <p className="mt-3 text-base leading-7 text-black/55">
            Add a configured print product before starting checkout.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex rounded-full bg-black px-7 py-4 font-extrabold text-white transition hover:bg-[#ef4d11]"
          >
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-[#f5f1ea] text-[#11100e]">
      <div className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-5 py-4 sm:gap-6 sm:px-8">
          {[
            { number: 1, label: "Configure", complete: true, active: false },
            { number: 2, label: "Cart", complete: true, active: false },
            { number: 3, label: "Payment", complete: false, active: true },
          ].map((step, index) => (
            <div key={step.number} className="flex items-center gap-3 sm:gap-6">
              {index > 0 && <span className="text-black/20">→</span>}
              <div
                className={
                  "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold sm:px-5 " +
                  (step.active ? "bg-black text-white" : "text-black/45")
                }
              >
                <span
                  className={
                    "grid size-6 place-items-center rounded-full text-sm font-black " +
                    (step.complete
                      ? "bg-emerald-700 text-white"
                      : step.active
                        ? "bg-[#ef4d11] text-white"
                        : "bg-black/5")
                  }
                >
                  {step.complete ? <Check size={14} strokeWidth={3} /> : step.number}
                </span>
                <span className={step.active ? "inline" : "hidden sm:inline"}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-black/55 transition hover:text-[#d8440d]"
          >
            <ArrowLeft size={17} /> Back to cart
          </Link>

          <div className="mt-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8440d]">
              Secure checkout
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl">
              Delivery and payment
            </h1>
          </div>

          {(accountError || cartError) && (
            <p className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
              {accountError || cartError}
            </p>
          )}

          {searchParams.get("payment") === "cancelled" && (
            <p className="mt-6 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900">
              Payment was cancelled. Nothing was charged and your cart is still
              here.
            </p>
          )}

          <form
            onSubmit={handleCheckout}
            className="mt-9 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
          >
            <div className="min-w-0 space-y-6">
              <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#ef4d11]/10 font-black text-[#d8440d]">
                    1
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-black">Contact details</h2>
                    <p className="mt-1 text-sm leading-6 text-black/45">
                      We’ll send artwork proof and order updates here.
                    </p>
                    <label className="mt-6 block">
                      <span className="text-sm font-extrabold">Email address</span>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={emailValue}
                        onChange={(event) => {
                          setContactEmail(event.target.value);
                          setCheckoutError("");
                        }}
                        className="mt-2 w-full rounded-xl border border-black/15 bg-[#faf7f1] px-4 py-3.5 text-base outline-none transition focus:border-[#ef4d11] focus:ring-2 focus:ring-[#ef4d11]/15"
                      />
                    </label>
                    {profile?.fullName && (
                      <p className="mt-3 text-sm text-black/45">
                        Ordering as{" "}
                        <strong className="text-black/70">{profile.fullName}</strong>
                        {profile.company ? " · " + profile.company : ""}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section
                id="delivery-address"
                className="scroll-mt-28 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#ef4d11]/10 font-black text-[#d8440d]">
                    2
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-black">Delivery address</h2>
                        <p className="mt-1 text-sm leading-6 text-black/45">
                          Choose an address saved to your account.
                        </p>
                      </div>
                      <Link
                        to="/account?tab=addresses"
                        className="w-fit text-sm font-extrabold text-[#d8440d] underline decoration-[#d8440d]/30 underline-offset-4"
                      >
                        Manage addresses
                      </Link>
                    </div>

                    {savedAddresses.length === 0 ? (
                      <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-[#faf7f1] p-6 text-center">
                        <MapPin
                          className="mx-auto text-[#d8440d]"
                          size={25}
                        />
                        <h3 className="mt-4 text-lg font-black">
                          Add a delivery address first
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-black/45">
                          Save a Singapore address to your profile, then return
                          here to continue.
                        </p>
                        <Link
                          to="/account?tab=addresses"
                          className="mt-5 inline-flex rounded-full bg-black px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ef4d11]"
                        >
                          Add delivery address
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-6 grid gap-3 xl:grid-cols-2">
                        {savedAddresses.map((address) => {
                          const selected = selectedAddress?.id === address.id;
                          return (
                            <label
                              key={address.id}
                              className={
                                "relative cursor-pointer rounded-2xl border p-5 transition " +
                                (selected
                                  ? "border-[#ef4d11] bg-[#fff9f6] shadow-[0_0_0_1px_#ef4d11]"
                                  : "border-black/10 hover:border-[#ef4d11]/45")
                              }
                            >
                              <input
                                type="radio"
                                name="deliveryAddress"
                                value={address.id}
                                checked={selected}
                                onChange={() => {
                                  setSelectedAddressId(address.id);
                                  setCheckoutError("");
                                }}
                                className="sr-only"
                              />
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-black">{address.label}</p>
                                  {address.isDefault && (
                                    <span className="mt-2 inline-flex rounded-full bg-black px-2.5 py-1 text-xs font-bold text-white">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={
                                    "grid size-6 shrink-0 place-items-center rounded-full border " +
                                    (selected
                                      ? "border-[#ef4d11] bg-[#ef4d11] text-white"
                                      : "border-black/20 text-transparent")
                                  }
                                >
                                  <Check size={14} strokeWidth={3} />
                                </span>
                              </div>
                              <address className="mt-4 text-sm not-italic leading-6 text-black/55">
                                <strong className="text-black/75">
                                  {address.recipientName}
                                </strong>
                                {address.company && (
                                  <span className="block">{address.company}</span>
                                )}
                                <span className="block">{address.line1}</span>
                                {address.line2 && (
                                  <span className="block">{address.line2}</span>
                                )}
                                <span className="block">
                                  Singapore {address.postalCode}
                                </span>
                                <span className="mt-2 block">{address.phone}</span>
                              </address>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#ef4d11]/10 font-black text-[#d8440d]">
                    3
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-black">Delivery method</h2>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {deliveryOptions.map((option) => {
                        const selected = deliveryMethod === option.id;
                        return (
                          <label
                            key={option.id}
                            className={
                              "cursor-pointer rounded-2xl border p-5 transition " +
                              (selected
                                ? "border-[#ef4d11] bg-[#fff9f6] shadow-[0_0_0_1px_#ef4d11]"
                                : "border-black/10 hover:border-[#ef4d11]/45")
                            }
                          >
                            <input
                              type="radio"
                              name="deliveryMethod"
                              value={option.id}
                              checked={selected}
                              onChange={() => {
                                setDeliveryMethod(option.id);
                                setCheckoutError("");
                              }}
                              className="sr-only"
                            />
                            <div className="flex items-start justify-between gap-3">
                              <Truck className="text-[#d8440d]" size={21} />
                              <span className="font-black">
                                {option.price === 0
                                  ? "Included"
                                  : formatMoney(option.price)}
                              </span>
                            </div>
                            <h3 className="mt-4 font-black">{option.label}</h3>
                            <p className="mt-1 text-sm leading-6 text-black/45">
                              {option.description}
                            </p>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
                <div className="flex items-start gap-4 p-6 sm:p-8">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#ef4d11]/10 font-black text-[#d8440d]">
                    4
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-black">Secure payment</h2>
                        <p className="mt-1 text-sm leading-6 text-black/45">
                          Card details will be collected by the payment provider,
                          not stored by PAPR.
                        </p>
                      </div>
                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-extrabold ${PAYMENT_GATEWAY_READY ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        {PAYMENT_GATEWAY_READY
                          ? "Sandbox active"
                          : "Connection pending"}
                      </span>
                    </div>
                    <div className="mt-6 flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-black/15 bg-[#faf7f1] p-6 text-center">
                      <div>
                        <CreditCard
                          className="mx-auto text-black/35"
                          size={28}
                        />
                        <p className="mt-3 text-sm font-extrabold text-black/60">
                          {PAYMENT_GATEWAY_READY
                            ? "Continue to Stripe’s secure sandbox"
                            : "Stripe sandbox setup is pending"}
                        </p>
                        <p className="mt-1 text-sm text-black/40">
                          {PAYMENT_GATEWAY_READY
                            ? "Enter test card details on Stripe’s hosted checkout page."
                            : "Enable the sandbox only after the server functions and webhook are deployed."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`border-t border-black/10 px-6 py-4 text-sm font-semibold sm:px-8 ${PAYMENT_GATEWAY_READY ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}
                >
                  {PAYMENT_GATEWAY_READY
                    ? "Sandbox transactions never move real money. Card details go directly to Stripe."
                    : "No payment details are collected while the gateway is disconnected."}
                </div>
              </section>
            </div>

            <aside className="min-w-0">
              <div className="rounded-3xl bg-[#11100e] p-6 text-white shadow-xl lg:sticky lg:top-28 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-black">Order summary</h2>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/60">
                    {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {cartItems.map((item) => (
                    <article
                      key={item.id}
                      className="flex items-center gap-3 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10 text-2xl">
                        {getProductConfiguration(item.product).emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-extrabold">
                          {item.product.name}
                        </h3>
                        <p className="mt-1 truncate text-xs text-white/45">
                          {item.size} · {Number(item.quantity).toLocaleString()} pcs
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-black">
                        {formatMoney(
                          item.totalPrice ?? item.product.starting_price,
                        )}
                      </p>
                    </article>
                  ))}
                </div>

                <dl className="mt-7 space-y-4 border-t border-white/15 pt-6 text-sm">
                  <div className="flex items-center justify-between gap-4 text-white/55">
                    <dt>Subtotal</dt>
                    <dd className="font-bold text-white">
                      {formatMoney(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-white/55">
                    <dt>Delivery</dt>
                    <dd className="font-bold text-white">
                      {deliveryFee === 0 ? "Included" : formatMoney(deliveryFee)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-white/55">
                    <dt>Tax</dt>
                    <dd className="font-bold text-white">
                      Not added in sandbox
                    </dd>
                  </div>
                </dl>

                <div className="my-6 h-px bg-white/15" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-bold">Estimated total</p>
                    <p className="mt-1 text-xs text-white/40">SGD</p>
                  </div>
                  <p className="text-4xl font-black tracking-tight text-[#ff6a32]">
                    {formatMoney(estimatedTotal)}
                  </p>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-white/5 p-4">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => {
                      setTermsAccepted(event.target.checked);
                      setCheckoutError("");
                    }}
                    className="mt-0.5 size-4 accent-[#ef4d11]"
                  />
                  <span className="text-sm leading-6 text-white/60">
                    I’ve reviewed the products, artwork, and delivery details.
                  </span>
                </label>

                {checkoutError && (
                  <p
                    aria-live="polite"
                    className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                  >
                    {checkoutError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!PAYMENT_GATEWAY_READY || submitting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ef4d11] px-6 py-5 font-extrabold text-white transition hover:bg-[#ff5a1f] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                >
                  <LockKeyhole size={18} />
                  {submitting
                    ? "Opening secure payment…"
                    : PAYMENT_GATEWAY_READY
                      ? "Continue to secure payment"
                      : "Stripe connection pending"}
                </button>
                <p className="mt-4 text-center text-xs leading-5 text-white/40">
                  Your cart stays intact until payment succeeds.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 border-t border-white/10 pt-5 text-center text-xs font-bold text-white/45">
                  <div className="flex flex-col items-center gap-2">
                    <PackageCheck className="text-emerald-400" size={20} />
                    Artwork proof
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="text-amber-300" size={20} />
                    Secure checkout
                  </div>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </section>
    </div>
  );
}

export default CheckoutPage;
