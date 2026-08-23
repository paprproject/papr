import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  PackageOpen,
  PackageSearch,
  Palette,
  Settings,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import CustomerArtworkPanel from "../../features/account/CustomerArtworkPanel";
import SavedAddressesPanel from "../../features/account/SavedAddressesPanel";
import { useAuth } from "../../features/auth/useAuth";
import { useCart } from "../../features/cart/CartContext";
import { getProductConfiguration } from "../../features/products/productConfiguration";
import { getProducts } from "../../services/productService";
import type { Product } from "../../types/product";

type AccountTab =
  | "overview"
  | "orders"
  | "artwork"
  | "favorites"
  | "addresses"
  | "settings";

const accountTabs: Array<{
  id: AccountTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders & tracking", icon: PackageSearch },
  { id: "artwork", label: "Saved artwork", icon: Palette },
  { id: "favorites", label: "Pinned favorites", icon: Heart },
  { id: "addresses", label: "Saved addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
];

function isAccountTab(value: string | null): value is AccountTab {
  return accountTabs.some((tab) => tab.id === value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }).format(value);
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function AccountPage() {
  const {
    user,
    loading: authLoading,
    accountError,
    profile,
    favoriteProductIds,
    savedAddresses,
    customerFiles,
    updateProfile,
    signOut,
  } = useAuth();
  const { cartItems, cartLoading, cartError } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab: AccountTab = isAccountTab(requestedTab)
    ? requestedTab
    : "overview";
  const [products, setProducts] = useState<Product[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const productList = await getProducts();
        if (!cancelled) setProducts(productList);
      } catch (error) {
        console.error("Failed to load account favorites:", error);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  if (authLoading || cartLoading) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-6 py-16">
        <div className="mx-auto grid max-w-7xl animate-pulse gap-6 lg:grid-cols-[270px_1fr]">
          <div className="h-[620px] rounded-3xl bg-black/10" />
          <div className="h-[620px] rounded-3xl bg-black/5" />
        </div>
      </section>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const profileFullName = profile?.fullName ?? "";
  const profileCompany = profile?.company ?? "";
  const profileWhatsapp = profile?.whatsapp ?? "";
  const displayName =
    profileFullName.trim() || user.email?.split("@")[0] || "Account";
  const initials = getInitials(displayName) || "P";
  const favoriteProducts = products.filter((product) =>
    favoriteProductIds.includes(product.id),
  );
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.totalPrice ?? item.product.starting_price),
    0,
  );

  function selectTab(tab: AccountTab) {
    setSearchParams(tab === "overview" ? {} : { tab });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSettingsSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsError("");
    setSettingsSaved(false);

    const formData = new FormData(event.currentTarget);
    const nextFullName = String(formData.get("fullName") ?? "").trim();
    const nextCompany = String(formData.get("company") ?? "").trim();
    const nextWhatsapp = String(formData.get("whatsapp") ?? "").trim();

    if (nextFullName.length < 2) {
      setSettingsError("Please enter your full name.");
      return;
    }

    try {
      setSavingSettings(true);
      await updateProfile({
        fullName: nextFullName,
        company: nextCompany || undefined,
        whatsapp: nextWhatsapp || undefined,
      });
      setSettingsSaved(true);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSettingsError(
        error instanceof Error
          ? error.message
          : "We couldn't save your changes. Please try again.",
      );
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <section className="min-h-[70vh] bg-[#f5f1ea] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-black/10 bg-white p-5 shadow-sm lg:sticky lg:top-28 lg:p-6">
          <div className="flex items-center gap-4 border-b border-black/10 pb-5 lg:block">
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-[#ef4d11] text-lg font-black text-white lg:size-16">
              {initials}
            </div>
            <div className="min-w-0 lg:mt-4">
              <h1 className="truncate text-lg font-black">{displayName}</h1>
              <p className="mt-1 truncate text-xs text-black/45">{user.email}</p>
              <span className="mt-3 hidden w-fit items-center gap-1.5 rounded-full bg-[#ef4d11]/10 px-3 py-1 text-[11px] font-extrabold text-[#c93806] lg:flex">
                <Sparkles size={12} /> PAPR member
              </span>
            </div>
          </div>

          <nav
            aria-label="Account sections"
            className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
          >
            {accountTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => selectTab(id)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition lg:w-full ${
                  activeTab === id
                    ? "bg-black text-white"
                    : "text-black/50 hover:bg-[#f5f1ea] hover:text-black"
                }`}
              >
                <Icon
                  size={17}
                  className={activeTab === id ? "text-[#ff6a32]" : ""}
                />
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            disabled={signingOut}
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center gap-3 rounded-xl border border-red-200 px-4 py-3 text-left text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut size={17} /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </aside>

        <main className="min-w-0 rounded-3xl border border-black/10 bg-[#faf7f1] p-5 shadow-sm sm:p-7 lg:p-9">
          {(accountError || cartError) && (
            <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {accountError || cartError}
            </p>
          )}
          {activeTab === "overview" && (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8440d]">
                Your PAPR account
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Good to see you, {displayName.split(" ")[0]}.
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/50">
                Keep an eye on your print work, designs, favorites, and account
                details from one place.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-5">
                <StatCard value="0" label="Confirmed orders" />
                <StatCard value={String(cartItems.length)} label="Items in cart" />
                <StatCard
                  value={String(customerFiles.length)}
                  label="Saved artworks"
                />
                <StatCard
                  value={String(favoriteProductIds.length)}
                  label="Pinned favorites"
                />
                <StatCard
                  value={String(savedAddresses.length)}
                  label="Saved addresses"
                />
              </div>

              <section className="mt-9">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/40">
                      Current activity
                    </p>
                    <h3 className="mt-2 text-xl font-black">Your active cart</h3>
                  </div>
                  {cartItems.length > 0 && (
                    <Link
                      to="/cart"
                      className="text-sm font-extrabold text-[#d8440d]"
                    >
                      Review cart →
                    </Link>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <EmptyAccountState
                    icon={ShoppingBag}
                    title="Your cart is ready for a project"
                    description="Configure a print product and it will appear here for a quick return to checkout."
                    actionLabel="Browse products"
                    actionTo="/products"
                  />
                ) : (
                  <div className="mt-4 space-y-3">
                    {cartItems.slice(0, 3).map((item) => (
                      <article
                        key={item.id}
                        className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4"
                      >
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#f5f1ea] text-2xl">
                          {getProductConfiguration(item.product).emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-extrabold">
                            {item.product.name}
                          </h4>
                          <p className="mt-1 truncate text-xs text-black/45">
                            {item.size} · {Number(item.quantity).toLocaleString()} pcs
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-black text-[#d8440d]">
                          {formatMoney(
                            item.totalPrice ?? item.product.starting_price,
                          )}
                        </p>
                      </article>
                    ))}
                    <div className="flex items-center justify-between rounded-2xl bg-black px-5 py-4 text-white">
                      <span className="text-sm font-bold text-white/55">
                        Cart total
                      </span>
                      <span className="text-xl font-black text-[#ff6a32]">
                        {formatMoney(cartTotal)}
                      </span>
                    </div>
                  </div>
                )}
              </section>

              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#ef4d11]/20 bg-[#ef4d11]/10 p-5 sm:flex-row sm:items-center">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#d8440d]">
                  <Sparkles size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-extrabold">
                    Volume savings happen automatically
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-black/50">
                    Quantity discounts are reflected live when you configure a
                    product or request an instant quote.
                  </p>
                </div>
                <Link
                  to="/quote"
                  className="flex shrink-0 items-center gap-2 text-sm font-extrabold text-[#c93806]"
                >
                  Get a quote <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8440d]">
                Orders & tracking
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                Follow every print job.
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/50">
                Confirmed orders will show their proof, production, transit, and
                delivery updates here.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Check, label: "Proof approved" },
                  { icon: PackageSearch, label: "In production" },
                  { icon: Truck, label: "SG delivery" },
                ].map(({ icon: Icon, label }, index) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-black/10 bg-white p-5"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-[#ef4d11]/10 text-[#d8440d]">
                      <Icon size={18} />
                    </span>
                    <p className="mt-4 text-sm font-extrabold">
                      {index + 1}. {label}
                    </p>
                  </div>
                ))}
              </div>

              <EmptyAccountState
                icon={PackageOpen}
                title="No confirmed orders yet"
                description="Once you complete checkout, your order timeline and delivery updates will appear here."
                actionLabel="Start a print order"
                actionTo="/products"
              />
              <p className="mt-5 text-center text-xs text-black/40">
                Looking for an existing order?{" "}
                <Link to="/contact" className="font-bold text-[#d8440d]">
                  Contact support
                </Link>
                .
              </p>
            </div>
          )}

          {activeTab === "artwork" && <CustomerArtworkPanel />}

          {activeTab === "favorites" && (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8440d]">
                Pinned favorites
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                Keep repeat products close.
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/50">
                Pin products from the catalog and they will stay synced with
                your PAPR account.
              </p>

              {favoriteProducts.length === 0 ? (
                <EmptyAccountState
                  icon={Heart}
                  title="Nothing pinned yet"
                  description="Use the heart on any product card to add it to this quick-access collection."
                  actionLabel="Browse products"
                  actionTo="/products"
                />
              ) : (
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  {favoriteProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && <SavedAddressesPanel />}

          {activeTab === "settings" && (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8440d]">
                Profile settings
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                Keep your details current.
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/50">
                These details help PAPR prepare proofs and contact you about
                time-sensitive print jobs.
              </p>

              <form
                onSubmit={handleSettingsSave}
                onChange={() => setSettingsSaved(false)}
                className="mt-7 max-w-2xl rounded-2xl border border-black/10 bg-white p-5 sm:p-7"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <SettingsField
                    label="Full name"
                    name="fullName"
                    defaultValue={profileFullName}
                    autoComplete="name"
                    required
                  />
                  <SettingsField
                    label="Company"
                    name="company"
                    defaultValue={profileCompany}
                    autoComplete="organization"
                    placeholder="Growthly Pte. Ltd."
                  />
                  <SettingsField
                    label="Email"
                    name="email"
                    defaultValue={user.email ?? ""}
                    autoComplete="email"
                    disabled
                  />
                  <SettingsField
                    label="WhatsApp number"
                    name="whatsapp"
                    defaultValue={profileWhatsapp}
                    autoComplete="tel"
                    placeholder="+65 8123 4567"
                  />
                </div>

                {settingsError && (
                  <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {settingsError}
                  </p>
                )}
                {settingsSaved && (
                  <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                    <Check size={17} /> Profile settings saved.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="mt-6 rounded-full bg-[#ef4d11] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#d9410c] disabled:opacity-50"
                >
                  {savingSettings ? "Saving…" : "Save changes"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="text-2xl font-black text-[#d8440d] sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-semibold text-black/45">{label}</p>
    </div>
  );
}

function EmptyAccountState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
}: {
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
}) {
  return (
    <div className="mt-7 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-12 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f5f1ea] text-[#d8440d]">
        <Icon size={24} />
      </span>
      <h3 className="mt-5 text-lg font-black">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">
        {description}
      </p>
      <Link
        to={actionTo}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ef4d11]"
      >
        {actionLabel} <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function SettingsField({
  label,
  name,
  defaultValue,
  autoComplete,
  placeholder,
  required,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: string;
  autoComplete: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-black/65">{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="mt-2 w-full rounded-xl border border-black/15 bg-[#faf7f1] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-[#ef4d11] focus:bg-white focus:ring-4 focus:ring-[#ef4d11]/10 disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/40"
      />
    </label>
  );
}

export default AccountPage;
