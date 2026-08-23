import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import { useCart } from "../../features/cart/CartContext";
import { getProductConfiguration } from "../../features/products/productConfiguration";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }).format(value);
}

function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    cartItems,
    cartLoading,
    cartError,
    removeFromCart,
    clearCart,
  } = useCart();
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.totalPrice ?? item.product.starting_price),
    0,
  );

  async function handleRemove(itemId: string) {
    setActionError("");
    try {
      setBusyAction(`remove:${itemId}`);
      await removeFromCart(itemId);
    } catch (error) {
      console.error("Failed to remove private cart item:", error);
      setActionError("We couldn't remove that item. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleClearCart() {
    setActionError("");
    try {
      setBusyAction("clear");
      await clearCart();
    } catch (error) {
      console.error("Failed to clear private cart:", error);
      setActionError("We couldn't clear your cart. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  if (authLoading || cartLoading) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-6 py-20">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-14 w-72 rounded-2xl bg-black/10" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="h-72 rounded-3xl bg-black/10" />
            <div className="h-72 rounded-3xl bg-black/10" />
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-6 py-24">
        <div className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#ef4d11]/10 text-[#ef4d11]">
            <ShieldCheck size={28} />
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight">
            Sign in to access your cart
          </h1>
          <p className="mt-3 text-lg text-black/55">
            Cart contents are stored privately under each customer account.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 font-extrabold text-white transition hover:bg-[#ef4d11]"
          >
            Sign in securely <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-6 py-24">
        <div className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#ef4d11]/10 text-[#ef4d11]">
            <ShoppingBag size={28} />
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight">
            Your cart is empty
          </h1>
          <p className="mt-3 text-lg text-black/55">
            Choose a print product, configure it, and it will appear here.
          </p>
          {cartError && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {cartError}
            </p>
          )}
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 font-extrabold text-white transition hover:bg-[#ef4d11]"
          >
            Browse products <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[70vh] bg-[#f5f1ea] px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8440d]">
              Cart · {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              Review your order
            </h1>
          </div>
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={handleClearCart}
            className="flex w-fit items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-extrabold text-black/60 transition hover:border-red-300 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {busyAction === "clear" ? "Clearing…" : "Clear cart"}
          </button>
        </div>

        {(cartError || actionError) && (
          <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {actionError || cartError}
          </p>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            {cartItems.map((item) => {
              const productConfiguration = getProductConfiguration(item.product);
              return (
                <article
                  key={item.id}
                  className="grid gap-6 rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-6 md:grid-cols-[120px_minmax(0,1fr)_auto]"
                >
                  <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#f5f1ea] text-5xl">
                    {productConfiguration.emoji}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-2xl font-black">{item.product.name}</h2>
                    <div className="mt-4 grid gap-x-6 gap-y-2 text-sm text-black/55 sm:grid-cols-2 xl:grid-cols-3">
                      <p>
                        <span className="font-bold text-black/75">Size:</span>{" "}
                        {item.size}
                      </p>
                      <p>
                        <span className="font-bold text-black/75">Stock:</span>{" "}
                        {item.material}
                      </p>
                      {item.finish && (
                        <p>
                          <span className="font-bold text-black/75">Finish:</span>{" "}
                          {item.finish}
                        </p>
                      )}
                      {item.sides && (
                        <p>
                          <span className="font-bold text-black/75">Print:</span>{" "}
                          {item.sides}
                        </p>
                      )}
                      <p>
                        <span className="font-bold text-black/75">Quantity:</span>{" "}
                        {Number(item.quantity).toLocaleString()} pcs
                      </p>
                      {item.turnaround && (
                        <p>
                          <span className="font-bold text-black/75">Production:</span>{" "}
                          {item.turnaround}
                        </p>
                      )}
                    </div>

                    {item.designMethod && (
                      <div className="mt-4 rounded-xl bg-[#f5f1ea] px-4 py-3 text-sm text-black/60">
                        <span className="font-extrabold text-black/80">Artwork:</span>{" "}
                        {item.designMethod}
                        {item.designFileName && (
                          <span className="ml-1 font-bold">· {item.designFileName}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4 md:flex-col md:items-end">
                    <div className="md:text-right">
                      <p className="text-2xl font-black text-[#d8440d]">
                        {formatMoney(item.totalPrice ?? item.product.starting_price)}
                      </p>
                      {item.unitPrice && (
                        <p className="mt-1 text-xs text-black/45">
                          {formatMoney(item.unitPrice)} each
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => handleRemove(item.id)}
                      className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-bold text-black/50 transition hover:border-red-300 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {busyAction === `remove:${item.id}`
                        ? "Removing…"
                        : "Remove"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-3xl bg-black p-7 text-white lg:sticky lg:top-28">
            <h2 className="text-2xl font-black">Order summary</h2>
            <dl className="mt-7 space-y-4 text-sm">
              <div className="flex items-center justify-between text-white/60">
                <dt>Subtotal</dt>
                <dd className="font-bold text-white">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <dt>Delivery</dt>
                <dd className="font-bold text-emerald-300">Calculated next</dd>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <dt>Tax</dt>
                <dd className="font-bold text-white">At checkout</dd>
              </div>
            </dl>
            <div className="my-6 h-px bg-white/20" />
            <div className="flex items-end justify-between gap-4">
              <span className="font-bold">Total</span>
              <span className="text-3xl font-black text-[#ff6a32]">
                {formatMoney(subtotal)}
              </span>
            </div>

            <Link
              to="/checkout"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ef4d11] px-6 py-4 font-extrabold text-white transition hover:bg-[#d9410c]"
            >
              Continue to checkout <ArrowRight size={18} />
            </Link>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-white/50">
              <ShieldCheck size={15} className="text-emerald-300" /> Secure checkout
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
