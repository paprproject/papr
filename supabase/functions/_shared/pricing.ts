type PriceOption = { label: string; priceAdjustment: number };

type PricingConfiguration = {
  minimumQuantity: number;
  quantityStep: number;
  sizes: PriceOption[];
  stocks: PriceOption[];
  finishes: PriceOption[];
  sides: PriceOption[];
  turnaround: PriceOption[];
};

const businessCardPricing: PricingConfiguration = {
  minimumQuantity: 100,
  quantityStep: 50,
  sizes: [
    { label: "Standard", priceAdjustment: 0 },
    { label: "Square", priceAdjustment: 0 },
    { label: "Mini", priceAdjustment: 0 },
    { label: "US Letter", priceAdjustment: 2 },
  ],
  stocks: [
    { label: "Standard", priceAdjustment: 0 },
    { label: "Premium", priceAdjustment: 4 },
    { label: "Kraft", priceAdjustment: 8 },
    { label: "Soft-touch", priceAdjustment: 14 },
  ],
  finishes: [
    { label: "Matte", priceAdjustment: 0 },
    { label: "Gloss", priceAdjustment: 2 },
    { label: "Spot UV", priceAdjustment: 5 },
    { label: "Foil Gold", priceAdjustment: 10 },
    { label: "Rounded corners", priceAdjustment: 8 },
  ],
  sides: [
    { label: "Single-sided", priceAdjustment: 0 },
    { label: "Double-sided", priceAdjustment: 5 },
  ],
  turnaround: [
    { label: "3–5", priceAdjustment: 12 },
    { label: "5–7", priceAdjustment: 0 },
    { label: "7–10", priceAdjustment: -4 },
  ],
};

const flyerPricing: PricingConfiguration = {
  minimumQuantity: 100,
  quantityStep: 50,
  sizes: [
    { label: "A5", priceAdjustment: 0 },
    { label: "A4", priceAdjustment: 12 },
    { label: "DL", priceAdjustment: -3 },
    { label: "Square", priceAdjustment: 3 },
  ],
  stocks: [
    { label: "Silk", priceAdjustment: 0 },
    { label: "Uncoated", priceAdjustment: 4 },
    { label: "Recycled", priceAdjustment: 7 },
    { label: "Premium", priceAdjustment: 10 },
  ],
  finishes: [
    { label: "Matte", priceAdjustment: 0 },
    { label: "Gloss", priceAdjustment: 3 },
    { label: "Spot UV", priceAdjustment: 8 },
  ],
  sides: [
    { label: "Single-sided", priceAdjustment: 0 },
    { label: "Double-sided", priceAdjustment: 6 },
  ],
  turnaround: [
    { label: "3–5", priceAdjustment: 15 },
    { label: "5–7", priceAdjustment: 0 },
    { label: "7–10", priceAdjustment: -5 },
  ],
};

function getVolumeRate(quantity: number) {
  if (quantity >= 2000) return 0.6;
  if (quantity >= 1000) return 0.75;
  if (quantity >= 500) return 0.85;
  if (quantity >= 250) return 0.95;
  return 1;
}

function findAdjustment(
  options: PriceOption[],
  selectedLabel: string | null,
  fieldName: string,
) {
  const option = options.find((candidate) =>
    fieldName === "turnaround"
      ? selectedLabel?.startsWith(candidate.label)
      : candidate.label === selectedLabel
  );

  if (!option) throw new Error(`The selected ${fieldName} is no longer available.`);
  return option.priceAdjustment;
}

export type PricedCartItem = {
  id: string;
  product_id: string;
  size: string;
  material: string;
  quantity: number;
  finish: string | null;
  sides: string | null;
  turnaround: string | null;
  design_method: string | null;
  design_file_name: string | null;
};

export type CurrentProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  starting_price: number;
  delivery_days: string;
};

export function calculateCartItemPrice(
  item: PricedCartItem,
  product: CurrentProduct,
) {
  const configuration = product.name.toLowerCase().includes("flyer")
    ? flyerPricing
    : businessCardPricing;

  if (
    !Number.isInteger(item.quantity) ||
    item.quantity < configuration.minimumQuantity ||
    (item.quantity - configuration.minimumQuantity) %
      configuration.quantityStep !==
      0
  ) {
    throw new Error(`The quantity for ${product.name} is not valid.`);
  }

  const optionAdjustment =
    findAdjustment(configuration.sizes, item.size, "size") +
    findAdjustment(configuration.stocks, item.material, "paper stock") +
    findAdjustment(configuration.finishes, item.finish, "finish") +
    findAdjustment(configuration.sides, item.sides, "sides") +
    findAdjustment(
      configuration.turnaround,
      item.turnaround,
      "turnaround",
    );
  const quantityMultiplier = item.quantity / configuration.minimumQuantity;
  const total = Math.max(
    0,
    (Number(product.starting_price) + optionAdjustment) *
      quantityMultiplier *
      getVolumeRate(item.quantity),
  );

  return {
    totalCents: Math.round(total * 100),
    unitPriceCents: Math.round((total / item.quantity) * 100),
  };
}
