"use client";

import { useActionState } from "react";
import { type ProductFormState, uploadFileAction } from "../actions";

const initial: ProductFormState = { error: null };

export function FileUploadForm({ productId, allowBasePdf }: { productId: string; allowBasePdf: boolean }) {
  const [state, action, pending] = useActionState(uploadFileAction, initial);

  return (
    <form action={action} style={{ display: "grid", gap: 10, maxWidth: 480 }}>
      <input type="hidden" name="product_id" value={productId} />
      <label>
        Jenis file
        <select
          name="kind"
          defaultValue={allowBasePdf ? "base_pdf" : "asset"}
          style={{ marginLeft: 8, padding: "6px 8px", borderRadius: 6 }}
        >
          <option value="asset">Aset utama (yang dikirim ke pembeli)</option>
          {allowBasePdf && <option value="base_pdf">Base PDF (untuk PDF terproteksi)</option>}
          <option value="preview">Preview (contoh publik)</option>
        </select>
      </label>
      <input type="file" name="file" required />
      {state.error && <p style={{ color: "#b91c1c", margin: 0 }}>{state.error}</p>}
      <button
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          cursor: "pointer",
          width: "fit-content",
        }}
        disabled={pending}
      >
        {pending ? "Mengunggah…" : "Unggah file"}
      </button>
    </form>
  );
}
