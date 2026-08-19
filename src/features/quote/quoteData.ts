export type QuoteOption = {
  id: string;
  label: string;
  percentAdjustment: number;
  hint: string;
};

export const quoteMaterials: QuoteOption[] = [
  {
    id: "standard",
    label: "Standard",
    percentAdjustment: 0,
    hint: "Included",
  },
  {
    id: "premium",
    label: "Premium",
    percentAdjustment: 15,
    hint: "+15%",
  },
  {
    id: "eco",
    label: "Eco / Kraft",
    percentAdjustment: 8,
    hint: "+8%",
  },
  {
    id: "luxury",
    label: "Luxury",
    percentAdjustment: 30,
    hint: "+30%",
  },
];

export const quoteFinishes: QuoteOption[] = [
  {
    id: "matte",
    label: "Matte",
    percentAdjustment: 0,
    hint: "Included",
  },
  {
    id: "gloss",
    label: "Gloss",
    percentAdjustment: 5,
    hint: "+5%",
  },
  {
    id: "spot-uv",
    label: "Spot UV",
    percentAdjustment: 12,
    hint: "+12%",
  },
  {
    id: "foil",
    label: "Foil",
    percentAdjustment: 20,
    hint: "+20%",
  },
];

export const quoteTurnarounds: QuoteOption[] = [
  {
    id: "economy",
    label: "Economy 7–10d",
    percentAdjustment: -5,
    hint: "−5%",
  },
  {
    id: "standard",
    label: "Standard 5–7d",
    percentAdjustment: 0,
    hint: "Included",
  },
  {
    id: "express",
    label: "Express 3–5d",
    percentAdjustment: 15,
    hint: "+15%",
  },
];

export function getQuantityDiscount(quantity: number) {
  if (quantity >= 2000) return { rate: 0.6, label: "40% discount" };
  if (quantity >= 1000) return { rate: 0.75, label: "25% discount" };
  if (quantity >= 500) return { rate: 0.85, label: "15% discount" };
  if (quantity >= 250) return { rate: 0.95, label: "5% discount" };
  return { rate: 1, label: "Standard rate" };
}

export function quantityFromSlider(step: number, minimumQuantity: number) {
  const multiplier = 1 + Math.pow(step / 100, 1.6) * 39;
  const rawQuantity = minimumQuantity * multiplier;
  const increment =
    minimumQuantity >= 100 ? 50 : minimumQuantity >= 10 ? 5 : 1;

  return Math.max(
    minimumQuantity,
    Math.round(rawQuantity / increment) * increment,
  );
}
