import "server-only";

/**
 * Handler update Telegram. Storefront Telegram memakai CORE yang sama dengan
 * website (produk, order, delivery) — bukan sistem terpisah. Order yang dibuat
 * di sini muncul juga di admin website (satu database).
 *
 * Catatan keamanan: tidak pernah meminta pembeli menempel kredensial di chat.
 * Kredensial hanya DIKIRIM ke pembeli setelah pembayaran & verifikasi.
 */
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";
import {
  getPublishedProduct,
  listPublishedProducts,
} from "@modules/core/products/service";
import {
  getOrderStatus,
  listOrdersByGuestEmail,
  placeOrder,
} from "@modules/core/orders/service";
import { deliver, lookupGuestOrder } from "@modules/core/delivery/service";
import { syntheticEmailForTelegram } from "./identity";
import {
  type InlineKeyboard,
  answerCallbackQuery,
  sendMessage,
  sendPhoto,
} from "./api";

type TgUser = { id: number; username?: string; first_name?: string };
type TgUpdate = {
  message?: { chat: { id: number }; from?: TgUser; text?: string };
  callback_query?: { id: string; from?: TgUser; message?: { chat: { id: number } }; data?: string };
};

function rupiah(n: number | string) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function rememberUser(u?: TgUser) {
  if (!u) return;
  const supabase = createSupabaseAdminClient();
  await supabase.from("telegram_users").upsert(
    {
      telegram_id: u.id,
      username: u.username ?? null,
      first_name: u.first_name ?? null,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "telegram_id" },
  );
}

async function sendCatalog(chatId: number) {
  const products = await listPublishedProducts(20);
  if (products.length === 0) {
    await sendMessage(chatId, "Belum ada produk tersedia. Cek lagi nanti ya.");
    return;
  }
  const keyboard: InlineKeyboard = products.map((p) => [
    { text: `${p.title} — ${rupiah(p.price_idr)}`, callback_data: `p:${p.id}` },
  ]);
  await sendMessage(chatId, "🛍 <b>Katalog RigelStore</b>\nPilih produk:", keyboard);
}

async function sendProduct(chatId: number, productId: string) {
  const p = await getPublishedProduct(productId);
  if (!p) {
    await sendMessage(chatId, "Produk tidak tersedia.");
    return;
  }
  const text =
    `<b>${p.title}</b>\n${rupiah(p.price_idr)}\n\n` +
    (p.description ? `${p.description}\n\n` : "") +
    "Bayar via QRIS. Barang dikirim otomatis setelah lunas.";
  const keyboard: InlineKeyboard = [
    [{ text: "🛒 Beli (QRIS)", callback_data: `buy:${p.id}` }],
    [{ text: "⬅️ Katalog", callback_data: "catalog" }],
  ];
  await sendMessage(chatId, text, keyboard);
}

async function doBuy(chatId: number, user: TgUser, productId: string) {
  const email = syntheticEmailForTelegram(user.id);
  let orderNumber: string;
  let totalIdr: number;
  let qrUrl: string | null = null;
  try {
    const placed = await placeOrder({
      userId: null,
      guestEmail: email,
      items: [{ productId, quantity: 1 }],
    });
    orderNumber = placed.orderNumber;
    totalIdr = placed.totalIdr;
    qrUrl = placed.qrUrl;
  } catch (e) {
    if (e instanceof Error && e.message === "OUT_OF_STOCK") {
      await sendMessage(chatId, "Maaf, stok barang ini baru saja habis.");
      return;
    }
    await sendMessage(chatId, "Gagal membuat order. Coba lagi.");
    return;
  }

  const checkoutUrl = `${appUrl()}/checkout/${orderNumber}`;
  const keyboard: InlineKeyboard = [
    [{ text: "💳 Buka halaman pembayaran", url: checkoutUrl }],
    [
      { text: "🔄 Cek status", callback_data: `st:${orderNumber}` },
      { text: "📥 Ambil barang", callback_data: `dl:${orderNumber}` },
    ],
  ];
  const caption =
    `Order <b>${orderNumber}</b>\nTotal: <b>${rupiah(totalIdr)}</b>\n\n` +
    "Scan QRIS di halaman pembayaran. Setelah lunas, tekan “Ambil barang”.";

  if (qrUrl) {
    await sendPhoto(chatId, qrUrl, caption, keyboard);
  } else {
    await sendMessage(chatId, caption, keyboard);
  }
}

