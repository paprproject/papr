import type { Product } from "../types/product";

export const products: Product[] = [
  {
    id: "business-cards",
    name: "Business Cards",
    category: "Marketing",
    description: "Premium cards for founders, teams, and brands.",
    startingPrice: 24,
    deliveryDays: "5–7 days",
  },
  {
    id: "a5-flyers",
    name: "A5 Flyers",
    category: "Advertising",
    description: "Sharp, colourful flyers for campaigns and events.",
    startingPrice: 39,
    deliveryDays: "5–7 days",
  },
  {
    id: "roll-up-banner",
    name: "Roll-Up Banner",
    category: "Events",
    description: "Portable display banners for booths and storefronts.",
    startingPrice: 89,
    deliveryDays: "7–10 days",
  },
  {
    id: "stickers",
    name: "Stickers",
    category: "Merch",
    description: "Custom stickers for packaging, branding, and promos.",
    startingPrice: 19,
    deliveryDays: "5–7 days",
  },
];