import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Palette,
  PackageSearch,
  Settings,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

const accountLinks = [
  { label: "Overview", to: "/account", icon: LayoutDashboard },
  {
    label: "Orders & tracking",
    to: "/account?tab=orders",
    icon: PackageSearch,
  },
  {
    label: "Saved artwork",
    to: "/account?tab=artwork",
    icon: Palette,
  },
  {
    label: "Pinned favorites",
    to: "/account?tab=favorites",
    icon: Heart,
  },
  {
    label: "Saved addresses",
    to: "/account?tab=addresses",
    icon: MapPin,
  },
  { label: "Settings", to: "/account?tab=settings", icon: Settings },
] as const;

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ProfileMenu() {
  const { user, loading, signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (loading) {
    return <div className="h-11 w-28 animate-pulse rounded-full bg-black/10" />;
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-bold text-white transition hover:scale-105 sm:px-5"
      >
        <UserRound size={18} />
        <span className="hidden sm:inline">Get started</span>
      </Link>
    );
  }

  const displayName =
    typeof user.user_metadata.full_name === "string" &&
    user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : user.email?.split("@")[0] || "Account";
  const initials = getInitials(displayName) || "P";

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await signOut();
      setOpen(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full bg-black py-2 pl-2 pr-3 text-sm font-bold text-white transition hover:bg-[#ef4d11]"
      >
        <span className="grid size-8 place-items-center rounded-full bg-[#ef4d11] text-xs font-black text-white">
          {initials}
        </span>
        <span className="hidden max-w-24 truncate sm:block">
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown
          size={15}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 text-black shadow-[0_20px_60px_rgba(17,16,14,0.18)]"
        >
          <div className="border-b border-black/10 px-3 pb-3 pt-2">
            <p className="truncate text-sm font-extrabold">{displayName}</p>
            <p className="mt-1 truncate text-xs text-black/45">{user.email}</p>
          </div>

          <div className="py-2">
            {accountLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                role="menuitem"
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-black/60 transition hover:bg-[#f5f1ea] hover:text-black"
              >
                <Icon size={17} className="text-[#d8440d]" /> {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-black/10 pt-2">
            <button
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut size={17} /> {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
