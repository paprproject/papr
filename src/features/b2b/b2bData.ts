export type B2BFeature = {
  icon: string;
  title: string;
  description: string;
};

export type B2BSector = {
  icon: string;
  title: string;
  description: string;
};

export const b2bFeatures: B2BFeature[] = [
  {
    icon: "💼",
    title: "Dedicated Account Manager",
    description:
      "One point of contact who knows your brand, your specs, and your timelines.",
  },
  {
    icon: "📋",
    title: "NET30 Payment Terms",
    description:
      "Flexible billing so your cash flow stays healthy. Invoice-based for qualifying accounts.",
  },
  {
    icon: "🔗",
    title: "Bulk Upload API",
    description:
      "Push hundreds of orders programmatically. Perfect for e-commerce fulfilment and agencies.",
  },
  {
    icon: "🏷️",
    title: "White-Label Options",
    description:
      "Your branding on packing slips, delivery boxes, and invoices. We're invisible.",
  },
];

export const b2bSectors: B2BSector[] = [
  {
    icon: "🎨",
    title: "Marketing Agencies",
    description:
      "Resell PAPR printing under your brand. Bulk discounts that stack with your markup.",
  },
  {
    icon: "🍽️",
    title: "F&B Chains",
    description:
      "Menus, table talkers, packaging, uniforms—managed from one account for all outlets.",
  },
  {
    icon: "🎪",
    title: "Events Companies",
    description:
      "Banners, lanyards, tote bags, and backdrops for conferences, pop-ups, and activations.",
  },
  {
    icon: "🛒",
    title: "E-commerce Brands",
    description:
      "Thank-you cards, packaging inserts, tissue paper—the unboxing experience, sorted.",
  },
  {
    icon: "🏢",
    title: "Corporate Offices",
    description:
      "Business cards, letterheads, and branded stationery kits for onboarding and gifting.",
  },
  {
    icon: "🏥",
    title: "Healthcare & Clinics",
    description:
      "Patient forms, appointment cards, and branded PPE packaging. Bulk orders welcome.",
  },
];
