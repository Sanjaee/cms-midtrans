import { NextRequest, NextResponse } from "next/server";
import { getValidCoupon } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") || "";
  if (!code) {
    return NextResponse.json({ valid: false, error: "Kode tidak valid" });
  }
  const coupon = await getValidCoupon(code.toUpperCase());
  if (!coupon) {
    return NextResponse.json({ valid: false, error: "Kupon tidak berlaku" });
  }
  return NextResponse.json({
    valid: true,
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minSpend: coupon.minSpend,
    maxDiscount: coupon.maxDiscount,
    freeShipping: coupon.freeShipping,
  });
}
