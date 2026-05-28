import type { Product } from "../../types/product";

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white/60 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <p className="text-sm font-medium text-orange-600">{product.category}</p>

      <h3 className="mt-4 text-2xl font-black">{product.name}</h3>

      <p className="mt-3 text-black/60">{product.description}</p>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-sm text-black/50">From</p>
          <p className="text-2xl font-black">${product.startingPrice}</p>
        </div>

        <p className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
          {product.deliveryDays}
        </p>
      </div>
    </article>
  );
}

export default ProductCard;