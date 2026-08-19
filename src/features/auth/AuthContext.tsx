import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import {
  MAX_SAVED_ADDRESSES,
  parseSavedAddresses,
} from "../account/savedAddresses";
import type { SavedAddressDraft } from "../account/savedAddresses";
import { AuthContext } from "./authContextCore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(
    email: string,
    password: string,
    profile?: { fullName: string; company?: string },
  ) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: profile
        ? {
            data: {
              full_name: profile.fullName,
              company: profile.company || null,
            },
          }
        : undefined,
    });

    if (error) throw error;
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  }

  async function updateProfile(profile: {
    fullName: string;
    company?: string;
    whatsapp?: string;
  }) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...user?.user_metadata,
        full_name: profile.fullName,
        company: profile.company || null,
        whatsapp: profile.whatsapp || null,
      },
    });

    if (error) throw error;
    setUser(data.user);
  }

  const favoriteProductIds = Array.isArray(
    user?.user_metadata.favorite_product_ids,
  )
    ? user.user_metadata.favorite_product_ids.filter(
        (value: unknown): value is string => typeof value === "string",
      )
    : [];
  const savedAddresses = parseSavedAddresses(
    user?.user_metadata.saved_addresses,
  );

  async function toggleFavoriteProduct(productId: string) {
    if (!user) throw new Error("Sign in to pin favorite products.");

    const nextFavorites = favoriteProductIds.includes(productId)
      ? favoriteProductIds.filter((id) => id !== productId)
      : [...favoriteProductIds, productId];
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        favorite_product_ids: nextFavorites,
      },
    });

    if (error) throw error;
    setUser(data.user);
  }

  async function updateSavedAddresses(
    nextAddresses: ReturnType<typeof parseSavedAddresses>,
  ) {
    if (!user) throw new Error("Sign in to manage saved addresses.");

    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        saved_addresses: nextAddresses,
      },
    });

    if (error) throw error;
    setUser(data.user);
  }

  async function upsertSavedAddress(address: SavedAddressDraft) {
    if (!user) throw new Error("Sign in to manage saved addresses.");

    const normalizedAddress = {
      label: address.label.trim(),
      recipientName: address.recipientName.trim(),
      company: address.company.trim(),
      phone: address.phone.trim(),
      line1: address.line1.trim(),
      line2: address.line2.trim(),
      postalCode: address.postalCode.replace(/\s/g, "").trim(),
    };

    if (
      !normalizedAddress.label ||
      !normalizedAddress.recipientName ||
      !normalizedAddress.phone ||
      !normalizedAddress.line1
    ) {
      throw new Error("Please complete all required address fields.");
    }

    if (!/^\d{6}$/.test(normalizedAddress.postalCode)) {
      throw new Error("Please enter a valid 6-digit Singapore postal code.");
    }

    const existingAddress = address.id
      ? savedAddresses.find((savedAddress) => savedAddress.id === address.id)
      : undefined;

    if (!existingAddress && savedAddresses.length >= MAX_SAVED_ADDRESSES) {
      throw new Error(
        `You can save up to ${MAX_SAVED_ADDRESSES} delivery addresses.`,
      );
    }

    const shouldBeDefault =
      savedAddresses.length === 0 ||
      address.makeDefault === true ||
      existingAddress?.isDefault === true;
    const nextAddress = {
      id: existingAddress?.id ?? crypto.randomUUID(),
      ...normalizedAddress,
      countryCode: "SG" as const,
      isDefault: shouldBeDefault,
    };
    const nextAddresses = existingAddress
      ? savedAddresses.map((savedAddress) =>
          savedAddress.id === existingAddress.id
            ? nextAddress
            : {
                ...savedAddress,
                isDefault: shouldBeDefault ? false : savedAddress.isDefault,
              },
        )
      : [
          ...savedAddresses.map((savedAddress) => ({
            ...savedAddress,
            isDefault: shouldBeDefault ? false : savedAddress.isDefault,
          })),
          nextAddress,
        ];

    await updateSavedAddresses(nextAddresses);
  }

  async function removeSavedAddress(addressId: string) {
    const remainingAddresses = savedAddresses.filter(
      (address) => address.id !== addressId,
    );

    if (remainingAddresses.length === savedAddresses.length) return;

    const hasDefaultAddress = remainingAddresses.some(
      (address) => address.isDefault,
    );
    await updateSavedAddresses(
      remainingAddresses.map((address, index) => ({
        ...address,
        isDefault: hasDefaultAddress ? address.isDefault : index === 0,
      })),
    );
  }

  async function setDefaultAddress(addressId: string) {
    if (!savedAddresses.some((address) => address.id === addressId)) {
      throw new Error("That saved address could not be found.");
    }

    await updateSavedAddresses(
      savedAddresses.map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      })),
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        favoriteProductIds,
        savedAddresses,
        signUp,
        signIn,
        signOut,
        updateProfile,
        toggleFavoriteProduct,
        upsertSavedAddress,
        removeSavedAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
