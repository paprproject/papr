import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import TickerBar from "../../components/home/TickerBar";
import { b2bFeatures, b2bSectors } from "../../features/b2b/b2bData";
import { contactEmail } from "../../features/contact/contactData";

const quoteEmail =
  `mailto:${contactEmail}?subject=PAPR%20B2B%20printing%20enquiry`;

function B2BPage() {
  return (
    <div className="bg-[#f5f1ea] text-[#11100e]">
      <TickerBar />

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <header>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8440d]">
                B2B & Enterprise
              </p>
              <h1 className="mt-6 text-5xl font-black leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Print at scale.
                <span className="mt-2 block text-[#ef4d11]">
                  Priced to grow.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-black/55 sm:text-lg">
                Whether you're a marketing agency fulfilling client orders, an
                F&B chain updating signage, or an events company needing 10,000
                tote bags—PAPR is built for you.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={quoteEmail}
                  className="group inline-flex items-center gap-2 rounded-full bg-black px-6 py-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#ef4d11]"
                >
                  Talk to our B2B team
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
                <Link
                  to="/pricing"
                  className="inline-flex items-center rounded-full border border-black/15 bg-white px-6 py-4 text-sm font-extrabold transition hover:border-black hover:bg-black hover:text-white"
                >
                  View pricing
                </Link>
              </div>
            </header>

            <div className="rounded-3xl border border-black/10 bg-white px-6 py-3 shadow-[0_22px_60px_rgba(17,16,14,0.08)] sm:px-8 sm:py-4">
              {b2bFeatures.map((feature, index) => (
                <article
                  key={feature.title}
                  className={`flex gap-4 py-5 ${
                    index < b2bFeatures.length - 1 ? "border-b border-black/10" : ""
                  }`}
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#ef4d11]/10 text-xl">
                    {feature.icon}
                  </div>
                  <div>
                    <h2 className="font-extrabold">{feature.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-black/50">
                      {feature.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <section className="mt-20 sm:mt-24">
            <header className="text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8440d]">
                Made for ambitious teams
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                Who we work with
              </h2>
            </header>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {b2bSectors.map((sector) => (
                <article
                  key={sector.title}
                  className="group rounded-3xl border border-black/10 bg-[#faf7f1] p-7 transition hover:-translate-y-1 hover:border-[#ef4d11]/35 hover:bg-white hover:shadow-xl"
                >
                  <div className="text-4xl transition-transform group-hover:scale-110">
                    {sector.icon}
                  </div>
                  <h3 className="mt-5 text-xl font-black tracking-tight">
                    {sector.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-black/50">
                    {sector.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="relative mt-16 overflow-hidden rounded-[2rem] bg-[#11100e] px-6 py-14 text-center text-white sm:px-10 sm:py-16 lg:mt-20">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 size-64 rounded-full bg-[#ef4d11]/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-32 -left-24 size-72 rounded-full bg-[#ef4d11]/10 blur-3xl"
            />
            <div className="relative mx-auto max-w-xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff6a32]">
                Custom business pricing
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                Ready to print at scale?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/55">
                Tell us your monthly volume and we'll put together a custom
                quote within 24 hours.
              </p>
              <a
                href={quoteEmail}
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#ef4d11] px-7 py-4 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#ff5a1f]"
              >
                <Mail size={18} /> Get a custom quote
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default B2BPage;
