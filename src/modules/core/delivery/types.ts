/** Tipe hasil pengiriman (aman diimpor dari komponen client sebagai type). */
export type DeliveryResult =
  | { type: "credential"; value: string }
  | { type: "file"; url: string; filename: string | null }
  | { type: "pdf"; url: string; filename: string | null; password: string }
  | { type: "unavailable"; reason: string };

export type Requester =
  | { kind: "user"; userId: string }
  | { kind: "guest"; orderNumber: string; email: string };
