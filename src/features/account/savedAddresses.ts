export const MAX_SAVED_ADDRESSES = 5;

export type SavedAddress = {
  id: string;
  label: string;
  recipientName: string;
  company: string;
  phone: string;
  line1: string;
  line2: string;
  postalCode: string;
  countryCode: "SG";
  isDefault: boolean;
};

export type SavedAddressDraft = Omit<SavedAddress, "id" | "isDefault"> & {
  id?: string;
  makeDefault?: boolean;
};

export type SavedAddressRow = {
  id: string;
  label: string;
  recipient_name: string;
  company: string | null;
  phone: string;
  line_1: string;
  line_2: string | null;
  postal_code: string;
  country_code: string;
  is_default: boolean;
};

export function savedAddressFromRow(row: SavedAddressRow): SavedAddress {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    company: row.company ?? "",
    phone: row.phone,
    line1: row.line_1,
    line2: row.line_2 ?? "",
    postalCode: row.postal_code,
    countryCode: "SG",
    isDefault: row.is_default,
  };
}
