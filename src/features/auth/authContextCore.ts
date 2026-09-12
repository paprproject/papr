import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type {
  SavedAddress,
  SavedAddressDraft,
} from "../account/savedAddresses";
import type {
  CustomerFile,
  CustomerOrder,
  CustomerProfile,
} from "../account/accountService";

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accountError: string;
  profile: CustomerProfile | null;
  favoriteProductIds: string[];
  savedAddresses: SavedAddress[];
  customerFiles: CustomerFile[];
  orders: CustomerOrder[];
  signUp: (
    email: string,
    password: string,
    profile?: { fullName: string; company?: string },
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: {
    fullName: string;
    company?: string;
    whatsapp?: string;
  }) => Promise<void>;
  toggleFavoriteProduct: (productId: string) => Promise<void>;
  upsertSavedAddress: (address: SavedAddressDraft) => Promise<void>;
  removeSavedAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  refreshAccountData: () => Promise<void>;
  createCustomerFileDownloadUrl: (fileId: string) => Promise<string>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
