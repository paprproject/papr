import { useState } from "react";
import { Download, FileText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CustomerArtworkPanel() {
  const { customerFiles, createCustomerFileDownloadUrl } = useAuth();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDownload(fileId: string) {
    setError("");
    try {
      setDownloadingId(fileId);
      const downloadUrl = await createCustomerFileDownloadUrl(fileId);
      window.location.assign(downloadUrl);
    } catch (downloadError) {
      console.error("Failed to download customer artwork:", downloadError);
      setError("We couldn't prepare this private download. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8440d]">
        Saved artwork
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
        Your private artwork library.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
        Files uploaded with print configurations are stored privately and only
        made available through short-lived authenticated downloads.
      </p>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {customerFiles.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-12 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f5f1ea] text-[#d8440d]">
            <FileText size={24} />
          </span>
          <h3 className="mt-5 text-lg font-black">No uploaded artwork yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">
            Upload a print-ready file while configuring a product and it will
            appear here under your account only.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-flex rounded-full bg-black px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ef4d11]"
          >
            Choose a product
          </Link>
        </div>
      ) : (
        <div className="mt-7 space-y-3">
          {customerFiles.map((file) => (
            <article
              key={file.id}
              className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5 sm:flex-row sm:items-center"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#f5f1ea] text-[#d8440d]">
                <FileText size={21} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-extrabold">
                  {file.originalFilename}
                </h3>
                <p className="mt-1 text-xs text-black/45">
                  {formatFileSize(file.sizeBytes)} · Uploaded{" "}
                  {new Date(file.createdAt).toLocaleDateString("en-SG")}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck size={13} /> Private customer file
                </p>
              </div>
              <button
                type="button"
                disabled={downloadingId !== null}
                onClick={() => handleDownload(file.id)}
                className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-black/15 px-4 py-2.5 text-xs font-extrabold text-black/60 transition hover:border-[#ef4d11] hover:text-[#d8440d] disabled:opacity-50"
              >
                <Download size={15} />
                {downloadingId === file.id ? "Preparing…" : "Download"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerArtworkPanel;
