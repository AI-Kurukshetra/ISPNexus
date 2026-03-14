"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/48 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_32px_80px_rgba(10,32,51,0.24)]">
        <p className="ui-eyebrow">{tone === "danger" ? "High Impact" : "Confirmation"}</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="ui-button-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={`ui-button-primary ${
              tone === "danger" ? "!bg-rose-600 !shadow-[0_14px_28px_rgba(190,24,93,0.18)]" : ""
            }`}
          >
            {isPending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
