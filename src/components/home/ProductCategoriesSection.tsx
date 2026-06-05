function ProductCategoriesSection() {
  const categories = [
    {
      title: "Advertising",
      color: "bg-orange-600",
      items: ["Posters", "Banners", "Standees", "Billboards", "Window Decals"],
    },
    {
      title: "Merch & Apparel",
      color: "bg-green-950",
      items: ["T-Shirts", "Tote Bags", "Caps", "Hoodies", "Mugs"],
    },
    {
      title: "Packaging",
      color: "bg-yellow-700",
      items: ["Boxes", "Pouches", "Labels", "Stickers", "Shopping Bags"],
    },
  ];

  return (
    <section className="bg-[#f5f1ea] px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-5xl font-black tracking-tight md:text-7xl">
            Everything your brand needs.
          </h2>

          <p className="mt-6 text-xl leading-relaxed text-black/60">
            From A-frame standees to zipper pouches — if it can be printed, we
            make it.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.title}
              className={`${category.color} rounded-3xl p-10 text-white`}
            >
              <h3 className="text-4xl font-black">{category.title}</h3>

              <ul className="mt-8 space-y-4 text-xl">
                {category.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductCategoriesSection;