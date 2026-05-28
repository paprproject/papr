import ProductCard from "../../components/product/ProductCard";
import { products } from "../../data/products";

function ProductsPage() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-orange-600">
          Products
        </p>

        <h1 className="mt-4 text-6xl font-black tracking-tight">
          Print products for every business moment.
        </h1>

        <p className="mt-6 text-xl text-black/60">
          Start with our most popular products, then customize size, paper,
          quantity, finish, and artwork.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default ProductsPage;