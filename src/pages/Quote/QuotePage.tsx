import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Clipboard,
  PackageCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProductConfiguration } from "../../features/products/productConfiguration";
import {
  getQuantityDiscount,
  quantityFromSlider,
  quoteFinishes,
  quoteMaterials,
  quoteTurnarounds,
  type QuoteOption,
} from "../../features/quote/quoteData";
import { getProducts } from "../../services/productService";
import type { Product } from "../../types/product";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }).format(value);
}

function QuotePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [sliderStep, setSliderStep] = useState(0);
  const [materialId, setMaterialId] = useState(quoteMaterials[0].id);
  const [finishId, setFinishId] = useState(quoteFinishes[0].id);
  const [turnaroundId, setTurnaroundId] = useState(quoteTurnarounds[1].id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const productList = await getProducts();
        if (cancelled) return;
        setProducts(productList);
        setSelectedProductId(productList[0]?.id ?? "");
      } catch (loadError) {
        if (cancelled) return;
        console.error("Failed to load quote products:", loadError);
        setError("We couldn't load the quote calculator right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? products[0];
  const configuration = selectedProduct
    ? getProductConfiguration(selectedProduct)
    : null;
  const selectedMaterial =
    quoteMaterials.find((option) => option.id === materialId) ?? quoteMaterials[0];
  const selectedFinish =
    quoteFinishes.find((option) => option.id === finishId) ?? quoteFinishes[0];
  const selectedTurnaround =
    quoteTurnarounds.find((option) => option.id === turnaroundId) ??
    quoteTurnarounds[1];

  const quote = useMemo(() => {
    if (!selectedProduct || !configuration) {
      return {
        quantity: 0,
        base: 0,
        addOnPercent: 0,
        beforeDiscount: 0,
        discountRate: 1,
        discountLabel: "Standard rate",
        discountAmount: 0,
        total: 0,
        perUnit: 0,
        estimatedSaving: 0,
      };
    }

    const quantity = quantityFromSlider(
      sliderStep,
      configuration.minimumQuantity,
    );
    const base =
      selectedProduct.starting_price *
      (quantity / configuration.minimumQuantity);
    const addOnPercent =
      selectedMaterial.percentAdjustment +
      selectedFinish.percentAdjustment +
      selectedTurnaround.percentAdjustment;
    const beforeDiscount = base * (1 + addOnPercent / 100);
    const discount = getQuantityDiscount(quantity);
    const total = Math.max(0, beforeDiscount * discount.rate);

    return {
      quantity,
      base,
      addOnPercent,
      beforeDiscount,
      discountRate: discount.rate,
      discountLabel: discount.label,
      discountAmount: beforeDiscount - total,
      total,
      perUnit: total / quantity,
      estimatedSaving: total * 0.75,
    };
  }, [
    configuration,
    selectedFinish,
    selectedMaterial,
    selectedProduct,
    selectedTurnaround,
    sliderStep,
  ]);

  const comparisonRows = useMemo(() => {
    if (!selectedProduct || !configuration) return [];

    return [1, 2.5, 5, 10, 20].map((multiplier) => {
      const quantity = Math.round(configuration.minimumQuantity * multiplier);
      const base = selectedProduct.starting_price * multiplier;
      const beforeDiscount = base * (1 + quote.addOnPercent / 100);
      const discount = getQuantityDiscount(quantity);
      const total = beforeDiscount * discount.rate;

      return {
        quantity,
        total,
        perUnit: total / quantity,
        discountLabel:
          discount.rate === 1 ? "—" : discount.label.replace(" discount", ""),
        current:
          quote.quantity > 0 &&
          Math.abs(quantity - quote.quantity) / quote.quantity < 0.25,
      };
    });
  }, [configuration, quote.addOnPercent, quote.quantity, selectedProduct]);

  function selectProduct(productId: string) {
    setSelectedProductId(productId);
    setSliderStep(0);
    setCopied(false);
  }

  async function copyQuote() {
    if (!selectedProduct) return;

    const summary = [
      "PAPR Instant Quote",
      `${selectedProduct.name} × ${quote.quantity.toLocaleString()} pcs`,
      `Material: ${selectedMaterial.label} · Finish: ${selectedFinish.label} · ${selectedTurnaround.label}`,
      `Total: ${formatMoney(quote.total)} (${formatMoney(quote.perUnit)}/pc)`,
      quote.discountRate < 1 ? `Includes ${quote.discountLabel}` : "",
      "Free delivery to Singapore · Valid 14 days",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch (copyError) {
      console.error("Could not copy quote:", copyError);
      setCopied(false);
    }
  }

  function startOrder() {
    if (!selectedProduct) return;
    const params = new URLSearchParams({
      quantity: String(quote.quantity),
      stock: selectedMaterial.id,
      finish: selectedFinish.id,
      turnaround: selectedTurnaround.id,
    });
    navigate(`/products/${selectedProduct.id}?${params.toString()}`);
  }

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-6 py-20">
        <div className="mx-auto grid max-w-7xl animate-pulse gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[720px] rounded-3xl bg-black/10" />
          <div className="h-[520px] rounded-3xl bg-black/10" />
        </div>
      </section>
    );
  }

  if (error || !selectedProduct || !configuration) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-6 py-24 text-center">
        <div className="mx-auto max-w-lg rounded-3xl border border-black/10 bg-white p-10">
          <Zap className="mx-auto text-[#ef4d11]" size={34} />
          <h1 className="mt-5 text-3xl font-black">Quote unavailable</h1>
          <p className="mt-3 text-black/50">
            {error || "No products are available for quoting yet."}
          </p>
        </div>
      </section>
    );
  }

  const addOnRows = [
    { label: "Material upgrade", option: selectedMaterial },
    { label: "Finish", option: selectedFinish },
    { label: "Turnaround", option: selectedTurnaround },
  ].filter((row) => row.option.percentAdjustment !== 0);

  return (
    <div className="bg-[#f5f1ea] text-[#11100e]">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_390px]">
        <main className="min-w-0 border-black/10 px-5 py-12 sm:px-8 lg:border-r lg:px-12 lg:py-16">
          <header className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8440d]">
              <Zap size={15} fill="currentColor" /> Instant quote
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Know your price
              <span className="block text-[#ef4d11]">in 10 seconds.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">
              No forms, no waiting for a sales rep. Pick a product, set your
              quantity, and watch the price update live—volume discounts
              included.
            </p>
          </header>

          <div className="mt-12 space-y-11">
            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/50">
                1 · Choose product
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const productConfiguration = getProductConfiguration(product);
                  const selected = product.id === selectedProduct.id;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectProduct(product.id)}
                      className={`relative rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#ef4d11]/60 ${
                        selected
                          ? "border-[#ef4d11] bg-[#fff9f6] shadow-[0_0_0_1px_#ef4d11]"
                          : "border-black/10"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-[#ef4d11] text-white">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      )}
                      <span className="block text-3xl">
                        {productConfiguration.emoji}
                      </span>
                      <span className="mt-4 block pr-5 font-extrabold">
                        {product.name}
                      </span>
                      <span className="mt-1 block text-xs text-black/45">
                        from {formatMoney(product.starting_price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/50">
                2 · Quantity
              </legend>
              <div className="mt-4 rounded-3xl border border-black/10 bg-white p-6 sm:p-7">
                <div className="flex items-end justify-between gap-4">
                  <p>
                    <span className="text-4xl font-black tracking-tight sm:text-5xl">
                      {quote.quantity.toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm font-bold text-black/40">pcs</span>
                  </p>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
                      quote.discountRate < 1
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-black/5 text-black/45"
                    }`}
                  >
                    {quote.discountLabel}
                  </span>
                </div>
                <input
                  aria-label="Quote quantity"
                  type="range"
                  min="0"
                  max="100"
                  value={sliderStep}
                  onChange={(event) => {
                    setSliderStep(Number(event.target.value));
                    setCopied(false);
                  }}
                  className="mt-7 h-2 w-full cursor-pointer accent-[#ef4d11]"
                />
                <div className="mt-3 flex justify-between text-[10px] font-extrabold uppercase tracking-wider text-black/30 sm:text-xs">
                  <span>MOQ</span>
                  <span>−5%</span>
                  <span>−15%</span>
                  <span>−25%</span>
                  <span>−40%</span>
                </div>
              </div>
            </fieldset>

            <QuoteOptionGroup
              number="3"
              label="Material"
              options={quoteMaterials}
              selectedId={materialId}
              onSelect={(id) => {
                setMaterialId(id);
                setCopied(false);
              }}
            />
            <QuoteOptionGroup
              number="4"
              label="Finish"
              options={quoteFinishes}
              selectedId={finishId}
              onSelect={(id) => {
                setFinishId(id);
                setCopied(false);
              }}
            />
            <QuoteOptionGroup
              number="5"
              label="Turnaround"
              options={quoteTurnarounds}
              selectedId={turnaroundId}
              onSelect={(id) => {
                setTurnaroundId(id);
                setCopied(false);
              }}
            />

            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/50">
                Price at every quantity
              </h2>
              <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[570px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#faf7f1] text-[10px] font-extrabold uppercase tracking-[0.12em] text-black/40">
                        <th className="px-5 py-4 text-left">Quantity</th>
                        <th className="px-5 py-4 text-right">Per unit</th>
                        <th className="px-5 py-4 text-right">Discount</th>
                        <th className="px-5 py-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr
                          key={row.quantity}
                          className={`border-t border-black/10 ${
                            row.current ? "bg-[#fff7f3]" : ""
                          }`}
                        >
                          <td
                            className={`px-5 py-4 ${
                              row.current ? "font-extrabold text-[#d8440d]" : ""
                            }`}
                          >
                            {row.quantity.toLocaleString()} pcs
                            {row.current ? " ← you" : ""}
                          </td>
                          <td className="px-5 py-4 text-right text-black/55">
                            {formatMoney(row.perUnit)}
                          </td>
                          <td className="px-5 py-4 text-right text-black/55">
                            {row.discountLabel}
                          </td>
                          <td className="px-5 py-4 text-right font-extrabold">
                            {formatMoney(row.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </main>

        <aside className="border-t border-black/10 p-5 sm:p-8 lg:sticky lg:top-[89px] lg:h-[calc(100vh-89px)] lg:overflow-y-auto lg:border-t-0">
          <div className="rounded-3xl bg-[#11100e] p-7 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/35">
              Your quote
            </p>
            <p className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#ff5a1f]">
              {formatMoney(quote.total)}
            </p>
            <p className="mt-2 text-xs leading-5 text-white/45">
              {formatMoney(quote.perUnit)} per piece · includes delivery to SG
            </p>

            <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs">
              <div className="flex items-start justify-between gap-4 text-white/60">
                <dt>
                  {selectedProduct.name} × {quote.quantity.toLocaleString()}
                </dt>
                <dd className="shrink-0 font-bold text-white">
                  {formatMoney(quote.base)}
                </dd>
              </div>
              {addOnRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 text-white/60"
                >
                  <dt>{row.label}</dt>
                  <dd className="font-bold text-white">
                    {row.option.percentAdjustment > 0 ? "+" : "−"}
                    {formatMoney(
                      Math.abs(
                        quote.base * (row.option.percentAdjustment / 100),
                      ),
                    )}
                  </dd>
                </div>
              ))}
              {quote.discountAmount > 0 && (
                <div className="flex items-center justify-between gap-4 text-emerald-300">
                  <dt>Volume discount</dt>
                  <dd className="font-bold">
                    −{formatMoney(quote.discountAmount)}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 text-white/60">
                <dt>Shipping to Singapore</dt>
                <dd className="font-bold text-emerald-300">Free</dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            <Sparkles className="mt-0.5 shrink-0" size={18} />
            <p>
              <strong>About {formatMoney(quote.estimatedSaving)} cheaper</strong>{" "}
              than typical Singapore print-shop pricing for this order.
            </p>
          </div>

          <button
            type="button"
            onClick={startOrder}
            className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ef4d11] px-6 py-5 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#d9410c]"
          >
            Start this order
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
          <button
            type="button"
            onClick={copyQuote}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/15 bg-white px-6 py-4 text-sm font-extrabold transition hover:border-black"
          >
            {copied ? <Check size={17} /> : <Clipboard size={17} />}
            {copied ? "Quote copied" : "Copy quote summary"}
          </button>

          <p className="mt-5 flex items-start justify-center gap-2 text-center text-xs leading-5 text-black/40">
            <PackageCheck className="mt-0.5 shrink-0" size={15} />
            Quote valid for 14 days · No payment needed now
            <br /> Free soft proof with every order
          </p>
        </aside>
      </div>
    </div>
  );
}

type QuoteOptionGroupProps = {
  number: string;
  label: string;
  options: QuoteOption[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function QuoteOptionGroup({
  number,
  label,
  options,
  selectedId,
  onSelect,
}: QuoteOptionGroupProps) {
  return (
    <fieldset>
      <legend className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/50">
        {number} · {label}
      </legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {options.map((option) => {
          const selected = selectedId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(option.id)}
              className={`rounded-2xl border bg-white px-4 py-4 text-left transition hover:border-[#ef4d11]/60 ${
                selected
                  ? "border-[#ef4d11] bg-[#fff9f6] shadow-[0_0_0_1px_#ef4d11]"
                  : "border-black/10"
              }`}
            >
              <span className="block text-sm font-extrabold">{option.label}</span>
              <span
                className={`mt-1 block text-xs font-bold ${
                  selected ? "text-[#d8440d]" : "text-black/40"
                }`}
              >
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default QuotePage;