async function sendStatus(chatId: number, orderNumber: string) {
  const status = await getOrderStatus(orderNumber);
  if (!status) {
    await sendMessage(chatId, "Order tidak ditemukan.");
    return;
  }
  const label: Record<string, string> = {
    pending: "⏳ Menunggu pembayaran",
    paid: "✅ Lunas — tekan “Ambil barang”",
    expired: "⌛ Kedaluwarsa",
    cancelled: "❌ Dibatalkan",
    refunded: "↩️ Refund",
  };
  await sendMessage(
    chatId,
    `Order <b>${orderNumber}</b>\nStatus: ${label[status] ?? status}`,
    status === "paid"
      ? [[{ text: "📥 Ambil barang", callback_data: `dl:${orderNumber}` }]]
      : [[{ text: "🔄 Cek lagi", callback_data: `st:${orderNumber}` }]],
  );
}

async function doDeliver(chatId: number, user: TgUser, orderNumber: string) {
  const email = syntheticEmailForTelegram(user.id);
  const found = await lookupGuestOrder(orderNumber, email);
  if (!found) {
    await sendMessage(chatId, "Order tidak ditemukan untuk akun Telegram ini.");
    return;
  }
  if (found.order.status !== "paid") {
    await sendMessage(chatId, "Order belum lunas. Selesaikan pembayaran dulu ya.");
    return;
  }
  if (found.entitlements.length === 0) {
    await sendMessage(chatId, "Belum ada barang aktif pada order ini.");
    return;
  }

  for (const e of found.entitlements) {
    const result = await deliver(e.id, { kind: "guest", orderNumber, email });
    if (result.type === "credential") {
      await sendMessage(
        chatId,
        `🔐 Kredensial kamu:\n<code>${escapeHtml(result.value)}</code>\n\nSimpan baik-baik.`,
      );
    } else if (result.type === "file") {
      await sendMessage(
        chatId,
        `📄 Unduh file (link berlaku singkat):\n${result.url}`,
      );
    } else if (result.type === "pdf") {
      await sendMessage(
        chatId,
        `📕 Unduh PDF (link berlaku singkat):\n${result.url}\n\nPassword: <code>${escapeHtml(result.password)}</code>`,
      );
    } else {
      await sendMessage(chatId, `⚠️ ${result.reason}`);
    }
  }
}

async function sendOrders(chatId: number, user: TgUser) {
  const email = syntheticEmailForTelegram(user.id);
  const orders = await listOrdersByGuestEmail(email, 10);
  if (orders.length === 0) {
    await sendMessage(chatId, "Belum ada order. Ketik /katalog untuk mulai belanja.");
    return;
  }
  for (const o of orders) {
    await sendMessage(
      chatId,
      `Order <b>${o.order_number}</b> — ${rupiah(o.total_idr)} — ${o.status}`,
      [
        [
          { text: "🔄 Status", callback_data: `st:${o.order_number}` },
          { text: "📥 Ambil", callback_data: `dl:${o.order_number}` },
        ],
      ],
    );
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const WELCOME =
  "👋 Selamat datang di <b>RigelStore</b>!\n" +
  "Toko produk digital dengan pembayaran QRIS otomatis.\n\n" +
  "Ketik /katalog untuk lihat produk, atau /orders untuk order kamu.";

/** Proses satu update Telegram. */
export async function handleUpdate(update: TgUpdate): Promise<void> {
  if (update.message) {
    const { chat, from, text } = update.message;
    await rememberUser(from);
    const cmd = (text ?? "").trim().toLowerCase();
    if (cmd.startsWith("/start")) {
      await sendMessage(chat.id, WELCOME, [
        [{ text: "🛍 Lihat katalog", callback_data: "catalog" }],
        [{ text: "📦 Order saya", callback_data: "orders" }],
      ]);
    } else if (cmd.startsWith("/katalog") || cmd.startsWith("/catalog")) {
      await sendCatalog(chat.id);
    } else if (cmd.startsWith("/orders")) {
      if (from) await sendOrders(chat.id, from);
    } else {
      await sendMessage(chat.id, "Perintah: /katalog · /orders");
    }
    return;
  }

  if (update.callback_query) {
    const q = update.callback_query;
    const chatId = q.message?.chat.id;
    await rememberUser(q.from);
    await answerCallbackQuery(q.id);
    if (!chatId || !q.from) return;
    const data = q.data ?? "";

    if (data === "catalog") await sendCatalog(chatId);
    else if (data === "orders") await sendOrders(chatId, q.from);
    else if (data.startsWith("p:")) await sendProduct(chatId, data.slice(2));
    else if (data.startsWith("buy:")) await doBuy(chatId, q.from, data.slice(4));
    else if (data.startsWith("st:")) await sendStatus(chatId, data.slice(3));
    else if (data.startsWith("dl:")) await doDeliver(chatId, q.from, data.slice(3));
  }
}
