import { useState } from "react";
import { Heart, Star, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import { getProductPresentation } from "../../features/products/productPresentation";
import type { Product } from "../../types/product";

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { user, favoriteProductIds, toggleFavoriteProduct } = useAuth();
  const [savingFavorite, setSavingFavorite] = useState(false);
  const isFavorite = favoriteProductIds.includes(product.id);
  const presentation = getProductPresentation(product);
  const deliveryTime = product.delivery_days.replace(/(\d)\s*-\s*(\d)/g, "$1–$2");
  const price = product.starting_price.toLocaleString("en-SG", {
    minimumFractionDigits: Number.isInteger(product.starting_price) ? 0 : 2,
    maximumFractionDigits: 2,
  });

  async function handleFavorite() {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setSavingFavorite(true);
      await toggleFavoriteProduct(product.id);
    } catch (error) {
      console.error("Failed to update favorite:", error);
    } finally {
      setSavingFavorite(false);
    }
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-xl">
      <button
        type="button"
        aria-label={isFavorite ? `Unpin ${product.name}` : `Pin ${product.name}`}
        aria-pressed={isFavorite}
        disabled={savingFavorite}
        onClick={handleFavorite}
        className={`absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border shadow-sm backdrop-blur transition disabled:opacity-50 ${
          isFavorite
            ? "border-[#ef4d11] bg-[#ef4d11] text-white"
            : "border-black/10 bg-white/90 text-black/45 hover:border-[#ef4d11] hover:text-[#ef4d11]"
        }`}
      >
        <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      <Link
        to={`/products/${product.id}`}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4d11] focus-visible:ring-inset"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#eee8dc]">
          {presentation.imageMode === "single" ? (
            <img
              src={presentation.imageUrl}
              alt={presentation.imageAlt}
              loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-[1.025]"
            />
          ) : presentation.imageMode === "sprite" ? (
            <div
              role="img"
              aria-label={presentation.imageAlt}
              className="size-full bg-no-repeat transition duration-500 group-hover:scale-[1.025]"
              style={{
                backgroundImage: `url(${presentation.imageUrl})`,
                backgroundPosition: `${presentation.imagePosition} center`,
                backgroundSize: "200% auto",
              }}
            />
          ) : (
            <div
              role="img"
              aria-label={presentation.imageAlt}
              className="grid size-full place-items-center transition duration-500 group-hover:scale-[1.025]"
              style={{ backgroundColor: presentation.imageBackground }}
            >
              <span className="text-7xl drop-shadow-sm" aria-hidden="true">
                {presentation.imageSymbol}
              </span>
            </div>
          )}
          {presentation.badge ? (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-black shadow-sm backdrop-blur">
              {presentation.badge}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ef4d11]">
            {product.category}
          </p>
          <h3 className="mt-2 text-2xl font-black leading-tight text-black">
            {product.name}
          </h3>
          <p className="mt-2 min-h-12 text-sm leading-6 text-black/60">
            {product.description}
          </p>

          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#2f6b57]">
            <Truck size={16} aria-hidden="true" />
            Ready in {deliveryTime}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span
              className="flex items-center gap-0.5 text-[#ef7a22]"
              aria-label={`${presentation.rating.toFixed(1)} out of 5 stars`}
            >
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={15} fill="currentColor" aria-hidden="true" />
              ))}
            </span>
            <span className="font-bold text-black">
              {presentation.rating.toFixed(1)}
            </span>
            <span className="text-black/45">
              ({presentation.reviewCount.toLocaleString("en-SG")})
            </span>
            <span className="text-black/20" aria-hidden="true">
              ·
            </span>
            <span className="text-black/55">
              {presentation.orderCount.toLocaleString("en-SG")}+ orders
            </span>
          </div>

          <div className="mt-auto border-t border-black/8 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/40">
              Starting from
            </p>
            <p className="mt-1 text-2xl font-black text-black">
              SGD {price}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
