import { useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import {
  getFallbackProfile,
  loadCustomerAccountData,
  type CustomerAccountData,
} from "../account/accountService";
import { MAX_SAVED_ADDRESSES } from "../account/savedAddresses";
import type { SavedAddressDraft } from "../account/savedAddresses";
import { AuthContext } from "./authContextCore";

type AccountState = CustomerAccountData & {
  userId: string | null;
  error: string;
};

const emptyAccountState: AccountState = {
  userId: null,
  error: "",
  profile: { fullName: "", company: "", whatsapp: "" },
  favoriteProductIds: [],
  savedAddresses: [],
  customerFiles: [],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accountState, setAccountState] =
    useState<AccountState>(emptyAccountState);
  const currentUserIdRef = useRef<string | null>(null);
  const accountRequestVersionRef = useRef(0);

  useEffect(() => {
    currentUserIdRef.current = user?.id ?? null;
  }, [user?.id]);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const requestVersion = ++accountRequestVersionRef.current;

    if (!user) return;

    loadCustomerAccountData(user)
      .then((data) => {
        if (
          !cancelled &&
          accountRequestVersionRef.current === requestVersion
        ) {
          setAccountState({ ...data, userId: user.id, error: "" });
        }
      })
      .catch((error: unknown) => {
        if (
          cancelled ||
          accountRequestVersionRef.current !== requestVersion
        ) {
          return;
        }
        console.error("Failed to load private customer data:", error);
        setAccountState({
          ...emptyAccountState,
          userId: user.id,
          profile: getFallbackProfile(user),
          error:
            "We couldn't securely load your account data. Please refresh and try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const ownsLoadedState = Boolean(user && accountState.userId === user.id);
  const profile = ownsLoadedState ? accountState.profile : null;
  const favoriteProductIds = ownsLoadedState
    ? accountState.favoriteProductIds
    : [];
  const savedAddresses = ownsLoadedState ? accountState.savedAddresses : [];
  const customerFiles = ownsLoadedState ? accountState.customerFiles : [];
  const accountError = ownsLoadedState ? accountState.error : "";
  const loading =
    authLoading || Boolean(user && accountState.userId !== user.id);

  async function refreshAccountData() {
    if (!user) {
      setAccountState(emptyAccountState);
      return;
    }

    const requestedUser = user;
    const requestVersion = ++accountRequestVersionRef.current;
    const data = await loadCustomerAccountData(requestedUser);
    if (
      currentUserIdRef.current !== requestedUser.id ||
      accountRequestVersionRef.current !== requestVersion
    ) {
      return;
    }
    setAccountState({ ...data, userId: requestedUser.id, error: "" });
  }

  async function signUp(
    email: string,
    password: string,
    nextProfile?: { fullName: string; company?: string },
  ) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: nextProfile
        ? {
            data: {
              full_name: nextProfile.fullName,
              company: nextProfile.company || null,
            },
          }
        : undefined,
    });

    if (error) throw error;
  }

  async function signIn(email: string, password: string) {
    accountRequestVersionRef.current += 1;
    setAccountState(emptyAccountState);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async function signOut() {
    accountRequestVersionRef.current += 1;
    setAccountState(emptyAccountState);
    setUser(null);
    setSession(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      throw error;
    }
  }

  async function updateProfile(nextProfile: {
    fullName: string;
    company?: string;
    whatsapp?: string;
  }) {
    if (!user) throw new Error("Sign in to update your profile.");

    const { error } = await supabase.from("customer_profiles").upsert(
      {
        user_id: user.id,
        full_name: nextProfile.fullName.trim(),
        company: nextProfile.company?.trim() || null,
        whatsapp: nextProfile.whatsapp?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) throw error;
    await refreshAccountData();
  }

  async function toggleFavoriteProduct(productId: string) {
    if (!user) throw new Error("Sign in to pin favorite products.");

    const isFavorite = favoriteProductIds.includes(productId);
    const query = isFavorite
      ? supabase
          .from("favorite_products")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId)
      : supabase.from("favorite_products").insert({
          user_id: user.id,
          product_id: productId,
        });
    const { error } = await query;

    if (error) throw error;
    setAccountState((current) =>
      current.userId === user.id
        ? {
            ...current,
            favoriteProductIds: isFavorite
              ? current.favoriteProductIds.filter((id) => id !== productId)
              : [...current.favoriteProductIds, productId],
          }
        : current,
    );
  }

  async function clearExistingDefaultAddress() {
    if (!user) throw new Error("Sign in to manage saved addresses.");

    const { error } = await supabase
      .from("saved_addresses")
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_default", true);

    if (error) throw error;
  }

  async function restoreDefaultAddress(addressId: string | undefined) {
    if (!user || !addressId) return;

    await supabase
      .from("saved_addresses")
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("id", addressId);
  }

  async function upsertSavedAddress(address: SavedAddressDraft) {
    if (!user) throw new Error("Sign in to manage saved addresses.");

    const normalizedAddress = {
      label: address.label.trim(),
      recipient_name: address.recipientName.trim(),
      company: address.company.trim() || null,
      phone: address.phone.trim(),
      line_1: address.line1.trim(),
      line_2: address.line2.trim() || null,
      postal_code: address.postalCode.replace(/\s/g, "").trim(),
      country_code: "SG",
      updated_at: new Date().toISOString(),
    };

    if (
      !normalizedAddress.label ||
      !normalizedAddress.recipient_name ||
      !normalizedAddress.phone ||
      !normalizedAddress.line_1
    ) {
      throw new Error("Please complete all required address fields.");
    }

    if (!/^\d{6}$/.test(normalizedAddress.postal_code)) {
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

    const previousDefaultId = savedAddresses.find(
      (savedAddress) => savedAddress.isDefault,
    )?.id;
    const shouldBeDefault =
      savedAddresses.length === 0 ||
      address.makeDefault === true ||
      existingAddress?.isDefault === true;
    const changingDefault =
      shouldBeDefault && previousDefaultId !== existingAddress?.id;

    if (changingDefault) await clearExistingDefaultAddress();

    try {
      const query = existingAddress
        ? supabase
            .from("saved_addresses")
            .update({ ...normalizedAddress, is_default: shouldBeDefault })
            .eq("user_id", user.id)
            .eq("id", existingAddress.id)
        : supabase.from("saved_addresses").insert({
            ...normalizedAddress,
            user_id: user.id,
            is_default: shouldBeDefault,
          });
      const { error } = await query;

      if (error) throw error;
    } catch (error) {
      if (changingDefault) await restoreDefaultAddress(previousDefaultId);
      throw error;
    }

    await refreshAccountData();
  }

  async function removeSavedAddress(addressId: string) {
    if (!user) throw new Error("Sign in to manage saved addresses.");

    const removedAddress = savedAddresses.find(
      (address) => address.id === addressId,
    );
    if (!removedAddress) return;

    const { error } = await supabase
      .from("saved_addresses")
      .delete()
      .eq("user_id", user.id)
      .eq("id", addressId);

    if (error) throw error;

    if (removedAddress.isDefault) {
      const nextAddress = savedAddresses.find(
        (address) => address.id !== addressId,
      );
      await restoreDefaultAddress(nextAddress?.id);
    }

    await refreshAccountData();
  }

  async function setDefaultAddress(addressId: string) {
    if (!user) throw new Error("Sign in to manage saved addresses.");
    if (!savedAddresses.some((address) => address.id === addressId)) {
      throw new Error("That saved address could not be found.");
    }

    const previousDefaultId = savedAddresses.find(
      (address) => address.isDefault,
    )?.id;

    await clearExistingDefaultAddress();
    const { error } = await supabase
      .from("saved_addresses")
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("id", addressId);

    if (error) {
      await restoreDefaultAddress(previousDefaultId);
      throw error;
    }

    await refreshAccountData();
  }

  async function createCustomerFileDownloadUrl(fileId: string) {
    if (!user) throw new Error("Sign in to access customer artwork.");

    const customerFile = customerFiles.find((file) => file.id === fileId);
    if (!customerFile) throw new Error("That artwork file could not be found.");

    const { data, error } = await supabase.storage
      .from(customerFile.bucketId)
      .createSignedUrl(customerFile.storagePath, 60, {
        download: customerFile.originalFilename,
      });

    if (error) throw error;
    return data.signedUrl;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        accountError,
        profile,
        favoriteProductIds,
        savedAddresses,
        customerFiles,
        signUp,
        signIn,
        signOut,
        updateProfile,
        toggleFavoriteProduct,
        upsertSavedAddress,
        removeSavedAddress,
        setDefaultAddress,
        refreshAccountData,
        createCustomerFileDownloadUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
