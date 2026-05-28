function HomePage() {
  return (
    <section className="mx-auto flex min-h-[80vh] max-w-7xl items-center px-8">
      
      <div className="max-w-2xl">
        
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-orange-600">
          Premium Printing Platform
        </p>

        <h1 className="text-7xl font-black leading-none tracking-tight">
          Print that
          <span className="block text-orange-600">
            moves
          </span>
          brands.
        </h1>

        <p className="mt-8 text-xl text-black/60">
          Premium advertising materials, branded merch,
          and custom packaging for modern businesses.
        </p>

        <div className="mt-10 flex gap-4">
          
          <button className="rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:scale-105">
            Start Designing
          </button>

          <button className="rounded-full border border-black/10 px-8 py-4 font-semibold">
            Learn More
          </button>

        </div>

      </div>

    </section>
  );
}

export default HomePage;