import { useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";

function LoginPage() {
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      if (isSignup) {
        await signUp(email, password);
        alert("Account created. Check your email.");
      } else {
        await signIn(email, password);
        alert("Logged in successfully.");
      }
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            alert(error.message);
        } else {
            alert("Authentication failed.");
        }
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-md">
        <h1 className="text-5xl font-black">
          {isSignup ? "Create account" : "Welcome back"}
        </h1>

        <p className="mt-4 text-black/60">
          {isSignup
            ? "Create your PAPR account to start ordering prints."
            : "Login to manage orders, carts, and print projects."}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white p-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white p-4"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-600 py-4 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : isSignup ? "Create Account" : "Login"}
          </button>

          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="w-full text-sm font-bold text-black/60"
          >
            {isSignup ? "Already have an account? Login" : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;