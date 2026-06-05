function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Choose & Design",
      description:
        "Pick a product, use our editor, or upload your file. No design skills needed.",
    },
    {
      number: "02",
      title: "Confirm & Pay",
      description:
        "Review your proof, get an instant quote, and pay securely by card or invoice.",
      highlighted: true,
    },
    {
      number: "03",
      title: "Print & Ship",
      description:
        "We print in Batam and ship direct to Singapore. Track your order every step.",
    },
  ];

  return (
    <section className="bg-white px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="inline-flex rounded-full border border-black/10 bg-[#f5f1ea] px-5 py-2 text-sm font-bold uppercase tracking-widest text-black/50">
            How it works
          </p>

          <h2 className="mt-8 text-5xl font-black tracking-tight md:text-7xl">
            From idea to inbox in{" "}
            <span className="text-orange-600">three steps.</span>
          </h2>
        </div>

        <div className="mt-16 space-y-8">
          {steps.map((step) => (
            <article
              key={step.number}
              className={`grid gap-6 rounded-3xl border p-10 md:grid-cols-[100px_1fr] md:items-center ${
                step.highlighted
                  ? "border-orange-600 bg-white"
                  : "border-black/10 bg-[#f5f1ea]"
              }`}
            >
              <p className="text-6xl font-black text-orange-200">
                {step.number}
              </p>

              <div>
                <h3 className="text-3xl font-black">{step.title}</h3>
                <p className="mt-4 text-xl leading-relaxed text-black/60">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="rounded-full bg-orange-600 px-10 py-5 font-bold text-white transition hover:scale-105">
            Start your first order →
          </button>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;