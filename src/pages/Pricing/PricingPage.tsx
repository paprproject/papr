import { ArrowRight, Check, Minus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {
  discountTiers,
  pricingPlans,
} from "../../features/pricing/pricingData";

function PricingPage() {
  return (
    <div className="bg-[#f5f1ea] text-[#11100e]">
      <section className="overflow-hidden px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <header className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8440d]">
              Simple, transparent pricing
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Pay for what you print.
              <span className="mt-2 block italic text-[#ef4d11]">
                Nothing else.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">
              No subscriptions. No hidden fees. Every order is pay-as-you-go,
              with volume discounts applied automatically as you grow.
            </p>
            <Link
              to="/quote"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#ef4d11]"
            >
              Get instant quote
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </header>

          <div className="mt-14 grid items-stretch gap-5 lg:mt-16 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex min-w-0 flex-col rounded-3xl border p-6 transition hover:-translate-y-1 sm:p-8 ${
                  plan.featured
                    ? "border-[#ef4d11] bg-[#11100e] text-white shadow-[0_24px_70px_rgba(17,16,14,0.18)]"
                    : "border-black/10 bg-white shadow-sm hover:shadow-xl"
                }`}
              >
                {plan.featured && (
                  <div className="mb-5 flex w-fit items-center gap-2 rounded-full bg-[#ef4d11] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-white">
                    <Sparkles size={13} /> Most popular
                  </div>
                )}

                <p
                  className={`text-xs font-extrabold uppercase tracking-[0.16em] ${
                    plan.featured ? "text-white/45" : "text-black/45"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="mt-3 min-h-[78px]">
                  <p className="text-5xl font-black leading-[0.9] tracking-[-0.05em]">
                    {plan.price}
                  </p>
                  {plan.priceDetail && (
                    <p
                      className={`mt-2 text-lg font-black ${
                        plan.featured ? "text-[#ff6a32]" : "text-black/50"
                      }`}
                    >
                      {plan.priceDetail}
                    </p>
                  )}
                </div>
                <p
                  className={`mt-5 min-h-16 text-sm leading-6 ${
                    plan.featured ? "text-white/55" : "text-black/50"
                  }`}
                >
                  {plan.description}
                </p>

                <ul className="mt-6 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className={`flex items-center gap-3 border-b py-3 text-sm font-semibold ${
                        plan.featured
                          ? "border-white/10"
                          : "border-black/[0.07]"
                      } ${
                        feature.included
                          ? plan.featured
                            ? "text-white/75"
                            : "text-black/70"
                          : plan.featured
                            ? "text-white/25"
                            : "text-black/25"
                      }`}
                    >
                      {feature.included ? (
                        <Check
                          size={17}
                          strokeWidth={3}
                          className="shrink-0 text-[#ef4d11]"
                        />
                      ) : (
                        <Minus size={17} className="shrink-0" />
                      )}
                      {feature.label}
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.href}
                  className={`group mt-8 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-extrabold transition hover:-translate-y-0.5 ${
                    plan.featured
                      ? "bg-[#ef4d11] text-white hover:bg-[#ff5b1f]"
                      : "border border-black/15 bg-white text-black hover:border-black hover:bg-black hover:text-white"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-[#eee8de] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <header className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8440d]">
              The more you print, the more you save
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Volume discount tiers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-black/50 sm:text-base">
              Your discount grows with your completed monthly spend. There are
              no codes to remember and no subscription to maintain.
            </p>
          </header>

          <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse">
                <caption className="sr-only">
                  PAPR monthly volume discount tiers
                </caption>
                <thead>
                  <tr className="bg-[#faf7f1] text-left text-[11px] font-extrabold uppercase tracking-[0.14em] text-black/45">
                    <th scope="col" className="px-6 py-5">
                      Monthly spend
                    </th>
                    <th scope="col" className="px-6 py-5 text-center">
                      Discount
                    </th>
                    <th scope="col" className="px-6 py-5 text-right">
                      Effective from
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {discountTiers.map((tier) => (
                    <tr
                      key={tier.spend}
                      className={`border-t border-black/10 text-sm ${
                        tier.featured ? "bg-[#fff0e9]" : "bg-white"
                      }`}
                    >
                      <th
                        scope="row"
                        className={`px-6 py-5 text-left ${
                          tier.featured ? "font-black" : "font-bold"
                        }`}
                      >
                        {tier.spend}
                      </th>
                      <td
                        className={`px-6 py-5 text-center ${
                          tier.discount === "Standard pricing"
                            ? "font-medium text-black/45"
                            : "font-black text-[#d8440d]"
                        }`}
                      >
                        {tier.discount}
                      </td>
                      <td
                        className={`px-6 py-5 text-right ${
                          tier.featured
                            ? "font-extrabold text-[#d8440d]"
                            : "text-black/45"
                        }`}
                      >
                        {tier.effective}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#ef4d11]/20 bg-[#ef4d11]/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-black/65">
              <strong className="font-extrabold text-black">
                Need a custom rate?
              </strong>{" "}
              High-volume, recurring, and multi-location orders can receive
              tailored pricing and payment terms.
            </p>
            <Link
              to="/b2b"
              className="group flex shrink-0 items-center gap-2 text-sm font-extrabold text-[#c93806]"
            >
              Talk to the B2B team
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <p className="mt-7 text-center text-xs text-black/35">
            All amounts are in SGD. Taxes may apply. Account discounts are
            calculated from completed orders.
          </p>
        </div>
      </section>
    </div>
  );
}

export default PricingPage;
