function TrustBar() {
  const brands = [
    {
      name: "Shopee",
      color: "text-orange-400",
    },
    {
      name: "Grab",
      color: "text-green-500",
    },
    {
      name: "Lazada",
      color: "text-indigo-500",
    },
    {
      name: "Foodpanda",
      color: "text-pink-500",
    },
    {
      name: "Ninja Van",
      color: "text-red-400",
    },
  ];

  return (
    <section className="bg-[#f5f1ea] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-bold tracking-[0.25em] text-black/50 uppercase">
          Trusted by teams at
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-12 md:gap-20">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className={`text-4xl font-black ${brand.color}`}
            >
              {brand.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBar;