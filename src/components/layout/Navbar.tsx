import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="w-full border-b border-black/10 bg-[#f5f1ea]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        
        <Link
          to="/"
          className="text-3xl font-black tracking-tight"
        >
          PAPR
        </Link>

        <nav className="flex items-center gap-8 text-sm font-medium">
          <Link to="/products">Products</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/b2b">B2B</Link>
          <Link to="/faq">FAQ</Link>
        </nav>

      </div>
    </header>
  );
}

export default Navbar;