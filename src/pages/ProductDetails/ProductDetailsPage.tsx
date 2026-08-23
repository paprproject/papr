import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Check,
  ChevronRight,
  FileCheck2,
  FileText,
  LockKeyhole,
  Minus,
  PackageCheck,
  Pencil,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  Upload,
} from "lucide-react";
import { getProductById } from "../../services/productService";
import type { Product } from "../../types/product";
import { useCart } from "../../features/cart/CartContext";
import {
  getProductConfiguration,
  type ConfigOption,
} from "../../features/products/productConfiguration";
import { getProductPresentation } from "../../features/products/productPresentation";

type DesignMethod = "editor" | "upload" | null;
type AddStatus = "idle" | "error" | "submitting" | "success";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatAdjustment(value: number) {
  if (value === 0) return "Included";
  return `${value > 0 ? "+" : "−"}SGD ${Math.abs(value).toFixed(0)}`;
}

function getVolumeRate(quantity: number) {
  if (quantity >= 2000) return 0.6;
  if (quantity >= 1000) return 0.75;
  if (quantity >= 500) return 0.85;
  if (quantity >= 250) return 0.95;
  return 1;
}

function findOption(options: ConfigOption[], id: string) {
  return options.find((option) => option.id === id);
}

function ProductDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [selectedFinish, setSelectedFinish] = useState("");
  const [selectedSides, setSelectedSides] = useState("");
  const [selectedTurnaround, setSelectedTurnaround] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [designMethod, setDesignMethod] = useState<DesignMethod>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [addStatus, setAddStatus] = useState<AddStatus>("idle");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!id) {
        setError("This product link is incomplete.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await getProductById(id);
        if (cancelled) return;
        if (!data) throw new Error("Product not found");

        const configuration = getProductConfiguration(data);
        const quotedStock = searchParams.get("stock");
        const quotedFinish = searchParams.get("finish");
        const quotedTurnaround = searchParams.get("turnaround");
        const quotedQuantity = Number(searchParams.get("quantity"));
        const matchedStock =
          quotedStock === "premium"
            ? configuration.stocks.find((option) =>
                option.label.toLowerCase().includes("premium"),
              )
            : quotedStock === "eco"
              ? configuration.stocks.find((option) =>
                  /kraft|recycled|uncoated/i.test(option.label),
                )
              : quotedStock === "luxury"
                ? configuration.stocks.find((option) =>
                    /soft|luxury/i.test(option.label),
                  ) ?? configuration.stocks.at(-1)
                : configuration.stocks[0];
        const matchedFinish =
          quotedFinish === "foil"
            ? configuration.finishes.find((option) =>
                option.id.includes("foil"),
              )
            : configuration.finishes.find(
                (option) => option.id === quotedFinish,
              );
        const matchedTurnaround = configuration.turnaround.find(
          (option) => option.id === quotedTurnaround,
        );
        const normalizedQuantity = Number.isFinite(quotedQuantity)
          ? Math.max(
              configuration.minimumQuantity,
              Math.round(quotedQuantity / configuration.quantityStep) *
                configuration.quantityStep,
            )
          : configuration.minimumQuantity;

        setProduct(data);
        setSelectedSize(configuration.sizes[0].id);
        setSelectedStock(matchedStock?.id ?? configuration.stocks[0].id);
        setSelectedFinish(matchedFinish?.id ?? configuration.finishes[0].id);
        setSelectedSides(configuration.sides[0].id);
        setSelectedTurnaround(
          matchedTurnaround?.id ??
            configuration.turnaround.find((option) => option.id === "standard")
              ?.id ??
            configuration.turnaround[0].id,
        );
        setQuantity(normalizedQuantity);
        setPreviewIndex(0);
        setDesignMethod(null);
        setUploadedFile(null);
        setAddStatus("idle");
        setAddError("");
      } catch (loadError) {
        if (cancelled) return;
        console.error("Failed to load product:", loadError);
        setError("We couldn't load this product. Please try again in a moment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id, searchParams]);

  const configuration = product ? getProductConfiguration(product) : null;

  const selectedOptions = useMemo(() => {
    if (!configuration) return [];

    return [
      findOption(configuration.sizes, selectedSize),
      findOption(configuration.stocks, selectedStock),
      findOption(configuration.finishes, selectedFinish),
      findOption(configuration.sides, selectedSides),
      findOption(configuration.turnaround, selectedTurnaround),
    ].filter((option): option is ConfigOption => Boolean(option));
  }, [
    configuration,
    selectedFinish,
    selectedSides,
    selectedSize,
    selectedStock,
    selectedTurnaround,
  ]);

  const pricing = useMemo(() => {
    if (!product || !configuration) {
      return {
        optionAdjustment: 0,
        quantityMultiplier: 1,
        volumeDiscount: 0,
        total: 0,
        perUnit: 0,
      };
    }

    const quantityMultiplier = quantity / configuration.minimumQuantity;
    const volumeRate = getVolumeRate(quantity);
    const optionAdjustment = selectedOptions.reduce(
      (sum, option) => sum + option.priceAdjustment,
      0,
    );
    const undiscounted =
      (product.starting_price + optionAdjustment) * quantityMultiplier;
    const total = Math.max(0, undiscounted * volumeRate);

    return {
      optionAdjustment,
      quantityMultiplier,
      volumeDiscount: undiscounted - total,
      total,
      perUnit: total / quantity,
    };
  }, [configuration, product, quantity, selectedOptions]);

  function updateQuantity(direction: 1 | -1) {
    if (!configuration) return;
    setQuantity((current) =>
      Math.max(
        configuration.minimumQuantity,
        current + configuration.quantityStep * direction,
      ),
    );
    setAddStatus("idle");
  }

  function handleQuantityChange(event: ChangeEvent<HTMLInputElement>) {
    if (!configuration) return;
    const nextQuantity = Number(event.target.value);
    if (!Number.isFinite(nextQuantity)) return;
    setQuantity(Math.max(configuration.minimumQuantity, nextQuantity));
    setAddStatus("idle");
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setDesignMethod("upload");
    setAddStatus("idle");
    setAddError("");
  }

  async function handleAddToCart() {
    if (!product || !configuration) return;

    if (!designMethod) {
      setAddStatus("error");
      setAddError(
        "Choose the online editor or upload your artwork before adding this product to your cart.",
      );
      document
        .getElementById("design-options")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const size = findOption(configuration.sizes, selectedSize);
    const stock = findOption(configuration.stocks, selectedStock);
    const finish = findOption(configuration.finishes, selectedFinish);
    const sides = findOption(configuration.sides, selectedSides);
    const turnaround = findOption(
      configuration.turnaround,
      selectedTurnaround,
    );

    if (!size || !stock || !finish || !sides || !turnaround) return;

    try {
      setAddStatus("submitting");
      setAddError("");
      await addToCart({
        product,
        size: size.label,
        material: stock.label,
        finish: finish.label,
        sides: sides.label,
        turnaround: `${turnaround.label} ${turnaround.description ?? "days"}`,
        quantity: String(quantity),
        designMethod:
          designMethod === "editor" ? "Online editor" : "File upload",
        designFile: uploadedFile ?? undefined,
        designFileName: uploadedFile?.name,
        unitPrice: pricing.perUnit,
        totalPrice: pricing.total,
      });
      setAddStatus("success");
    } catch (cartError) {
      console.error("Failed to add private cart item:", cartError);
      setAddStatus("error");
      setAddError(
        cartError instanceof Error
          ? cartError.message
          : "We couldn't save this item to your private cart. Please try again.",
      );
    }
  }

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-6 py-20">
        <div className="mx-auto grid max-w-7xl animate-pulse gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <div className="h-10 w-72 rounded-full bg-black/10" />
            <div className="h-40 rounded-3xl bg-black/10" />
            <div className="h-72 rounded-3xl bg-black/10" />
          </div>
          <div className="h-[560px] rounded-3xl bg-black/10" />
        </div>
      </section>
    );
  }

  if (!product || !configuration) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-6 py-24 text-center">
        <div className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-10">
          <FileText className="mx-auto text-[#ef4d11]" size={36} />
          <h1 className="mt-5 text-3xl font-black">Product unavailable</h1>
          <p className="mt-3 text-black/60">
            {error || "We couldn't find the product you're looking for."}
          </p>
          <Link
            to="/products"
            className="mt-7 inline-flex rounded-full bg-black px-6 py-3 font-bold text-white"
          >
            Back to products
          </Link>
        </div>
      </section>
    );
  }

  const activePreview = configuration.previewChoices[previewIndex];
  const selectedSizeOption = findOption(configuration.sizes, selectedSize);
  const editorLink = `/editor/new?productId=${encodeURIComponent(product.id)}&size=${encodeURIComponent(selectedSizeOption?.label ?? "Standard")}`;
  const isFlyer = product.name.toLowerCase().includes("flyer");
  const presentation = getProductPresentation(product);
  const deliveryTime = product.delivery_days.replace(
    /(\d)\s*-\s*(\d)/g,
    "$1–$2",
  );
  const selectionSummary = [
    { label: "Size", value: selectedSizeOption?.label ?? "Standard" },
    {
      label: "Paper",
      value:
        findOption(configuration.stocks, selectedStock)?.label ?? "Standard",
    },
    {
      label: "Finish",
      value:
        findOption(configuration.finishes, selectedFinish)?.label ?? "Matte",
    },
    { label: "Quantity", value: quantity + " pcs" },
  ];

  return (
    <div className="bg-[#f5f1ea] text-[#11100e]">
      <div className="border-b border-black/10 bg-[#f5f1ea]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-4 sm:gap-6">
          {[
            { number: 1, label: "Configure", active: true },
            { number: 2, label: "Cart", active: false },
            { number: 3, label: "Payment", active: false },
          ].map((step, index) => (
            <div key={step.number} className="contents">
              {index > 0 && (
                <ChevronRight className="text-black/20" size={18} />
              )}
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold sm:px-5 ${
                  step.active ? "bg-black text-white" : "text-black/45"
                }`}
              >
                <span
                  className={`text-xl font-black ${
                    step.active ? "text-[#ef4d11]" : "text-[#ef4d11]/35"
                  }`}
                >
                  {step.number}
                </span>
                <span className={step.active ? "inline" : "hidden sm:inline"}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-black/50">
            <Link className="transition hover:text-black" to="/">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link className="transition hover:text-black" to="/products">
              Products
            </Link>
            <ChevronRight size={14} />
            <span className="text-black/75">{product.name}</span>
          </nav>

          <div className="mt-7 grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:gap-14">
            <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-black/10 bg-[#eee8dc] sm:min-h-[480px]">
              {presentation.imageMode === "single" ? (
                <img
                  src={presentation.imageUrl}
                  alt={presentation.imageAlt}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : presentation.imageMode === "sprite" ? (
                <div
                  role="img"
                  aria-label={presentation.imageAlt}
                  className="absolute inset-0 bg-no-repeat"
                  style={{
                    backgroundImage: "url(" + presentation.imageUrl + ")",
                    backgroundPosition: presentation.imagePosition + " center",
                    backgroundSize: "200% auto",
                  }}
                />
              ) : (
                <div
                  role="img"
                  aria-label={presentation.imageAlt}
                  className="absolute inset-0 grid place-items-center"
                  style={{ backgroundColor: presentation.imageBackground }}
                >
                  <span className="text-8xl drop-shadow-sm" aria-hidden="true">
                    {presentation.imageSymbol}
                  </span>
                </div>
              )}
              {presentation.badge && (
                <span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] shadow-sm backdrop-blur">
                  {presentation.badge}
                </span>
              )}
              <div className="absolute bottom-5 left-5 rounded-full bg-black/80 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                PAPR product preview
              </div>
            </div>

            <div className="py-2">
              <span className="inline-flex rounded-full bg-[#ef4d11]/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#c93806]">
                {product.category}
              </span>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                {product.name}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
                <span
                  className="flex items-center gap-0.5 text-[#ef7a22]"
                  aria-label={presentation.rating.toFixed(1) + " out of 5 stars"}
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={17}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  ))}
                </span>
                <strong>{presentation.rating.toFixed(1)}</strong>
                <span className="text-black/45">
                  ({presentation.reviewCount.toLocaleString("en-SG")} reviews)
                </span>
                <span className="text-black/20">·</span>
                <span className="text-black/55">
                  {presentation.orderCount.toLocaleString("en-SG")}+ orders
                </span>
              </div>
              <p className="mt-5 text-lg leading-8 text-black/60">
                {product.description}
              </p>

              <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-5 border-y border-black/10 py-6">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-black/40">
                    Starting from
                  </p>
                  <p className="mt-1 text-3xl font-black tracking-tight">
                    {formatMoney(product.starting_price)}
                  </p>
                  <p className="mt-1 text-sm text-black/45">
                    {formatMoney(
                      product.starting_price / configuration.minimumQuantity,
                    )}{" "}
                    each at {configuration.minimumQuantity} pcs
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                    <Truck size={19} />
                  </span>
                  <span>
                    <strong className="block">Ready in {deliveryTime}</strong>
                    <span className="text-black/45">Singapore-wide delivery</span>
                  </span>
                </div>
              </div>

              <a
                href="#configure-product"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#ef4d11]"
              >
                Configure this product
                <ChevronRight size={17} className="rotate-90" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="configure-product" className="scroll-mt-24">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,1fr)_330px]">
          <main className="min-w-0 px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8440d]">
              Make it yours
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Configure your print
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-black/55">
              Choose your format, paper, finish, quantity, and artwork. Your
              preview and price update as you go.
            </p>

            <div className="mt-10 space-y-12">
            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/55">
                Size <span className="text-[#ef4d11]">*</span>
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {configuration.sizes.map((option) => {
                  const selected = selectedSize === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedSize(option.id);
                        setAddStatus("idle");
                      }}
                      className={`relative min-h-24 rounded-2xl border bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#ef4d11]/60 ${
                        selected
                          ? "border-[#ef4d11] bg-[#fff9f6] shadow-[0_0_0_1px_#ef4d11]"
                          : "border-black/15"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-[#ef4d11] text-white">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      )}
                      <span className="block pr-6 font-extrabold">{option.label}</span>
                      <span className="mt-1 block text-sm text-black/50">
                        {option.dimensions}
                      </span>
                      {option.priceAdjustment !== 0 && (
                        <span className="mt-2 block text-xs font-bold text-[#d8440d]">
                          {formatAdjustment(option.priceAdjustment)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/55">
                Paper stock <span className="text-[#ef4d11]">*</span>
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {configuration.stocks.map((option) => {
                  const selected = selectedStock === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedStock(option.id);
                        setAddStatus("idle");
                      }}
                      className={`relative min-h-44 rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#ef4d11]/60 ${
                        selected
                          ? "border-[#ef4d11] bg-[#fff9f6] shadow-[0_0_0_1px_#ef4d11]"
                          : "border-black/15"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-[#ef4d11] text-white">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      )}
                      <span className="block pr-6 text-lg font-extrabold">
                        {option.label}
                      </span>
                      <span className="mt-2 block text-sm leading-5 text-black/50">
                        {option.description}
                      </span>
                      <span className="mt-5 block text-sm font-extrabold text-[#d8440d]">
                        {formatAdjustment(option.priceAdjustment)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/55">
                Finish <span className="text-[#ef4d11]">*</span>
              </legend>
              <div className="mt-4 flex flex-wrap gap-3">
                {configuration.finishes.map((option) => {
                  const selected = selectedFinish === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedFinish(option.id);
                        setAddStatus("idle");
                      }}
                      className={`flex items-center gap-2 rounded-full border bg-white px-4 py-3 text-sm font-bold transition hover:border-[#ef4d11]/60 ${
                        selected
                          ? "border-[#ef4d11] bg-[#fff9f6] text-[#d8440d] shadow-[0_0_0_1px_#ef4d11]"
                          : "border-black/15"
                      }`}
                    >
                      <span
                        className="size-3 rounded-full border border-black/10"
                        style={{ background: option.swatch }}
                      />
                      {option.label}
                      <span className={selected ? "text-[#d8440d]" : "text-black/45"}>
                        {option.priceAdjustment === 0
                          ? ""
                          : formatAdjustment(option.priceAdjustment)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/55">
                Printing sides
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {configuration.sides.map((option) => {
                  const selected = selectedSides === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedSides(option.id);
                        setAddStatus("idle");
                      }}
                      className={`rounded-2xl border bg-white px-5 py-5 text-center transition hover:border-[#ef4d11]/60 ${
                        selected
                          ? "border-[#ef4d11] bg-[#fff9f6] shadow-[0_0_0_1px_#ef4d11]"
                          : "border-black/15"
                      }`}
                    >
                      <span className="block font-extrabold">{option.label}</span>
                      <span className="mt-1 block text-sm font-bold text-[#d8440d]">
                        {formatAdjustment(option.priceAdjustment)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/55">
                Production time
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {configuration.turnaround.map((option) => {
                  const selected = selectedTurnaround === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedTurnaround(option.id);
                        setAddStatus("idle");
                      }}
                      className={`rounded-2xl border bg-white px-4 py-5 text-center transition hover:-translate-y-0.5 hover:border-[#ef4d11]/60 ${
                        selected
                          ? "border-[#ef4d11] bg-[#fff9f6] shadow-[0_0_0_1px_#ef4d11]"
                          : "border-black/15"
                      }`}
                    >
                      <span className="block text-2xl font-black">{option.label}</span>
                      <span className="mt-1 block text-sm text-black/50">
                        {option.description}
                      </span>
                      <span className="mt-2 block text-sm font-extrabold text-[#d8440d]">
                        {formatAdjustment(option.priceAdjustment)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/55">
                Quantity
              </legend>
              <div className="mt-4 flex w-fit overflow-hidden rounded-2xl border border-black/15 bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= configuration.minimumQuantity}
                  onClick={() => updateQuantity(-1)}
                  className="grid size-14 place-items-center border-r border-black/10 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={18} />
                </button>
                <input
                  aria-label="Quantity"
                  type="number"
                  min={configuration.minimumQuantity}
                  step={configuration.quantityStep}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="h-14 w-24 bg-transparent text-center text-lg font-black outline-none"
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(1)}
                  className="grid size-14 place-items-center border-l border-black/10 transition hover:bg-black/5"
                >
                  <Plus size={18} />
                </button>
              </div>
              <p className="mt-3 text-sm text-black/50">
                Minimum <strong className="text-[#d8440d]">{configuration.minimumQuantity} pcs</strong>
                {" · "}increments of {configuration.quantityStep}
                {pricing.volumeDiscount > 0 && (
                  <span className="font-bold text-emerald-700">
                    {" · "}volume saving {formatMoney(pricing.volumeDiscount)}
                  </span>
                )}
              </p>
            </fieldset>

            <fieldset id="design-options" className="scroll-mt-36">
              <legend className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/55">
                Your design <span className="text-[#ef4d11]">*</span>
              </legend>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div
                  className={`relative rounded-3xl border bg-white p-6 transition ${
                    designMethod === "editor"
                      ? "border-[#ef4d11] bg-[#fff9f6] shadow-[0_0_0_1px_#ef4d11]"
                      : "border-black/15"
                  }`}
                >
                  <span className="absolute right-4 top-4 rounded-full bg-[#ef4d11]/10 px-3 py-1 text-[11px] font-extrabold text-[#c93806]">
                    Recommended
                  </span>
                  <div className="grid size-14 place-items-center rounded-2xl bg-[#ef4d11]/10 text-[#ef4d11]">
                    <Pencil size={24} />
                  </div>
                  <h2 className="mt-5 text-xl font-black">Design online</h2>
                  <p className="mt-2 text-sm leading-6 text-black/50">
                    Build your artwork in the PAPR editor with templates, brand colors, and print-safe sizing.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDesignMethod("editor");
                        setUploadedFile(null);
                        setAddStatus("idle");
                        setAddError("");
                      }}
                      className={`rounded-full px-5 py-3 text-sm font-extrabold transition ${
                        designMethod === "editor"
                          ? "bg-[#ef4d11] text-white"
                          : "bg-black text-white hover:bg-[#ef4d11]"
                      }`}
                    >
                      {designMethod === "editor" ? "Selected" : "Choose editor"}
                    </button>
                    <Link
                      to={editorLink}
                      onClick={() => setDesignMethod("editor")}
                      className="rounded-full border border-black/15 px-5 py-3 text-sm font-extrabold transition hover:bg-white"
                    >
                      Open editor
                    </Link>
                  </div>
                </div>

                <div
                  className={`rounded-3xl border border-dashed bg-white p-6 transition ${
                    designMethod === "upload"
                      ? "border-[#ef4d11] bg-[#fff9f6] shadow-[0_0_0_1px_#ef4d11]"
                      : "border-black/20"
                  }`}
                >
                  <div className="grid size-14 place-items-center rounded-2xl bg-black/5 text-black/70">
                    <Upload size={24} />
                  </div>
                  <h2 className="mt-5 text-xl font-black">Upload print-ready file</h2>
                  <p className="mt-2 text-sm leading-6 text-black/50">
                    Upload a PDF, PNG, TIFF, or JPG file up to 50 MB. Files are
                    stored privately under your account.
                  </p>
                  <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ef4d11]">
                    <Upload size={15} />
                    {uploadedFile ? "Replace file" : "Choose file"}
                    <input
                      className="sr-only"
                      type="file"
                      accept=".pdf,.png,.tif,.tiff,.jpg,.jpeg,application/pdf,image/png,image/jpeg,image/tiff"
                      onChange={handleUpload}
                    />
                  </label>
                  {uploadedFile && (
                    <p className="mt-3 flex items-center gap-2 truncate text-sm font-bold text-emerald-700">
                      <FileCheck2 size={16} />
                      {uploadedFile.name}
                    </p>
                  )}
                </div>
              </div>
              {addStatus === "error" && !designMethod && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {addError}
                </p>
              )}
            </fieldset>
            </div>

            <section
              id="purchase-panel"
              aria-labelledby="order-summary-heading"
              className="mt-14 overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm"
            >
              <div className="grid xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
                <div className="p-6 sm:p-8">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#d8440d]">
                    Final review
                  </p>
                  <h2
                    id="order-summary-heading"
                    className="mt-2 text-3xl font-black tracking-[-0.04em]"
                  >
                    Price summary
                  </h2>
                  <dl className="mt-7 space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-black/55">
                        Base price ({configuration.minimumQuantity} pcs)
                      </dt>
                      <dd className="font-extrabold">
                        {formatMoney(product.starting_price)}
                      </dd>
                    </div>
                    {pricing.optionAdjustment !== 0 && (
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-black/55">Selected upgrades</dt>
                        <dd className="font-extrabold">
                          {pricing.optionAdjustment > 0 ? "+" : "−"}
                          {formatMoney(Math.abs(pricing.optionAdjustment))}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-black/55">
                        Quantity ({quantity} pcs)
                      </dt>
                      <dd className="font-extrabold">
                        ×{pricing.quantityMultiplier.toFixed(1)}
                      </dd>
                    </div>
                    {pricing.volumeDiscount > 0 && (
                      <div className="flex items-center justify-between gap-4 text-emerald-700">
                        <dt>Volume discount</dt>
                        <dd className="font-extrabold">
                          −{formatMoney(pricing.volumeDiscount)}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <div className="my-6 h-px bg-black/10" />
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-lg font-black">Total</span>
                    <span className="text-right text-4xl font-black tracking-tight text-[#e5470e]">
                      {formatMoney(pricing.total)}
                    </span>
                  </div>
                  <p className="mt-2 text-right text-xs text-black/45">
                    {formatMoney(pricing.perUnit)} per piece · tax calculated at
                    checkout
                  </p>
                </div>

                <div className="border-t border-black/10 bg-[#11100e] p-6 text-white sm:p-8 xl:border-l xl:border-t-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/45">
                    Your configuration
                  </p>
                  <h3 className="mt-2 text-2xl font-black">
                    Ready to print?
                  </h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedOptions.map((option, index) => (
                      <span
                        key={option.id + "-" + index}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/70"
                      >
                        {option.label}
                      </span>
                    ))}
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/70">
                      {quantity} pcs
                    </span>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-white/55">
                    {designMethod === "editor"
                      ? "Artwork: PAPR online editor"
                      : designMethod === "upload"
                        ? "Artwork: " + (uploadedFile?.name ?? "uploaded file")
                        : "Choose an artwork option above before adding this item."}
                  </p>

                  {addStatus === "success" ? (
                    <div className="mt-6 rounded-2xl bg-emerald-700 p-5 text-white">
                      <p className="flex items-center gap-2 font-extrabold">
                        <Check size={19} strokeWidth={3} /> Added to your cart
                      </p>
                      <Link
                        to="/cart"
                        className="mt-4 flex w-full items-center justify-center rounded-xl bg-white px-5 py-4 font-extrabold text-emerald-800"
                      >
                        Review cart
                      </Link>
                    </div>
                  ) : (
                    <>
                      {addStatus === "error" && designMethod && (
                        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                          {addError}
                        </p>
                      )}
                      <button
                        type="button"
                        disabled={addStatus === "submitting"}
                        onClick={handleAddToCart}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ef4d11] px-6 py-5 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(239,77,17,0.2)] transition hover:-translate-y-0.5 hover:bg-[#ff5a1f] disabled:cursor-wait disabled:opacity-60"
                      >
                        <ShoppingCart size={20} />
                        {addStatus === "submitting"
                          ? "Saving securely…"
                          : "Add to cart"}
                      </button>
                    </>
                  )}

                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center text-[11px] font-bold leading-tight text-white/50">
                    <div className="flex flex-col items-center gap-2">
                      <PackageCheck className="text-emerald-400" size={21} />
                      Free artwork proof
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <LockKeyhole className="text-amber-400" size={21} />
                      Secure payment
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="text-[#ff6a32]" size={21} />
                      {deliveryTime} delivery
                    </div>
                  </div>
                </div>
              </div>
            </section>
        </main>

        <aside className="min-w-0 border-t border-black/10 p-5 sm:p-8 lg:sticky lg:top-24 lg:self-start lg:border-l lg:border-t-0">
          <div className="rounded-3xl border border-black/10 bg-[#faf7f1] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#d8440d]">
                  Live preview
                </p>
                <h2 className="mt-1 text-xl font-black">{product.name}</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                Updates live
              </span>
            </div>
            <div className="mt-5 flex min-h-64 items-center justify-center overflow-hidden rounded-2xl bg-white p-8 shadow-sm">
              <div
                className={`relative flex items-center justify-center border border-black/10 bg-gradient-to-br from-white to-[#eee6d8] shadow-xl ${
                  isFlyer ? "aspect-[1/1.414] w-40 rounded-md" : "aspect-[1.67/1] w-64 rounded-xl"
                }`}
              >
                <span className="select-none text-6xl" aria-hidden="true">
                  {activePreview.emoji}
                </span>
                <span className="absolute bottom-3 left-3 right-3 truncate text-center text-[10px] font-extrabold uppercase tracking-widest text-black/45">
                  {product.name} · {selectedSizeOption?.label}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {configuration.previewChoices.map((choice, index) => (
                <button
                  key={choice.label}
                  type="button"
                  aria-label={`Preview ${choice.label}`}
                  aria-pressed={previewIndex === index}
                  onClick={() => setPreviewIndex(index)}
                  className={`grid size-14 place-items-center rounded-xl border bg-white text-2xl transition ${
                    previewIndex === index
                      ? "border-[#ef4d11] shadow-[0_0_0_1px_#ef4d11]"
                      : "border-transparent hover:border-black/15"
                  }`}
                >
                  {choice.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-black/10 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-black">Your selections</h3>
              <a
                href="#purchase-panel"
                className="text-xs font-extrabold text-[#d8440d] underline decoration-[#d8440d]/30 underline-offset-4"
              >
                Review order
              </a>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              {selectionSummary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4"
                >
                  <dt className="text-black/45">{item.label}</dt>
                  <dd className="text-right font-extrabold">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="my-5 h-px bg-black/10" />
            <div className="flex items-end justify-between gap-4">
              <span className="text-sm font-bold text-black/50">Current total</span>
              <span className="text-2xl font-black tracking-tight text-[#e5470e]">
                {formatMoney(pricing.total)}
              </span>
            </div>
          </div>
        </aside>
      </div>
      </section>
    </div>
  );
}

export default ProductDetailsPage;
