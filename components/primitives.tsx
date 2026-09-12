"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ImagePlus, LoaderCircle, Leaf } from "lucide-react";
import { useState } from "react";
import { imageFromFile } from "@/lib/storage";
export function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className={`modal ${wide ? "wide" : ""}`}>
          <div className="modal-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <X size={19} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Upload({
  value,
  onChange,
  label = "Add a photo (optional)",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="upload-wrap">
      <label className={`upload ${value ? "has-photo" : ""}`}>
        {value ? (
          <img src={value} alt="Selected photo preview" />
        ) : busy ? (
          <LoaderCircle className="spin" />
        ) : (
          <ImagePlus size={26} />
        )}
        <span>
          {busy ? "Preparing photo…" : value ? "Change photo" : label}
        </span>
        <small>JPG, PNG or WebP · up to 8 MB</small>
        <input
          aria-label={label}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            setError("");
            try {
              onChange(await imageFromFile(f));
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Could not load this image.",
              );
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {value && (
        <button
          type="button"
          className="text-button small"
          onClick={() => onChange("")}
        >
          Remove photo
        </button>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Leaf size={30} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}
export function Photo({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  ) : (
    <div className={`photo-fallback ${className}`} role="img" aria-label={alt}>
      <Leaf size={40} />
    </div>
  );
}
