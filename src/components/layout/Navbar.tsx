import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import ProfileMenu from "./ProfileMenu";

function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 bg-[#f5f1ea]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-3xl font-black tracking-tight">
            PAP<span className="text-orange-600">R</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-black/70 lg:flex">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/quote">Instant Quote</Link>
            <Link to="/b2b">B2B</Link>
            <Link to="/contact">Contact Us</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-3 text-sm font-bold text-black/70 transition hover:bg-white"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Cart</span>
          </Link>

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
