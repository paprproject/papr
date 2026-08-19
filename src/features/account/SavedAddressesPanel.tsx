import { useState } from "react";
import type { FormEvent } from "react";
import {
  Check,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../auth/useAuth";
import {
  MAX_SAVED_ADDRESSES,
  type SavedAddress,
} from "./savedAddresses";

function SavedAddressesPanel() {
  const {
    savedAddresses,
    upsertSavedAddress,
    removeSavedAddress,
    setDefaultAddress,
  } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(
    null,
  );
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null,
  );
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function openNewAddressForm() {
    setEditingAddress(null);
    setShowForm(true);
    setDeletingAddressId(null);
    setError("");
    setSuccess("");
  }

  function openEditAddressForm(address: SavedAddress) {
    setEditingAddress(address);
    setShowForm(true);
    setDeletingAddressId(null);
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setEditingAddress(null);
    setShowForm(false);
    setError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const postalCode = String(formData.get("postalCode") ?? "")
      .replace(/\s/g, "")
      .trim();

    if (!/^\d{6}$/.test(postalCode)) {
      setError("Please enter a valid 6-digit Singapore postal code.");
      return;
    }

    try {
      setBusyAction("save");
      await upsertSavedAddress({
        id: editingAddress?.id,
        label: String(formData.get("label") ?? ""),
        recipientName: String(formData.get("recipientName") ?? ""),
        company: String(formData.get("company") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        line1: String(formData.get("line1") ?? ""),
        line2: String(formData.get("line2") ?? ""),
        postalCode,
        countryCode: "SG",
        makeDefault: formData.get("makeDefault") === "on",
      });
      setShowForm(false);
      setEditingAddress(null);
      setSuccess(editingAddress ? "Address updated." : "Address saved.");
    } catch (saveError) {
      console.error("Failed to save address:", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "We couldn't save this address. Please try again.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSetDefault(addressId: string) {
    setError("");
    setSuccess("");

    try {
      setBusyAction(`default:${addressId}`);
      await setDefaultAddress(addressId);
      setSuccess("Default delivery address updated.");
    } catch (defaultError) {
      console.error("Failed to set default address:", defaultError);
      setError("We couldn't update your default address. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRemove(addressId: string) {
    setError("");
    setSuccess("");

    try {
      setBusyAction(`delete:${addressId}`);
      await removeSavedAddress(addressId);
      setDeletingAddressId(null);
      setSuccess("Address removed.");
    } catch (removeError) {
      console.error("Failed to remove address:", removeError);
      setError("We couldn't remove this address. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8440d]">
            Saved addresses
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
            Make delivery details effortless.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
            Save up to {MAX_SAVED_ADDRESSES} Singapore delivery addresses and
            choose the one you use most often.
          </p>
        </div>
        {!showForm && savedAddresses.length < MAX_SAVED_ADDRESSES && (
          <button
            type="button"
            onClick={openNewAddressForm}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#ef4d11] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#d9410c]"
          >
            <Plus size={17} /> Add address
          </button>
        )}
      </div>

      <div aria-live="polite">
        {error && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <Check size={17} /> {success}
          </p>
        )}
      </div>

      {showForm && (
        <AddressForm
          key={editingAddress?.id ?? "new-address"}
          address={editingAddress}
          isFirstAddress={savedAddresses.length === 0}
          saving={busyAction === "save"}
          onCancel={closeForm}
          onSubmit={handleSave}
        />
      )}

      {!showForm && savedAddresses.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-12 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f5f1ea] text-[#d8440d]">
            <MapPin size={24} />
          </span>
          <h3 className="mt-5 text-lg font-black">No saved addresses yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">
            Add your first delivery address now and spend less time entering it
            again at checkout.
          </p>
          <button
            type="button"
            onClick={openNewAddressForm}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ef4d11]"
          >
            Add your first address <Plus size={15} />
          </button>
        </div>
      ) : (
        !showForm && (
          <div className="mt-7 grid gap-4 xl:grid-cols-2">
            {savedAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                busyAction={busyAction}
                confirmingDelete={deletingAddressId === address.id}
                onEdit={() => openEditAddressForm(address)}
                onSetDefault={() => handleSetDefault(address.id)}
                onRequestDelete={() => {
                  setDeletingAddressId(address.id);
                  setError("");
                  setSuccess("");
                }}
                onCancelDelete={() => setDeletingAddressId(null)}
                onConfirmDelete={() => handleRemove(address.id)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function AddressForm({
  address,
  isFirstAddress,
  saving,
  onCancel,
  onSubmit,
}: {
  address: SavedAddress | null;
  isFirstAddress: boolean;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-7 rounded-2xl border border-black/10 bg-white p-5 sm:p-7"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-black">
            {address ? "Edit address" : "Add a delivery address"}
          </p>
          <p className="mt-1 text-xs text-black/40">
            Fields marked with * are required.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close address form"
          className="grid size-10 place-items-center rounded-full border border-black/10 text-black/45 transition hover:bg-[#f5f1ea] hover:text-black"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <AddressField
          label="Address label *"
          name="label"
          defaultValue={address?.label ?? ""}
          autoComplete="off"
          placeholder="Home or Main office"
          required
          maxLength={30}
        />
        <AddressField
          label="Recipient full name *"
          name="recipientName"
          defaultValue={address?.recipientName ?? ""}
          autoComplete="name"
          placeholder="Priya Lim"
          required
        />
        <AddressField
          label="Company"
          name="company"
          defaultValue={address?.company ?? ""}
          autoComplete="organization"
          placeholder="PAPR Pte. Ltd."
        />
        <AddressField
          label="Mobile / WhatsApp *"
          name="phone"
          type="tel"
          defaultValue={address?.phone ?? ""}
          autoComplete="tel"
          placeholder="+65 8123 4567"
          required
        />
        <div className="sm:col-span-2">
          <AddressField
            label="Street address *"
            name="line1"
            defaultValue={address?.line1 ?? ""}
            autoComplete="address-line1"
            placeholder="71 Ayer Rajah Crescent"
            required
          />
        </div>
        <AddressField
          label="Unit / floor"
          name="line2"
          defaultValue={address?.line2 ?? ""}
          autoComplete="address-line2"
          placeholder="#03-18"
        />
        <AddressField
          label="Postal code *"
          name="postalCode"
          inputMode="numeric"
          defaultValue={address?.postalCode ?? ""}
          autoComplete="postal-code"
          placeholder="139951"
          pattern="[0-9]{6}"
          maxLength={6}
          required
        />
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold text-black/65">Country</span>
          <select
            name="countryCode"
            defaultValue="SG"
            autoComplete="country"
            className="mt-2 w-full rounded-xl border border-black/15 bg-[#faf7f1] px-4 py-3.5 text-sm outline-none"
          >
            <option value="SG">Singapore</option>
          </select>
        </label>
      </div>

      {!address?.isDefault && (
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-[#f5f1ea] p-4">
          <input
            type="checkbox"
            name="makeDefault"
            defaultChecked={isFirstAddress}
            className="mt-0.5 size-4 accent-[#ef4d11]"
          />
          <span>
            <span className="block text-sm font-extrabold">
              Use as my default delivery address
            </span>
            <span className="mt-1 block text-xs leading-5 text-black/45">
              We’ll preselect it when you check out.
            </span>
          </span>
        </label>
      )}

      {address?.isDefault && (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-[#ef4d11]/10 p-4 text-sm font-bold text-[#bd3909]">
          <Star size={16} fill="currentColor" /> This is your current default
          delivery address.
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-black/15 px-5 py-3 text-sm font-extrabold text-black/60 transition hover:bg-[#f5f1ea] hover:text-black"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#ef4d11] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#d9410c] disabled:cursor-wait disabled:opacity-50"
        >
          {saving ? "Saving…" : address ? "Save changes" : "Save address"}
        </button>
      </div>
    </form>
  );
}

function AddressCard({
  address,
  busyAction,
  confirmingDelete,
  onEdit,
  onSetDefault,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  address: SavedAddress;
  busyAction: string | null;
  confirmingDelete: boolean;
  onEdit: () => void;
  onSetDefault: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const isBusy = busyAction !== null;

  return (
    <article
      className={`flex min-h-72 flex-col rounded-2xl border bg-white p-5 sm:p-6 ${
        address.isDefault
          ? "border-[#ef4d11]/45 shadow-[0_12px_30px_rgba(239,77,17,0.08)]"
          : "border-black/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#f5f1ea] text-[#d8440d]">
            <MapPin size={19} />
          </span>
          <div>
            <h3 className="font-black">{address.label}</h3>
            {address.isDefault && (
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#d8440d]">
                <Star size={11} fill="currentColor" /> Default
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          disabled={isBusy}
          onClick={onEdit}
          aria-label={`Edit ${address.label}`}
          className="grid size-9 place-items-center rounded-full border border-black/10 text-black/45 transition hover:bg-[#f5f1ea] hover:text-black disabled:opacity-40"
        >
          <Pencil size={15} />
        </button>
      </div>

      <div className="mt-5 text-sm leading-6 text-black/55">
        <p className="font-extrabold text-black">{address.recipientName}</p>
        {address.company && <p>{address.company}</p>}
        <p className="mt-2">{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>Singapore {address.postalCode}</p>
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-black/50">
          <Phone size={14} /> {address.phone}
        </p>
      </div>

      <div className="mt-auto pt-6">
        {confirmingDelete ? (
          <div className="rounded-xl bg-red-50 p-3">
            <p className="text-xs font-bold text-red-800">
              Remove this saved address?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={onCancelDelete}
                className="rounded-full bg-white px-3 py-2 text-xs font-extrabold text-black/55"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={onConfirmDelete}
                className="rounded-full bg-red-700 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
              >
                {busyAction === `delete:${address.id}` ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 border-t border-black/10 pt-4">
            {!address.isDefault && (
              <button
                type="button"
                disabled={isBusy}
                onClick={onSetDefault}
                className="text-xs font-extrabold text-[#c93806] disabled:opacity-40"
              >
                {busyAction === `default:${address.id}`
                  ? "Updating…"
                  : "Set as default"}
              </button>
            )}
            <button
              type="button"
              disabled={isBusy}
              onClick={onRequestDelete}
              className="ml-auto flex items-center gap-1.5 text-xs font-bold text-red-700 disabled:opacity-40"
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function AddressField({
  label,
  name,
  defaultValue,
  autoComplete,
  placeholder,
  type = "text",
  inputMode,
  pattern,
  maxLength,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  autoComplete: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric";
  pattern?: string;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-black/65">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        required={required}
        className="mt-2 w-full rounded-xl border border-black/15 bg-[#faf7f1] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-[#ef4d11] focus:bg-white focus:ring-4 focus:ring-[#ef4d11]/10"
      />
    </label>
  );
}

export default SavedAddressesPanel;
