export type ContactFaq = {
  question: string;
  answer: string;
};

export const contactEmail = "hello@paprprint.com";

export const whatsappLink =
  "https://wa.me/6581234567?text=Hi%20PAPR!%20I%27d%20like%20help%20with%20a%20print%20order.";

export const enquiryTypes = [
  "New order enquiry",
  "Existing order / tracking",
  "B2B / bulk pricing",
  "Design support",
  "Complaint or feedback",
  "Other",
] as const;

export const contactFaqs: ContactFaq[] = [
  {
    question: "What file formats do you accept?",
    answer:
      "We accept PDF, AI, EPS, PSD, PNG (300 DPI), and TIFF. Files must be in CMYK color space with 3mm bleed on all sides. We'll flag any issues before production starts.",
  },
  {
    question: "How long does delivery to Singapore take?",
    answer:
      "Standard delivery is 5–7 business days from order confirmation. Express 3–5 day options are available for Growth plan customers. Rush 24-hour production is available for select products—contact us for availability.",
  },
  {
    question: "Do you have a minimum order quantity?",
    answer:
      "MOQs vary by product—as low as 1 pc for standees and banners, up to 500 pcs for some printed items. Each product page shows the MOQ clearly. B2B customers can negotiate lower MOQs at volume pricing.",
  },
  {
    question: "Can I see a physical proof before full production?",
    answer:
      "Yes—soft proofs (PDF) are included free with every order. Physical samples are available for SGD 25–60 depending on the product, credited toward your order if you proceed.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "PayNow, Visa or Mastercard, bank transfer, and invoice (NET30) for qualifying B2B accounts. All prices are in SGD and include GST.",
  },
];
