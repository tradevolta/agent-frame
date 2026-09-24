"use client";
import { useState } from "react";

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <input readOnly value={value} className="input" aria-label="Link" />
      <button className="btn-ghost shrink-0" onClick={() => navigator.clipboard.writeText(value).then(() => setCopied(true))}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
