import { NextResponse } from "next/server";
import { getOrderStatus } from "@modules/core/orders/service";

/** Polling status order (read-only). TIDAK pernah mengubah status. */
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const status = await getOrderStatus(orderNumber);
  if (!status) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ status });
}
