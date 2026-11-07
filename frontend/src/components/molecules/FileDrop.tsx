"use client";

import { FileText, UploadCloud } from "lucide-react";
import { useId, useState, type DragEvent, type ReactNode } from "react";

import { classNames } from "@/lib/ui/class-names";

export type FileDropLabels = { prompt: string; hint: string; replace: string };

type FileDropProps = {
  /** Called with the chosen file. */
  onFile: (file: File) => void;
  /** The file already chosen, shown in place of the prompt. */
  file?: File | null;
  accept?: string;
  labels: FileDropLabels;
  /** Extra content under the file name, for example its fingerprint. */
  detail?: ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  /** Ties the drop zone to an outside label or hint. */
  id?: string;
  "aria-describedby"?: string;
};

/** A large target to drop a file on, or click to choose one. The native input keeps it keyboard accessible. */
export function FileDrop({
  onFile,
  file,
  accept,
  labels,
  detail,
  invalid,
  disabled,
  id,
  "aria-describedby": describedBy,
}: FileDropProps) {
  const ownId = useId();
  const inputId = id ?? ownId;
  const [dragging, setDragging] = useState(false);

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped && !disabled) onFile(dropped);
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={classNames(
        "flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-card border-2 border-dashed px-6 py-8 text-center transition-colors duration-200 focus-within:ring-2 focus-within:ring-royal",
        dragging ? "border-royal bg-royal-soft" : "border-hairline-strong bg-mist hover:border-lavender hover:bg-royal-soft/60",
        invalid && "border-wine",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="sr-only"
        onChange={(event) => {
          const chosen = event.target.files?.[0];
          if (chosen) onFile(chosen);
          event.target.value = "";
        }}
      />
      {file ? (
        <>
          <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-royal text-on-royal">
            <FileText className="size-6" />
          </span>
          <span className="max-w-full truncate text-base font-semibold text-ink">{file.name}</span>
          {detail}
          <span className="text-sm font-semibold text-royal">{labels.replace}</span>
        </>
      ) : (
        <>
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-cloud text-royal shadow-card"
          >
            <UploadCloud className="size-6" />
          </span>
          <span className="text-base font-semibold text-ink">{labels.prompt}</span>
          <span className="text-sm text-ink-faint">{labels.hint}</span>
        </>
      )}
    </label>
  );
}
