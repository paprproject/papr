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

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseSavedAddresses(value: unknown): SavedAddress[] {
  if (!Array.isArray(value)) return [];

  const seenIds = new Set<string>();
  const addresses = value.flatMap<SavedAddress>((entry) => {
    if (!entry || typeof entry !== "object") return [];

    const address = entry as Record<string, unknown>;
    const id = readString(address.id);
    const label = readString(address.label);
    const recipientName = readString(address.recipientName);
    const phone = readString(address.phone);
    const line1 = readString(address.line1);
    const postalCode = readString(address.postalCode);

    if (
      !id ||
      seenIds.has(id) ||
      !label ||
      !recipientName ||
      !phone ||
      !line1 ||
      !postalCode
    ) {
      return [];
    }

    seenIds.add(id);
    return [
      {
        id,
        label,
        recipientName,
        company: readString(address.company),
        phone,
        line1,
        line2: readString(address.line2),
        postalCode,
        countryCode: "SG",
        isDefault: address.isDefault === true,
      },
    ];
  });

  const defaultIndex = Math.max(
    0,
    addresses.findIndex((address) => address.isDefault),
  );

  return addresses.map((address, index) => ({
    ...address,
    isDefault: index === defaultIndex,
  }));
}
