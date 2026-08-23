import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  FileCheck2,
  Layers3,
  LockKeyhole,
  LogOut,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";

type AuthMode = "login" | "signup";

function LoginPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signIn, signUp, signOut } =
    useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setPassword("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "signup" && fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (mode === "signup" && password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);

      if (mode === "signup") {
        await signUp(email, password, {
          fullName: fullName.trim(),
          company: company.trim() || undefined,
        });
        setSuccess(
          "Account created. Check your inbox to confirm your email, then sign in.",
        );
        setPassword("");
      } else {
        await signIn(email, password);
        navigate("/account");
      }
    } catch (authError) {
      console.error("Authentication failed:", authError);
      setError(
        authError instanceof Error
          ? authError.message
          : "We couldn't complete that request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    try {
      setSubmitting(true);
      setError("");
      await signOut();
    } catch (authError) {
      console.error("Sign out failed:", authError);
      setError("We couldn't sign you out. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-6 py-16">
        <div className="mx-auto grid max-w-6xl animate-pulse overflow-hidden rounded-[2rem] bg-white lg:grid-cols-2">
          <div className="min-h-[520px] bg-black/10" />
          <div className="min-h-[520px] bg-black/5" />
        </div>
      </section>
    );
  }

  if (user) {
    const displayName = profile?.fullName || "PAPR customer";

    return (
      <section className="min-h-[70vh] bg-[#f5f1ea] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-black/10 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <Check size={30} strokeWidth={3} />
          </div>
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">
            Signed in
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">
            Welcome, {displayName}.
          </h1>
          <p className="mt-3 text-black/50">{user.email}</p>

          {error && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              to="/account"
              className="flex items-center justify-center gap-2 rounded-full bg-black px-6 py-4 font-extrabold text-white transition hover:bg-[#ef4d11]"
            >
              Open your account <ArrowRight size={17} />
            </Link>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 rounded-full border border-black/15 px-6 py-4 font-extrabold text-black/60 transition hover:border-red-300 hover:text-red-700 disabled:opacity-50"
            >
              <LogOut size={17} /> {submitting ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f5f1ea] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_80px_rgba(17,16,14,0.1)] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative overflow-hidden bg-[#11100e] px-7 py-10 text-white sm:px-10 sm:py-12 lg:min-h-[680px] lg:px-12 lg:py-14">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-72 rounded-full bg-[#ef4d11]/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-24 size-80 rounded-full bg-[#ef4d11]/15 blur-3xl"
          />

          <div className="relative flex h-full flex-col">
            <Link
              to="/"
              aria-label="PAPR home"
              className="w-fit text-3xl font-black tracking-[-0.06em]"
            >
              PAP<span className="text-[#ff5a1f]">R</span>
            </Link>

            <div className="my-auto py-12 lg:py-16">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#ff6a32]">
                <Sparkles size={15} /> Your print workspace
              </p>
              <h1 className="mt-5 max-w-md text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                Your orders, designs, and savings in one place.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/50 sm:text-base">
                Sign in once to manage every print job—from the first proof to
                delivery and easy reorders.
              </p>

              <ul className="mt-9 space-y-4 text-sm font-semibold text-white/70">
                <li className="flex items-center gap-3">
                  <PackageCheck className="text-[#ff6a32]" size={19} />
                  Track current and previous orders
                </li>
                <li className="flex items-center gap-3">
                  <Layers3 className="text-[#ff6a32]" size={19} />
                  Reuse saved designs and brand assets
                </li>
                <li className="flex items-center gap-3">
                  <FileCheck2 className="text-[#ff6a32]" size={19} />
                  Reorder approved artwork in a few clicks
                </li>
              </ul>
            </div>

            <p className="flex items-center gap-2 text-xs text-white/35">
              <ShieldCheck size={15} className="text-emerald-400" /> Secured by
              Supabase authentication
            </p>
          </div>
        </aside>

        <div className="flex items-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <div
              className="grid grid-cols-2 rounded-xl bg-[#f2ede3] p-1"
              role="tablist"
              aria-label="Authentication options"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                onClick={() => changeMode("login")}
                className={`rounded-lg px-4 py-3 text-sm font-extrabold transition ${
                  mode === "login"
                    ? "bg-white text-black shadow-sm"
                    : "text-black/45 hover:text-black"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => changeMode("signup")}
                className={`rounded-lg px-4 py-3 text-sm font-extrabold transition ${
                  mode === "signup"
                    ? "bg-white text-black shadow-sm"
                    : "text-black/45 hover:text-black"
                }`}
              >
                Create account
              </button>
            </div>

            <div className="mt-8">
              <h2 className="text-3xl font-black tracking-[-0.04em]">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-black/50">
                {mode === "signup"
                  ? "Save designs, track every order, and unlock volume discounts."
                  : "Sign in to see your orders, saved designs, and reorder in one click."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7">
              {mode === "signup" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold text-black/65">
                      Full name
                    </span>
                    <input
                      required
                      type="text"
                      autoComplete="name"
                      placeholder="Priya Lim"
                      value={fullName}
                      onChange={(event) => {
                        setFullName(event.target.value);
                        setError("");
                      }}
                      className="mt-2 w-full rounded-xl border border-black/15 bg-[#faf7f1] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-[#ef4d11] focus:bg-white focus:ring-4 focus:ring-[#ef4d11]/10"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-black/65">
                      Company <span className="font-medium text-black/35">(optional)</span>
                    </span>
                    <input
                      type="text"
                      autoComplete="organization"
                      placeholder="Growthly Pte. Ltd."
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-black/15 bg-[#faf7f1] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-[#ef4d11] focus:bg-white focus:ring-4 focus:ring-[#ef4d11]/10"
                    />
                  </label>
                </div>
              )}

              <label className={`block ${mode === "signup" ? "mt-4" : ""}`}>
                <span className="text-xs font-bold text-black/65">Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.sg"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  className="mt-2 w-full rounded-xl border border-black/15 bg-[#faf7f1] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-[#ef4d11] focus:bg-white focus:ring-4 focus:ring-[#ef4d11]/10"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-xs font-bold text-black/65">Password</span>
                <span className="relative mt-2 block">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    minLength={mode === "signup" ? 8 : undefined}
                    placeholder={
                      mode === "signup" ? "Minimum 8 characters" : "••••••••"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    className="w-full rounded-xl border border-black/15 bg-[#faf7f1] px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-black/25 focus:border-[#ef4d11] focus:bg-white focus:ring-4 focus:ring-[#ef4d11]/10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-black/35 transition hover:text-black"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700"
                >
                  {error}
                </p>
              )}
              {success && (
                <p
                  role="status"
                  className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold leading-5 text-emerald-800"
                >
                  <Check className="mt-0.5 shrink-0" size={17} /> {success}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef4d11] px-6 py-4 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#d9410c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? mode === "signup"
                    ? "Creating account…"
                    : "Signing in…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
                {!submitting && (
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-5 text-black/35">
              <LockKeyhole size={14} /> Your password is handled securely by
              Supabase and never visible to PAPR staff.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
