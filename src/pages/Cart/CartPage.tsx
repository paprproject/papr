import { Link } from "react-router-dom";
import { useCart } from "../../features/cart/CartContext";

function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-24">
        <h1 className="text-5xl font-black">Your cart is empty</h1>

        <p className="mt-4 text-xl text-black/60">
          Start by choosing a print product.
        </p>

        <Link
          to="/products"
          className="mt-8 inline-block rounded-full bg-black px-8 py-4 font-bold text-white"
        >
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
            Cart
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Review your order
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="rounded-full border border-black/10 px-5 py-3 font-bold"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-12 space-y-6">
        {cartItems.map((item) => (
          <article
            key={item.id}
            className="grid gap-6 rounded-3xl border border-black/10 bg-white p-6 md:grid-cols-[120px_1fr_auto]"
          >
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#f5f1ea] text-5xl">
              🖨️
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {item.product.name}
              </h2>

              <div className="mt-4 grid gap-2 text-black/60 md:grid-cols-3">
                <p>Size: {item.size}</p>
                <p>Material: {item.material}</p>
                <p>Quantity: {item.quantity}</p>
              </div>

              <p className="mt-4 font-bold">
                Starting from ${item.product.starting_price}
              </p>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="h-fit rounded-full border border-black/10 px-5 py-3 font-bold text-black/60"
            >
              Remove
            </button>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl bg-black p-8 text-white md:flex-row md:items-center">
        <div>
          <p className="text-white/60">Total items</p>
          <p className="text-4xl font-black">{cartItems.length}</p>
        </div>

        <Link
          to="/checkout"
          className="rounded-full bg-orange-600 px-8 py-4 font-bold text-white"
        >
          Proceed to checkout →
        </Link>
      </div>
    </section>
  );
}

export default CartPage;