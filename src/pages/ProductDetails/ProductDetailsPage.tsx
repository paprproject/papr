import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../../services/productService";
import type { Product } from "../../types/product";
import { useCart } from "../../features/cart/CartContext";

function ProductDetailsPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState("100");
    const { addToCart } = useCart();

    useEffect(() => {
    async function loadProduct() {
      if (!id) return;

      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return <div className="px-6 py-24">Loading product...</div>;
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-24">
        <h1 className="text-4xl font-black">Product not found</h1>
        <Link to="/products" className="mt-6 inline-block text-orange-600">
          Back to products
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2">
      <div className="rounded-3xl bg-[#f5f1ea] p-10">
        <div className="flex aspect-square items-center justify-center rounded-3xl bg-white text-8xl shadow-sm">
          🖨️
        </div>
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
          {product.category}
        </p>

        <h1 className="mt-4 text-5xl font-black">
          {product.name}
        </h1>

        <p className="mt-6 text-xl leading-relaxed text-black/60">
          {product.description}
        </p>

        <div className="mt-8">
          <p className="text-sm text-black/50">Starting from</p>
          <p className="text-4xl font-black">
            ${product.starting_price}
          </p>
        </div>

        <p className="mt-4 text-black/60">
          Delivery estimate: {product.delivery_days}
        </p>

        <div className="mt-10 space-y-5">
          <label className="block">
            <span className="font-bold">Size</span>
            <select
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-5 py-4"
                >
                <option value="">Select size...</option>
                <option value="Standard">Standard</option>
                <option value="Large">Large</option>
                <option value="Custom">Custom</option>
            </select>
          </label>

          <label className="block">
            <span className="font-bold">Material</span>
            <select
                value={selectedMaterial}
                onChange={(event) => setSelectedMaterial(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-5 py-4"
              >
              <option value="">Select material...</option>
              <option value="Matte">Matte</option>
              <option value="Glossy">Glossy</option>
              <option value="Premium">Premium</option>
              </select>
          </label>

          <label className="block">
            <span className="font-bold">Quantity</span>
            <select
                value={selectedQuantity}
                onChange={(event) => setSelectedQuantity(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-5 py-4"
                >
                <option value="100">100</option>
                <option value="250">250</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
            </select>
          </label>
        </div>

        <button
        onClick={() => {
        if (!selectedSize || !selectedMaterial) {
            alert("Please select size and material first.");
            return;
        }

        addToCart({
            id: crypto.randomUUID(),
            product,
            size: selectedSize,
            material: selectedMaterial,
            quantity: selectedQuantity,
        });
            alert("Added to cart!");
        }}
        className="mt-10 w-full rounded-full bg-orange-600 px-8 py-5 font-bold text-white transition hover:scale-[1.02]"
        >
        Add to cart →
        </button>
      </div>
    </section>
  );
}

export default ProductDetailsPage;