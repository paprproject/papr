import type { Product } from "../../types/product";

type ProductPresentation = {
  imageUrl: string;
  imageAlt: string;
  imageMode: "single" | "sprite" | "symbol";
  imagePosition: "left" | "right";
  imageSymbol: string;
  imageBackground: string;
  badge: string | null;
  rating: number;
  reviewCount: number;
  orderCount: number;
};

const fallbackImageUrl = "/product-images/papr-print-products.jpg";

const symbolFallbacks: Array<{
  terms: string[];
  symbol: string;
  background: string;
}> = [
  { terms: ["letter", "notepad"], symbol: "📝", background: "#e5efea" },
  { terms: ["pouch"], symbol: "👝", background: "#f6e1d7" },
  { terms: ["banner", "stand", "frame"], symbol: "🪧", background: "#e7e2d6" },
  { terms: ["poster"], symbol: "🖼️", background: "#f5ecd5" },
  { terms: ["tote", "bag"], symbol: "👜", background: "#ebe7df" },
  { terms: ["sticker", "label"], symbol: "🏷️", background: "#f8e1d8" },
  { terms: ["box"], symbol: "📦", background: "#f1ead8" },
  { terms: ["shirt"], symbol: "👕", background: "#dfecea" },
  { terms: ["mug"], symbol: "☕", background: "#f7e1d8" },
  { terms: ["cap"], symbol: "🧢", background: "#e4ece7" },
];

function getFallbackMetrics(name: string) {
  const seed = Array.from(name).reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );

  return {
    rating: 4.6 + (seed % 4) / 10,
    reviewCount: 74 + (seed % 430),
    orderCount: 420 + (seed % 1680),
  };
}

export function getProductPresentation(
  product: Product
): ProductPresentation {
  const normalizedName = product.name.toLowerCase();
  const isFlyer = normalizedName.includes("flyer");
  const isCard = normalizedName.includes("card");
  const suppliedImageUrl = product.image_url?.trim();
  const symbolFallback = symbolFallbacks.find(({ terms }) =>
    terms.some((term) => normalizedName.includes(term))
  );
  const fallbackMetrics = getFallbackMetrics(product.name);
  const usePhotoFallback = isCard || isFlyer;

  return {
    imageUrl: suppliedImageUrl || fallbackImageUrl,
    imageAlt: `${product.name} print preview`,
    imageMode: suppliedImageUrl
      ? "single"
      : usePhotoFallback
        ? "sprite"
        : "symbol",
    imagePosition: isFlyer ? "right" : "left",
    imageSymbol: symbolFallback?.symbol || "✦",
    imageBackground: symbolFallback?.background || "#eee8dc",
    badge:
      product.badge ||
      (isFlyer ? "Popular" : isCard ? "Best seller" : null),
    rating: product.rating ?? (isFlyer ? 4.8 : isCard ? 4.9 : fallbackMetrics.rating),
    reviewCount:
      product.review_count ??
      (isFlyer ? 201 : isCard ? 312 : fallbackMetrics.reviewCount),
    orderCount:
      product.order_count ??
      (isFlyer ? 860 : isCard ? 1240 : fallbackMetrics.orderCount),
  };
}
