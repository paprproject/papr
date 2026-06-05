// src/components/home/HeroSection.tsx

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f5f1ea] px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <div className="mb-8 inline-flex rounded-full border border-black/10 bg-white/60 px-5 py-2 text-sm font-medium text-black/60">
            <span className="mr-2 text-orange-600">●</span>
            Produced in Indonesia · Delivered across Singapore
          </div>

          <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            Print that
            <span className="block text-orange-600">moves</span>
            <span className="block font-light italic">brands.</span>
          </h1>

          <p className="mt-8 max-w-xl text-xl leading-relaxed text-black/60">
            Premium advertising materials, branded merch, and custom packaging —
            designed by you in minutes, produced at scale, delivered fast.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button className="rounded-full bg-black px-10 py-5 font-bold text-white transition hover:scale-105">
              Start designing →
            </button>

            <button className="rounded-full border border-black/10 px-10 py-5 font-bold text-black transition hover:bg-white">
              How it works
            </button>
          </div>

          <div className="mt-16 grid max-w-2xl grid-cols-2 gap-8 border-t border-black/10 pt-8 md:grid-cols-4">
            <div>
              <p className="text-3xl font-black">500+</p>
              <p className="mt-1 text-sm text-black/50">Products available</p>
            </div>
            <div>
              <p className="text-3xl font-black">40%</p>
              <p className="mt-1 text-sm text-black/50">Below local print cost</p>
            </div>
            <div>
              <p className="text-3xl font-black">5–7</p>
              <p className="mt-1 text-sm text-black/50">Day SG delivery</p>
            </div>
            <div>
              <p className="text-3xl font-black">12k+</p>
              <p className="mt-1 text-sm text-black/50">Orders fulfilled</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center gap-2 border-b border-black/10 pb-4">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-4 rounded-md border border-black/10 px-4 py-1 text-sm text-black/50">
                papr.sg/shop
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {[
                ["💳", "Business Cards", "bg-green-950 text-white"],
                ["📄", "A5 Flyers", "bg-orange-600 text-white"],
                ["🚨", "Roll-Up Banner", "bg-black text-white"],
                ["🖼️", "A3 Poster", "bg-yellow-700 text-white"],
                ["👜", "Tote Bag", "bg-stone-200 text-black"],
                ["🔵", "Stickers", "bg-orange-100 text-black"],
              ].map(([icon, title, style]) => (
                <div
                  key={title}
                  className={`flex aspect-square flex-col items-center justify-center rounded-2xl p-4 text-center font-bold ${style}`}
                >
                  <span className="text-3xl">{icon}</span>
                  <span className="mt-4 text-sm">{title}</span>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full rounded-2xl bg-black py-4 font-bold text-white">
              ✏️ Open design editor
            </button>
          </div>

          <div className="absolute -right-4 -top-8 rounded-2xl border border-black/10 bg-white px-6 py-4 shadow-xl">
            <p className="text-2xl font-black text-orange-600">5–7</p>
            <p className="text-sm text-black/60">day delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;