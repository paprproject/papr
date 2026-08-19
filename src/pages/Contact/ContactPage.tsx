import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Factory,
  Mail,
  MessageCircle,
} from "lucide-react";
import TickerBar from "../../components/home/TickerBar";
import {
  contactEmail,
  contactFaqs,
  enquiryTypes,
  whatsappLink,
} from "../../features/contact/contactData";

type ContactForm = {
  name: string;
  email: string;
  enquiryType: (typeof enquiryTypes)[number];
  message: string;
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  enquiryType: enquiryTypes[0],
  message: "",
};

function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [draftOpened, setDraftOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = `${form.enquiryType} — ${form.name}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Enquiry type: ${form.enquiryType}`,
      "",
      form.message,
    ].join("\n");
    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setDraftOpened(true);
    window.location.href = mailto;
  }

  return (
    <div className="bg-[#f5f1ea] text-[#11100e]">
      <TickerBar />

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/45">
              Get in touch
            </p>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              We're here to help.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">
              For orders, quotes, and design questions—our team responds within
              2 business hours.
            </p>
          </header>

          <div className="mt-14 grid items-start gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:gap-12">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-black/70">
                    Your name
                  </span>
                  <input
                    required
                    type="text"
                    autoComplete="name"
                    placeholder="Priya Lim"
                    value={form.name}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }));
                      setDraftOpened(false);
                    }}
                    className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-[#ef4d11] focus:ring-4 focus:ring-[#ef4d11]/10"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-black/70">
                    Email address
                  </span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="priya@company.sg"
                    value={form.email}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }));
                      setDraftOpened(false);
                    }}
                    className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-[#ef4d11] focus:ring-4 focus:ring-[#ef4d11]/10"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-bold text-black/70">
                  Enquiry type
                </span>
                <select
                  value={form.enquiryType}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      enquiryType: event.target.value as ContactForm["enquiryType"],
                    }));
                    setDraftOpened(false);
                  }}
                  className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#ef4d11] focus:ring-4 focus:ring-[#ef4d11]/10"
                >
                  {enquiryTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="mt-5 block">
                <span className="text-sm font-bold text-black/70">Message</span>
                <textarea
                  required
                  rows={6}
                  placeholder="Tell us what you need…"
                  value={form.message}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }));
                    setDraftOpened(false);
                  }}
                  className="mt-2 min-h-36 w-full resize-y rounded-xl border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-[#ef4d11] focus:ring-4 focus:ring-[#ef4d11]/10"
                />
              </label>

              <button
                type="submit"
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#ef4d11]"
              >
                Send message
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              {draftOpened && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold leading-5 text-emerald-800">
                  <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
                  Your email draft is ready. Review it in your email app, then
                  press send.
                </p>
              )}
            </form>

            <div className="space-y-4">
              <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <MessageCircle size={23} />
                </div>
                <h2 className="mt-5 text-xl font-black">WhatsApp (fastest)</h2>
                <p className="mt-2 text-sm leading-6 text-black/50">
                  Chat directly with our team. Typical reply: under 10 minutes.
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ef4d11]"
                >
                  Open WhatsApp
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
              </article>

              <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="grid size-12 place-items-center rounded-2xl bg-[#ef4d11]/10 text-[#d8440d]">
                  <Mail size={22} />
                </div>
                <h2 className="mt-5 text-xl font-black">Email</h2>
                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-2 inline-block text-sm font-extrabold text-[#d8440d] transition hover:text-black"
                >
                  {contactEmail}
                </a>
                <p className="mt-2 text-sm leading-6 text-black/50">
                  Response within 2 business hours, Mon–Fri, 9am–6pm SGT.
                </p>
              </article>

              <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="grid size-12 place-items-center rounded-2xl bg-[#f3ead7] text-[#a46e13]">
                  <Factory size={22} />
                </div>
                <h2 className="mt-5 text-xl font-black">
                  Production facility
                </h2>
                <p className="mt-2 text-sm leading-6 text-black/50">
                  Batam Centre Industrial Estate, Batam Island, Indonesia
                  <span className="mt-1 block">Visitor appointments available</span>
                </p>
              </article>
            </div>
          </div>

          <section
            id="frequently-asked-questions"
            className="mx-auto mt-20 max-w-3xl scroll-mt-28 sm:mt-24"
          >
            <header className="text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8440d]">
                Quick answers
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                Frequently asked questions
              </h2>
            </header>

            <div className="mt-9 border-t border-black/15">
              {contactFaqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={faq.question} className="border-b border-black/15">
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-5 py-6 text-left text-base font-extrabold sm:text-lg"
                      >
                        {faq.question}
                        <ChevronDown
                          size={21}
                          className={`shrink-0 text-[#ef4d11] transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </h3>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-black/50 sm:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
