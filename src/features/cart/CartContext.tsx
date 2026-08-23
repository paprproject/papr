import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../../lib/supabase";
import type { Product } from "../../types/product";
import { useAuth } from "../auth/useAuth";

const ARTWORK_BUCKET = "customer-artwork";
const MAX_ARTWORK_BYTES = 50 * 1024 * 1024;
const artworkMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/tiff",
]);

export type CartItem = {
  id: string;
  product: Product;
  size: string;
  material: string;
  quantity: string;
  finish?: string;
  sides?: string;
  turnaround?: string;
  designMethod?: string;
  designFileName?: string;
  unitPrice?: number;
  totalPrice?: number;
};

export type NewCartItem = Omit<CartItem, "id"> & {
  designFile?: File;
};

type CartContextValue = {
  cartItems: CartItem[];
  cartCount: number;
  cartLoading: boolean;
  cartError: string;
  addToCart: (item: NewCartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

type CartState = {
  userId: string | null;
  items: CartItem[];
  error: string;
};

type CartItemRow = {
  id: string;
  product_snapshot: unknown;
  size: string;
  material: string;
  quantity: number;
  finish: string | null;
  sides: string | null;
  turnaround: string | null;
  design_method: string | null;
  design_file_name: string | null;
  unit_price: number | null;
  total_price: number | null;
};

const emptyCartState: CartState = { userId: null, items: [], error: "" };
const CartContext = createContext<CartContextValue | null>(null);

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<Product>;

  return (
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    typeof product.description === "string" &&
    typeof product.category === "string" &&
    typeof product.starting_price === "number" &&
    typeof product.delivery_days === "string" &&
    typeof product.created_at === "string"
  );
}

function cartItemFromRow(row: CartItemRow): CartItem | null {
  if (!isProduct(row.product_snapshot)) return null;

  return {
    id: row.id,
    product: row.product_snapshot,
    size: row.size,
    material: row.material,
    quantity: String(row.quantity),
    finish: row.finish ?? undefined,
    sides: row.sides ?? undefined,
    turnaround: row.turnaround ?? undefined,
    designMethod: row.design_method ?? undefined,
    designFileName: row.design_file_name ?? undefined,
    unitPrice: row.unit_price ?? undefined,
    totalPrice: row.total_price ?? undefined,
  };
}

async function loadCartItems(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id, product_snapshot, size, material, quantity, finish, sides, turnaround, design_method, design_file_name, unit_price, total_price",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as CartItemRow[]).flatMap((row) => {
    const item = cartItemFromRow(row);
    return item ? [item] : [];
  });
}

function getArtworkMimeType(file: File) {
  if (artworkMimeTypes.has(file.type)) return file.type;

  const extension = file.name.split(".").pop()?.toLowerCase();
  const inferredTypes: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    tif: "image/tiff",
    tiff: "image/tiff",
  };
  const inferredType = extension ? inferredTypes[extension] : undefined;

  if (!inferredType) {
    throw new Error("Upload a PDF, PNG, JPG, or TIFF artwork file.");
  }
  return inferredType;
}

