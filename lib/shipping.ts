import "server-only";
import { getSettings } from "@/lib/settings";
import {
  getCourierById,
  getServiceById,
  type ShippingService,
  type Courier,
} from "@/lib/shipping-data";

export { COURIERS } from "@/lib/shipping-data";

const PER_KG_EXTRA = 2000;

export async function calculateShippingCost(params: {
  courierId: string;
  serviceId: string;
  weight: number;
  subtotal: number;
  couponFreeShipping?: boolean;
}): Promise<{
  cost: number;
  freeShipping: boolean;
  service: ShippingService | null;
  courier: Courier | null;
}> {
  const service = getServiceById(params.courierId, params.serviceId);
  const courier = getCourierById(params.courierId);
  if (!service || !courier) {
    return { cost: 0, freeShipping: false, service: null, courier: null };
  }

  const settings = await getSettings();
  const threshold = Number(settings.freeShippingThreshold || 200000);

  const freeByThreshold = params.subtotal >= threshold;
  const freeShipping = freeByThreshold || Boolean(params.couponFreeShipping);

  let cost = service.cost;
  const weightKg = Math.max(1, Math.ceil(params.weight / 1000));
  if (weightKg > 1) cost += (weightKg - 1) * PER_KG_EXTRA;

  return {
    cost: freeShipping ? 0 : cost,
    freeShipping,
    service,
    courier,
  };
}
