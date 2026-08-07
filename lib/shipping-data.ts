export interface ShippingService {
  id: string;
  name: string;
  cost: number;
  eta: string;
}

export interface Courier {
  id: string;
  name: string;
  services: ShippingService[];
}

export const COURIERS: Courier[] = [
  {
    id: "jne",
    name: "JNE",
    services: [
      { id: "reg", name: "Reguler", cost: 15000, eta: "2-3 hari" },
      { id: "yes", name: "YES", cost: 30000, eta: "1 hari" },
    ],
  },
  {
    id: "jnt",
    name: "J&T Express",
    services: [{ id: "ez", name: "EZ", cost: 12000, eta: "2-3 hari" }],
  },
  {
    id: "sicepat",
    name: "SiCepat",
    services: [
      { id: "reg", name: "REG", cost: 14000, eta: "2-3 hari" },
      { id: "best", name: "BEST", cost: 25000, eta: "1-2 hari" },
    ],
  },
  {
    id: "anteraja",
    name: "AnterAja",
    services: [{ id: "reg", name: "Reguler", cost: 13000, eta: "2-3 hari" }],
  },
  {
    id: "pos",
    name: "POS Indonesia",
    services: [{ id: "kilat", name: "Kilat", cost: 16000, eta: "2-4 hari" }],
  },
];

export function getCourierById(id: string) {
  return COURIERS.find((c) => c.id === id) || null;
}

export function getServiceById(courierId: string, serviceId: string) {
  const courier = getCourierById(courierId);
  return courier?.services.find((s) => s.id === serviceId) || null;
}
