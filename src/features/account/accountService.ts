import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import {
  savedAddressFromRow,
  type SavedAddress,
  type SavedAddressRow,
} from "./savedAddresses";

export type CustomerProfile = {
  fullName: string;
  company: string;
  whatsapp: string;
};

export type CustomerFile = {
  id: string;
  cartItemId: string | null;
  bucketId: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  status: "uploaded" | "attached_to_cart" | "submitted" | "archived";
  createdAt: string;
};

export type CustomerOrderItem = {
  id: string;
  productName: string;
  quantity: number;
  totalPriceCents: number;
  size: string;
  material: string;
  finish: string;
};

export type CustomerOrder = {
  id: string;
  status:
    | "pending_payment"
    | "paid"
    | "payment_failed"
    | "cancelled"
    | "refunded";
  currency: string;
  totalCents: number;
  deliveryMethod: "standard" | "priority";
  deliveryAddress: {
    recipientName?: string;
    postalCode?: string;
  };
  paidAt: string | null;
  createdAt: string;
  items: CustomerOrderItem[];
};

export type CustomerAccountData = {
  profile: CustomerProfile;
  favoriteProductIds: string[];
  savedAddresses: SavedAddress[];
  customerFiles: CustomerFile[];
  orders: CustomerOrder[];
};

type CustomerProfileRow = {
  full_name: string;
  company: string | null;
  whatsapp: string | null;
};

type FavoriteProductRow = { product_id: string };

type CustomerFileRow = {
  id: string;
  cart_item_id: string | null;
  bucket_id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  status: CustomerFile["status"];
  created_at: string;
};

type CustomerOrderItemRow = {
  id: string;
  product_snapshot: unknown;
  configuration: unknown;
  quantity: number;
  total_price_cents: number;
};

type CustomerOrderRow = {
  id: string;
  status: CustomerOrder["status"];
  currency: string;
  total_cents: number;
  delivery_method: CustomerOrder["deliveryMethod"];
  delivery_address: unknown;
  paid_at: string | null;
  created_at: string;
  order_items: CustomerOrderItemRow[] | null;
};

function getStringProperty(value: unknown, property: string) {
  if (!value || typeof value !== "object") return "";
  const propertyValue = (value as Record<string, unknown>)[property];
  return typeof propertyValue === "string" ? propertyValue : "";
}

function customerOrderFromRow(row: CustomerOrderRow): CustomerOrder {
  return {
    id: row.id,
    status: row.status,
    currency: row.currency,
    totalCents: row.total_cents,
    deliveryMethod: row.delivery_method,
    deliveryAddress: {
      recipientName: getStringProperty(row.delivery_address, "recipientName"),
      postalCode: getStringProperty(row.delivery_address, "postalCode"),
    },
    paidAt: row.paid_at,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      productName:
        getStringProperty(item.product_snapshot, "name") || "Print product",
      quantity: item.quantity,
      totalPriceCents: item.total_price_cents,
      size: getStringProperty(item.configuration, "size"),
      material: getStringProperty(item.configuration, "material"),
      finish: getStringProperty(item.configuration, "finish"),
    })),
  };
}

function profileFromRow(row: CustomerProfileRow): CustomerProfile {
  return {
    fullName: row.full_name,
    company: row.company ?? "",
    whatsapp: row.whatsapp ?? "",
  };
}

function getInitialProfile(user: User): CustomerProfile {
  const metadataName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  const emailName = user.email?.split("@")[0]?.trim() ?? "";
  const fullName =
    (metadataName.length >= 2 ? metadataName : "") ||
    (emailName.length >= 2 ? emailName : "PAPR customer");

  return {
    fullName,
    company:
      typeof user.user_metadata.company === "string"
        ? user.user_metadata.company.trim()
        : "",
    whatsapp: "",
  };
}

function customerFileFromRow(row: CustomerFileRow): CustomerFile {
  return {
    id: row.id,
    cartItemId: row.cart_item_id,
    bucketId: row.bucket_id,
    storagePath: row.storage_path,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function loadOrCreateProfile(user: User): Promise<CustomerProfile> {
  const { data: existingProfile, error: profileError } = await supabase
    .from("customer_profiles")
    .select("full_name, company, whatsapp")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (existingProfile) {
    return profileFromRow(existingProfile as CustomerProfileRow);
  }

  const initialProfile = getInitialProfile(user);
  const { data: createdProfile, error: createError } = await supabase
    .from("customer_profiles")
    .upsert(
      {
        user_id: user.id,
        full_name: initialProfile.fullName,
        company: initialProfile.company || null,
        whatsapp: null,
      },
      { onConflict: "user_id" },
    )
    .select("full_name, company, whatsapp")
    .single();

  if (createError) throw createError;
  return profileFromRow(createdProfile as CustomerProfileRow);
}

export async function loadCustomerAccountData(
  user: User,
): Promise<CustomerAccountData> {
  const [profile, favoritesResult, addressesResult, filesResult, ordersResult] =
    await Promise.all([
      loadOrCreateProfile(user),
      supabase
        .from("favorite_products")
        .select("product_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("saved_addresses")
        .select(
          "id, label, recipient_name, company, phone, line_1, line_2, postal_code, country_code, is_default",
        )
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true }),
      supabase
        .from("customer_files")
        .select(
          "id, cart_item_id, bucket_id, storage_path, original_filename, mime_type, size_bytes, status, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select(
          "id, status, currency, total_cents, delivery_method, delivery_address, paid_at, created_at, order_items(id, product_snapshot, configuration, quantity, total_price_cents)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  if (favoritesResult.error) throw favoritesResult.error;
  if (addressesResult.error) throw addressesResult.error;
  if (filesResult.error) throw filesResult.error;
  if (ordersResult.error) throw ordersResult.error;

  return {
    profile,
    favoriteProductIds: (
      (favoritesResult.data ?? []) as FavoriteProductRow[]
    ).map((favorite) => favorite.product_id),
    savedAddresses: (
      (addressesResult.data ?? []) as SavedAddressRow[]
    ).map(savedAddressFromRow),
    customerFiles: ((filesResult.data ?? []) as CustomerFileRow[]).map(
      customerFileFromRow,
    ),
    orders: ((ordersResult.data ?? []) as CustomerOrderRow[]).map(
      customerOrderFromRow,
    ),
  };
}

export function getFallbackProfile(user: User): CustomerProfile {
  return getInitialProfile(user);
}
