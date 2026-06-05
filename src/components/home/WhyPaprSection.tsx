function WhyPaprSection() {
  const reasons = [
    {
      icon: "🏭",
      title: "Factory-Direct",
      description:
        "Skip the middleman. We own the production flow, so you get better pricing without sacrificing quality.",
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description:
        "5–7 day delivery for common print products, with production updates from order to shipment.",
    },
    {
      icon: "✨",
      title: "Design On Demand",
      description:
        "Use our browser-based editor or upload your own print-ready artwork when placing an order.",
    },
    {
      icon: "🔒",
      title: "ISO Certified",
      description:
        "Reliable print standards, quality checks, and consistent output for every business order.",
    },
  ];

  return (
    <section className="bg-white px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-bold uppercase tracking-widest text-orange-600">
            Why PAPR
          </p>

          <h2 className="mt-8 text-5xl font-black tracking-tight md:text-7xl">
            Print like a <span className="italic text-orange-600">pro</span>,
            pay like a startup.
          </h2>

          <p className="mt-6 text-xl leading-relaxed text-black/60">
            We cut out resellers and simplify the print workflow so teams can
            launch campaigns faster and more affordably.
          </p>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <article
              key={reason.title}
              className="rounded-3xl border border-black/10 bg-[#f5f1ea] p-8"
            >
              <div className="text-5xl">{reason.icon}</div>

              <h3 className="mt-10 text-2xl font-black">{reason.title}</h3>

              <p className="mt-5 leading-relaxed text-black/60">
                {reason.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyPaprSection;