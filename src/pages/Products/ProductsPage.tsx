import { useEffect, useState } from "react";
import ProductCard from "../../components/product/ProductCard";
import { getProducts } from "../../services/productService";
import type { Product } from "../../types/product";

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
        setErrorMessage("We couldn't load the product catalogue. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <section className="min-h-[70vh] px-6 py-20">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-12 w-64 rounded-full bg-black/10" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-[32rem] rounded-3xl bg-black/10" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-[70vh] max-w-7xl px-6 py-16 sm:px-8 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-[#ef4d11]">
          Print products
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Made to get your brand noticed.
        </h1>
        <p className="mt-4 text-base leading-7 text-black/60 sm:text-lg">
          Browse customer favourites, compare production times, and start with
          the format that fits your next idea.
        </p>
      </div>

      {errorMessage ? (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;
