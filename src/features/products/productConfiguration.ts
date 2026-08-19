import type { Product } from "../../types/product";

export type ConfigOption = {
  id: string;
  label: string;
  description?: string;
  dimensions?: string;
  priceAdjustment: number;
  swatch?: string;
};

export type ProductConfiguration = {
  subtitle: string;
  emoji: string;
  previewChoices: Array<{ emoji: string; label: string }>;
  sizes: ConfigOption[];
  stocks: ConfigOption[];
  finishes: ConfigOption[];
  sides: ConfigOption[];
  turnaround: ConfigOption[];
  minimumQuantity: number;
  quantityStep: number;
};

const businessCardConfiguration: Omit<ProductConfiguration, "subtitle"> = {
  emoji: "🪪",
  previewChoices: [
    { emoji: "🪪", label: "Standard card" },
    { emoji: "📛", label: "Rounded card" },
    { emoji: "💼", label: "In use" },
  ],
  sizes: [
    {
      id: "standard",
      label: "Standard",
      dimensions: "90 × 54 mm",
      priceAdjustment: 0,
    },
    {
      id: "square",
      label: "Square",
      dimensions: "55 × 55 mm",
      priceAdjustment: 0,
    },
    {
      id: "mini",
      label: "Mini",
      dimensions: "85 × 47 mm",
      priceAdjustment: 0,
    },
    {
      id: "us-letter",
      label: "US Letter",
      dimensions: "88.9 × 50.8 mm",
      priceAdjustment: 2,
    },
  ],
  stocks: [
    {
      id: "standard-350",
      label: "Standard",
      description: "350gsm coated · crisp colors · most popular",
      priceAdjustment: 0,
    },
    {
      id: "premium-400",
      label: "Premium",
      description: "400gsm extra-thick · premium feel · heavier",
      priceAdjustment: 4,
    },
    {
      id: "kraft-350",
      label: "Kraft",
      description: "350gsm recycled kraft · eco look · warm tone",
      priceAdjustment: 8,
    },
    {
      id: "soft-touch-400",
      label: "Soft-touch",
      description: "400gsm velvet laminate · luxury tactile feel",
      priceAdjustment: 14,
    },
  ],
  finishes: [
    {
      id: "matte",
      label: "Matte",
      priceAdjustment: 0,
      swatch: "#d9d3c5",
    },
    {
      id: "gloss",
      label: "Gloss",
      priceAdjustment: 2,
      swatch: "linear-gradient(135deg,#ffffff,#a9a9a9)",
    },
    {
      id: "spot-uv",
      label: "Spot UV",
      priceAdjustment: 5,
      swatch: "linear-gradient(135deg,#e04e12,#f4a85a)",
    },
    {
      id: "foil-gold",
      label: "Foil Gold",
      priceAdjustment: 10,
      swatch: "linear-gradient(135deg,#c09040,#f5d78e)",
    },
    {
      id: "rounded",
      label: "Rounded corners",
      priceAdjustment: 8,
      swatch: "#0d0c0a",
    },
  ],
  sides: [
    { id: "single", label: "Single-sided", priceAdjustment: 0 },
    { id: "double", label: "Double-sided", priceAdjustment: 5 },
  ],
  turnaround: [
    {
      id: "express",
      label: "3–5",
      description: "days · Express",
      priceAdjustment: 12,
    },
    {
      id: "standard",
      label: "5–7",
      description: "days · Standard",
      priceAdjustment: 0,
    },
    {
      id: "economy",
      label: "7–10",
      description: "days · Economy",
      priceAdjustment: -4,
    },
  ],
  minimumQuantity: 100,
  quantityStep: 50,
};

const flyerConfiguration: Omit<ProductConfiguration, "subtitle"> = {
  emoji: "📄",
  previewChoices: [
    { emoji: "📄", label: "Portrait flyer" },
    { emoji: "📰", label: "Flyer stack" },
    { emoji: "📌", label: "Displayed flyer" },
  ],
  sizes: [
    {
      id: "a5",
      label: "A5",
      dimensions: "148 × 210 mm",
      priceAdjustment: 0,
    },
    {
      id: "a4",
      label: "A4",
      dimensions: "210 × 297 mm",
      priceAdjustment: 12,
    },
    {
      id: "dl",
      label: "DL",
      dimensions: "99 × 210 mm",
      priceAdjustment: -3,
    },
    {
      id: "square",
      label: "Square",
      dimensions: "148 × 148 mm",
      priceAdjustment: 3,
    },
  ],
  stocks: [
    {
      id: "silk-150",
      label: "Silk",
      description: "150gsm smooth stock · vibrant everyday print",
      priceAdjustment: 0,
    },
    {
      id: "uncoated-170",
      label: "Uncoated",
      description: "170gsm natural paper · easy to write on",
      priceAdjustment: 4,
    },
    {
      id: "recycled-170",
      label: "Recycled",
      description: "170gsm recycled stock · warm tactile finish",
      priceAdjustment: 7,
    },
    {
      id: "premium-250",
      label: "Premium",
      description: "250gsm heavyweight · substantial hand feel",
      priceAdjustment: 10,
    },
  ],
  finishes: [
    {
      id: "matte",
      label: "Matte",
      priceAdjustment: 0,
      swatch: "#d9d3c5",
    },
    {
      id: "gloss",
      label: "Gloss",
      priceAdjustment: 3,
      swatch: "linear-gradient(135deg,#ffffff,#a9a9a9)",
    },
    {
      id: "spot-uv",
      label: "Spot UV",
      priceAdjustment: 8,
      swatch: "linear-gradient(135deg,#e04e12,#f4a85a)",
    },
  ],
  sides: [
    { id: "single", label: "Single-sided", priceAdjustment: 0 },
    { id: "double", label: "Double-sided", priceAdjustment: 6 },
  ],
  turnaround: [
    {
      id: "express",
      label: "3–5",
      description: "days · Express",
      priceAdjustment: 15,
    },
    {
      id: "standard",
      label: "5–7",
      description: "days · Standard",
      priceAdjustment: 0,
    },
    {
      id: "economy",
      label: "7–10",
      description: "days · Economy",
      priceAdjustment: -5,
    },
  ],
  minimumQuantity: 100,
  quantityStep: 50,
};

export function getProductConfiguration(product: Product): ProductConfiguration {
  const isFlyer = product.name.toLowerCase().includes("flyer");
  const configuration = isFlyer ? flyerConfiguration : businessCardConfiguration;

  return {
    ...configuration,
    subtitle: `${product.description} · from SGD ${product.starting_price.toFixed(2)}`,
  };
}
