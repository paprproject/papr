function TickerBar() {
  const items = [
    "   FACTORY-DIRECT PRICING",
    "   98.4% SATISFACTION RATE",
    "   12,000+ ORDERS FULFILLED",
    "   PRODUCED IN BATAM",
    "   FREE DESIGN EDITOR ",
    "   NO HIDDEN FEES",
    "   B2B PRICING AVAILABLE",
  ];

  return (
    <div className="bg-orange-600 py-2 text-white">
      <div className="overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          {items.map((item) => (
            <span
              key={item}
              className="mx-8 text-xs font-bold tracking-[0.2em]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TickerBar;