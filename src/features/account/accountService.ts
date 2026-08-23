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

export type CustomerAccountData = {
  profile: CustomerProfile;
  favoriteProductIds: string[];
  savedAddresses: SavedAddress[];
  customerFiles: CustomerFile[];
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
  const [profile, favoritesResult, addressesResult, filesResult] =
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
    ]);

  if (favoritesResult.error) throw favoritesResult.error;
  if (addressesResult.error) throw addressesResult.error;
  if (filesResult.error) throw filesResult.error;

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
  };
}

export function getFallbackProfile(user: User): CustomerProfile {
  return getInitialProfile(user);
}
