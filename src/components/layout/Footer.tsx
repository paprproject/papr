import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  Leaf,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  contactEmail,
  whatsappLink,
} from "../../features/contact/contactData";

const footerGroups = [
  {
    title: "Print products",
    links: [
      { label: "Business cards", to: "/products" },
      { label: "Flyers & handouts", to: "/products" },
      { label: "Browse all products", to: "/products" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "Help & support",
    links: [
      { label: "Contact our team", to: "/contact" },
      {
        label: "Frequently asked questions",
        to: "/contact#frequently-asked-questions",
      },
      { label: "Track your order", to: "/account?tab=orders" },
      { label: "Your cart", to: "/cart" },
    ],
  },
  {
    title: "About PAPR",
    links: [
      { label: "Home", to: "/" },
      { label: "Business printing", to: "/b2b" },
      { label: "Instant quote", to: "/quote" },
      { label: "Get started", to: "/products" },
    ],
  },
] as const;

const trustSignals = [
  { icon: BadgeCheck, label: "Free artwork proof" },
  { icon: ShieldCheck, label: "Secure payment" },
  { icon: Leaf, label: "Responsible paper options" },
  { icon: Truck, label: "Singapore-wide delivery" },
] as const;

type FooterProps = {
  hideCta?: boolean;
};

function Footer({ hideCta = false }: FooterProps) {
  return (
    <footer className="overflow-hidden bg-[#11100e] text-white">
      {!hideCta && (
        <div className="border-b border-white/10 bg-[#ef4d11]">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">
                Ready when you are
              </p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Put your brand on paper.
              </h2>
            </div>
            <Link
              to="/products"
              className="group inline-flex w-fit items-center gap-2 rounded-full bg-black px-6 py-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-black"
            >
              Start a print order
              <ArrowUpRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr] lg:gap-16">
          <div>
            <Link
              to="/"
              aria-label="PAPR home"
              className="inline-block text-4xl font-black tracking-[-0.06em]"
            >
              PAP<span className="text-[#ff5a1f]">R</span>
            </Link>
            <p className="mt-5 max-w-sm text-base leading-7 text-white/55">
              Thoughtful print for growing brands—simple to design, clear to
              order, and delivered ready to make an impression.
            </p>

            <div className="mt-7 space-y-3 text-sm text-white/60">
              <a
                href={`mailto:${contactEmail}`}
                className="flex w-fit items-center gap-3 transition hover:text-white"
              >
                <Mail size={17} className="text-[#ff5a1f]" />
                {contactEmail}
              </a>
              <p className="flex items-center gap-3">
                <MapPin size={17} className="shrink-0 text-[#ff5a1f]" />
                Designed and printed in Singapore
              </p>
            </div>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3"
          >
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/35">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm font-semibold text-white/65 transition hover:text-[#ff6a32]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
          {trustSignals.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex min-h-20 items-center gap-3 bg-[#11100e] px-4 py-4 text-xs font-bold text-white/55 sm:justify-center"
            >
              <Icon size={19} className="shrink-0 text-[#ff5a1f]" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PAPR. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a
              className="transition hover:text-white"
              href={`mailto:${contactEmail}`}
            >
              Email us
            </a>
            <a
              className="transition hover:text-white"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <Link
              className="transition hover:text-white"
              to="/contact#frequently-asked-questions"
            >
              Print guidelines
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