function getSafeFilename(filename: string) {
  const safeFilename = filename
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(-120);

  return safeFilename || "artwork";
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshAccountData } = useAuth();
  const [cartState, setCartState] = useState<CartState>(emptyCartState);
  const currentUserIdRef = useRef<string | null>(null);
  const cartRequestVersionRef = useRef(0);

  useEffect(() => {
    currentUserIdRef.current = user?.id ?? null;
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    const requestVersion = ++cartRequestVersionRef.current;

    if (!user) return;

    loadCartItems(user.id)
      .then((items) => {
        if (
          !cancelled &&
          cartRequestVersionRef.current === requestVersion
        ) {
          setCartState({ userId: user.id, items, error: "" });
        }
      })
      .catch((error: unknown) => {
        if (cancelled || cartRequestVersionRef.current !== requestVersion) {
          return;
        }
        console.error("Failed to load private cart:", error);
        setCartState({
          userId: user.id,
          items: [],
          error: "We couldn't securely load your cart. Please refresh and try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const ownsLoadedCart = Boolean(user && cartState.userId === user.id);
  const cartItems = ownsLoadedCart ? cartState.items : [];
  const cartError = ownsLoadedCart ? cartState.error : "";
  const cartLoading = Boolean(user && cartState.userId !== user.id);

  async function refreshCart() {
    if (!user) {
      setCartState(emptyCartState);
      return;
    }

    const requestedUserId = user.id;
    const requestVersion = ++cartRequestVersionRef.current;
    const items = await loadCartItems(requestedUserId);
    if (
      currentUserIdRef.current !== requestedUserId ||
      cartRequestVersionRef.current !== requestVersion
    ) {
      return;
    }
    setCartState({ userId: requestedUserId, items, error: "" });
  }

  async function addToCart(item: NewCartItem) {
    if (!user) throw new Error("Sign in before adding products to your cart.");

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Choose a valid print quantity.");
    }

    if (item.designFile && item.designFile.size > MAX_ARTWORK_BYTES) {
      throw new Error("Artwork files must be 50 MB or smaller.");
    }
    const artworkMimeType = item.designFile
      ? getArtworkMimeType(item.designFile)
      : null;
    const requestedUserId = user.id;
    const operationVersion = ++cartRequestVersionRef.current;
    const existingItems = ownsLoadedCart
      ? cartItems
      : await loadCartItems(requestedUserId);
    if (
      !ownsLoadedCart &&
      currentUserIdRef.current === requestedUserId &&
      cartRequestVersionRef.current === operationVersion
    ) {
      setCartState({ userId: requestedUserId, items: existingItems, error: "" });
    }

    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        product_id: item.product.id,
        product_snapshot: item.product,
        size: item.size,
        material: item.material,
        quantity,
        finish: item.finish ?? null,
        sides: item.sides ?? null,
        turnaround: item.turnaround ?? null,
        design_method: item.designMethod ?? null,
        design_file_name: item.designFile?.name ?? item.designFileName ?? null,
        currency: "SGD",
        unit_price: item.unitPrice ?? null,
        total_price: item.totalPrice ?? null,
      })
      .select(
        "id, product_snapshot, size, material, quantity, finish, sides, turnaround, design_method, design_file_name, unit_price, total_price",
      )
      .single();

    if (error) throw error;
    const createdRow = data as CartItemRow;
    let uploadedPath: string | null = null;

    try {
      if (item.designFile) {
        uploadedPath = `${user.id}/${crypto.randomUUID()}/${getSafeFilename(item.designFile.name)}`;
        const { error: uploadError } = await supabase.storage
          .from(ARTWORK_BUCKET)
          .upload(uploadedPath, item.designFile, {
            cacheControl: "3600",
            contentType: artworkMimeType ?? undefined,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { error: metadataError } = await supabase
          .from("customer_files")
          .insert({
            user_id: user.id,
            cart_item_id: createdRow.id,
            bucket_id: ARTWORK_BUCKET,
            storage_path: uploadedPath,
            original_filename: item.designFile.name,
            mime_type: artworkMimeType,
            size_bytes: item.designFile.size,
            status: "attached_to_cart",
          });

        if (metadataError) throw metadataError;
      }
    } catch (uploadError) {
      if (uploadedPath) {
        await supabase.storage.from(ARTWORK_BUCKET).remove([uploadedPath]);
      }
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("id", createdRow.id);
      throw uploadError;
    }

    const createdItem = cartItemFromRow(createdRow);
    if (
      createdItem &&
      currentUserIdRef.current === requestedUserId &&
      cartRequestVersionRef.current === operationVersion
    ) {
      setCartState({
        userId: requestedUserId,
        items: [...existingItems, createdItem],
        error: "",
      });
    }

    if (item.designFile) {
      refreshAccountData().catch((refreshError: unknown) => {
        console.error("Failed to refresh uploaded artwork:", refreshError);
      });
    }
  }

  async function removeFromCart(id: string) {
    if (!user) throw new Error("Sign in to update your cart.");
    const operationVersion = ++cartRequestVersionRef.current;

    const { error: detachError } = await supabase
      .from("customer_files")
      .update({
        cart_item_id: null,
        status: "uploaded",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("cart_item_id", id);

    if (detachError) throw detachError;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id);

    if (error) throw error;
    if (
      currentUserIdRef.current === user.id &&
      cartRequestVersionRef.current === operationVersion
    ) {
      setCartState({
        userId: user.id,
        items: cartItems.filter((cartItem) => cartItem.id !== id),
        error: "",
      });
    }
    refreshAccountData().catch(console.error);
  }

  async function clearCart() {
    if (!user) throw new Error("Sign in to update your cart.");
    const operationVersion = ++cartRequestVersionRef.current;

    const { error: detachError } = await supabase
      .from("customer_files")
      .update({
        cart_item_id: null,
        status: "uploaded",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .not("cart_item_id", "is", null);

    if (detachError) throw detachError;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) throw error;
    if (
      currentUserIdRef.current === user.id &&
      cartRequestVersionRef.current === operationVersion
    ) {
      setCartState({ userId: user.id, items: [], error: "" });
    }
    refreshAccountData().catch(console.error);
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount: cartItems.length,
        cartLoading,
        cartError,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// This hook intentionally lives beside its provider so cart state has one public entry point.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);

  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
