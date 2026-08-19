export type PricingFeature = {
  label: string;
  included: boolean;
};

export type PricingPlan = {
  id: "starter" | "growth" | "enterprise";
  name: string;
  price: string;
  priceDetail?: string;
  description: string;
  features: PricingFeature[];
  cta: string;
  href: string;
  featured?: boolean;
};

export type DiscountTier = {
  spend: string;
  discount: string;
  effective: string;
  featured?: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    priceDetail: "No platform fee",
    description: "Perfect for first orders and one-off campaigns.",
    features: [
      { label: "Pay-per-order pricing", included: true },
      { label: "Browser design editor", included: true },
      { label: "Upload your own files", included: true },
      { label: "Standard 5–7 day SG delivery", included: true },
      { label: "Volume discounts", included: false },
      { label: "Dedicated account manager", included: false },
    ],
    cta: "Start ordering",
    href: "/products",
  },
  {
    id: "growth",
    name: "Growth",
    price: "Volume",
    priceDetail: "discounts",
    description: "Up to 40% off for recurring orders over SGD 500 per month.",
    features: [
      { label: "Everything in Starter", included: true },
      { label: "Automatic volume discounts (5–40%)", included: true },
      { label: "Priority production queue", included: true },
      { label: "3–5 day express option", included: true },
      { label: "WhatsApp order tracking", included: true },
      { label: "Dedicated account manager", included: false },
    ],
    cta: "Get volume pricing",
    href: "/b2b",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise / B2B",
    price: "Custom",
    description:
      "For agencies, F&B chains, and event companies printing at scale.",
    features: [
      { label: "Everything in Growth", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Custom payment terms (NET30)", included: true },
      { label: "White-label options", included: true },
      { label: "API and bulk order upload", included: true },
      { label: "On-site quality visits", included: true },
    ],
    cta: "Talk to our B2B team",
    href: "/b2b",
  },
];

export const discountTiers: DiscountTier[] = [
  {
    spend: "SGD 0–499",
    discount: "Standard pricing",
    effective: "Immediately",
  },
  {
    spend: "SGD 500–999",
    discount: "5% off",
    effective: "Next order",
  },
  {
    spend: "SGD 1,000–2,499",
    discount: "15% off",
    effective: "Next order",
  },
  {
    spend: "SGD 2,500–4,999",
    discount: "25% off",
    effective: "Next order",
  },
  {
    spend: "SGD 5,000+",
    discount: "40% off",
    effective: "All orders",
    featured: true,
  },
];
