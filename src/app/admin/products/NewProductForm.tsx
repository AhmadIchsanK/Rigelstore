"use client";

import { useActionState } from "react";
import { type ProductFormState, createProductAction } from "./actions";

const initial: ProductFormState = { error: null };

const field: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  marginTop: 4,
};

export function NewProductForm() {
  const [state, action, pending] = useActionState(createProductAction, initial);

  return (
    <form action={action} style={{ display: "grid", gap: 14, maxWidth: 520 }}>
      <label>
        Judul produk
        <input style={field} name="title" required />
      </label>

      <label>
        Tipe produk
        <select style={field} name="type" defaultValue="reusable_file">
          <option value="reusable_file">File reusable (stok tak terbatas)</option>
          <option value="unique_credential">Kredensial unik (1 per pembeli)</option>
          <option value="protected_pdf">PDF terproteksi (password unik)</option>
          <option value="bundle">Bundle</option>
        </select>
      </label>

      <label>
        Harga (Rp)
        <input style={field} name="price_idr" inputMode="numeric" defaultValue="0" />
      </label>

      <label>
        Deskripsi (opsional)
        <textarea style={{ ...field, minHeight: 80 }} name="description" />
      </label>

      <label>
        Status
        <select style={field} name="status" defaultValue="draft">
          <option value="draft">Draft (belum tampil)</option>
          <option value="published">Published (tampil di toko)</option>
        </select>
      </label>

      {state.error && <p style={{ color: "#b91c1c", margin: 0 }}>{state.error}</p>}

      <button
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          border: "none",
          background: "var(--brand)",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
        disabled={pending}
      >
        {pending ? "Menyimpan…" : "Simpan produk"}
      </button>
    </form>
  );
}
