import "dotenv/config";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./index";
import * as schema from "./schema";
import { generateId } from "../lib/utils";

const now = new Date();

const dummyUsers = [
  {
    name: "Admin Nova",
    email: "admin@nova.store",
    password: "admin12345",
    role: "admin" as const,
    phone: "081234567891",
    avatar: "/placeholders/3.svg",
  },
  {
    name: "Budi Santoso",
    email: "customer@nova.store",
    password: "customer123",
    role: "customer" as const,
    phone: "081298765432",
    avatar: "/placeholders/5.svg",
  },
  {
    name: "Ayu Lestari",
    email: "ayu@nova.store",
    password: "dummy12345",
    role: "customer" as const,
    phone: "081311112223",
    avatar: "/placeholders/7.svg",
  },
  {
    name: "Rizky Pratama",
    email: "rizky@nova.store",
    password: "dummy12345",
    role: "customer" as const,
    phone: "082155556677",
    avatar: "/placeholders/9.svg",
  },
  {
    name: "Siti Rahma",
    email: "siti@nova.store",
    password: "dummy12345",
    role: "customer" as const,
    phone: "083812341234",
    avatar: "/placeholders/4.svg",
  },
  {
    name: "Dewa Putra",
    email: "dewa@nova.store",
    password: "dummy12345",
    role: "customer" as const,
    phone: "085755556666",
    avatar: "/placeholders/8.svg",
  },
];

async function main() {
  for (const u of dummyUsers) {
    const [existing] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, u.email));
    if (existing) {
      console.log(`ℹ️  ${u.email} sudah ada (dilewati)`);
      continue;
    }
    await db.insert(schema.users).values({
      id: generateId(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      avatar: u.avatar,
      password: await bcrypt.hash(u.password, 10),
      role: u.role,
      emailVerified: now,
    });
    console.log(`✅ ${u.email} dibuat (${u.role})`);
  }
  console.log("\nDummy akun siap digunakan.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
