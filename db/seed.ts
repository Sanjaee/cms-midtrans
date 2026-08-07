import "dotenv/config";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./index";
import * as schema from "./schema";
import { generateId, slugify, generateOrderNumber } from "../lib/utils";

const now = new Date();

async function seed() {
  console.log("🌱 Seeding database...");

  const [admin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "admin@nova.store"));

  if (!admin) {
    await db.insert(schema.users).values({
      id: generateId(),
      name: "Admin Nova",
      email: "admin@nova.store",
      password: await bcrypt.hash("admin12345", 10),
      role: "admin",
      emailVerified: now,
    });
    console.log("✅ Default admin dibuat: admin@nova.store / admin12345");
  } else {
    console.log("ℹ️ Admin sudah ada, dilewati.");
  }

  const [demo] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "customer@nova.store"));
  if (!demo) {
    await db.insert(schema.users).values({
      id: generateId(),
      name: "Budi Santoso",
      email: "customer@nova.store",
      password: await bcrypt.hash("customer123", 10),
      role: "customer",
      emailVerified: now,
    });
    console.log("✅ Customer demo dibuat: customer@nova.store / customer123");
  }

  const catDefs = [
    { name: "Fashion", icon: "👕", image: "/placeholders/1.svg", banner: "/placeholders/1.svg", desc: "Pakaian premium pria & wanita" },
    { name: "Aksesori", icon: "⌚", image: "/placeholders/2.svg", banner: "/placeholders/2.svg", desc: "Jam tangan, dompet, dan lainnya" },
    { name: "Elektronik", icon: "🎧", image: "/placeholders/3.svg", banner: "/placeholders/3.svg", desc: "Gadget & audio modern" },
    { name: "Home & Living", icon: "🏠", image: "/placeholders/4.svg", banner: "/placeholders/4.svg", desc: "Perlengkapan rumah premium" },
    { name: "Kecantikan", icon: "✨", image: "/placeholders/5.svg", banner: "/placeholders/5.svg", desc: "Skincare & body care" },
    { name: "Food & Beverage", icon: "☕", image: "/placeholders/6.svg", banner: "/placeholders/6.svg", desc: "Kopi premium & camilan sehat" },
  ];

  const catIds: Record<string, string> = {};
  for (const c of catDefs) {
    const [existing] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, slugify(c.name)));
    if (existing) {
      catIds[c.name] = existing.id;
      continue;
    }
    const id = generateId("cat");
    await db.insert(schema.categories).values({
      id,
      name: c.name,
      slug: slugify(c.name),
      icon: c.icon,
      image: c.image,
      banner: c.banner,
      description: c.desc,
      sortOrder: Object.keys(catIds).length,
    });
    catIds[c.name] = id;
  }
  console.log(`✅ Kategori: ${catDefs.length}`);

  const productDefs: (Partial<typeof schema.products.$inferInsert> & {
    cat: string;
    price: number;
    salePrice?: number;
    flash?: boolean;
    desc?: string;
  })[] = [
    { name: "Wireless Earbuds Pro Max", cat: "Elektronik", brand: "Nova Audio", price: 899000, salePrice: 699000, stock: 45, weight: 80, badge: "best_seller", flash: true, sold: 1520, desc: "Earbuds nirkabel dengan Active Noise Cancelling, baterai 36 jam, dan kualitas suara premium.", featured: true },
    { name: "Smart Watch Series 5", cat: "Aksesori", brand: "Nova Tech", price: 1499000, salePrice: 1199000, stock: 30, weight: 60, badge: "new", flash: false, sold: 640, desc: "Smartwatch dengan layar AMOLED, GPS, heart rate monitor, dan tahan air IP68.", featured: true },
    { name: "Premium Leather Wallet", cat: "Fashion", brand: "Nova Leather", price: 249000, salePrice: 199000, stock: 100, weight: 150, badge: "best_seller", flash: false, sold: 2100, desc: "Dompet kulit asli premium dengan 8 slot kartu dan 2 slot uang.", featured: true },
    { name: "Stainless Tumbler 750ml", cat: "Home & Living", brand: "Nova Home", price: 189000, salePrice: 149000, stock: 80, weight: 350, badge: "promo", flash: false, sold: 890, desc: "Botol minum stainless steel double-wall, tahan panas 12 jam dan dingin 24 jam.", featured: false },
    { name: "Diffuser Aromaterapi", cat: "Home & Living", brand: "Nova Home", price: 159000, salePrice: 129000, stock: 60, weight: 400, badge: "none", flash: true, sold: 340, desc: "Diffuser ultrasonik dengan lampu 7 warna dan mati otomatis.", featured: false },
    { name: "Serum Vitamin C Glow", cat: "Kecantikan", brand: "Nova Beauty", price: 129000, salePrice: 99000, stock: 120, weight: 50, badge: "best_seller", flash: false, sold: 3100, desc: "Serum vitamin C 20% dengan hyaluronic acid untuk kulit cerah merata.", featured: true },
    { name: "Kopi Arabika Gayo 250g", cat: "Food & Beverage", brand: "Nova Coffee", price: 85000, salePrice: 69000, stock: 150, weight: 260, badge: "limited", flash: false, sold: 2200, desc: "Kopi arabika Gayo single origin, roasted medium, aroma kuat.", featured: true },
    { name: "Kemeja Linen Premium", cat: "Fashion", brand: "Nova Apparel", price: 399000, salePrice: 329000, stock: 55, weight: 200, badge: "new", flash: false, sold: 410, desc: "Kemeja linen katun premium, breathable dan nyaman dipakai.", featured: false },
    { name: "Keyboard Mechanical RGB", cat: "Elektronik", brand: "Nova Tech", price: 749000, salePrice: 649000, stock: 40, weight: 900, badge: "promo", flash: true, sold: 520, desc: "Keyboard mechanical hot-swappable dengan switch red dan RGB.", featured: false },
    { name: "Parfum Eau de Toilette", cat: "Kecantikan", brand: "Nova Fragrance", price: 459000, salePrice: 399000, stock: 70, weight: 120, badge: "none", flash: false, sold: 780, desc: "Parfum woody oriental tahan lama hingga 8 jam.", featured: false },
    { name: "Power Bank 20000mAh", cat: "Elektronik", brand: "Nova Tech", price: 349000, salePrice: 299000, stock: 90, weight: 350, badge: "best_seller", flash: false, sold: 1800, desc: "Power bank fast charging 22.5W dual port.", featured: false },
    { name: "Sneakers Casual Premium", cat: "Fashion", brand: "Nova Apparel", price: 599000, salePrice: 499000, stock: 35, weight: 700, badge: "limited", flash: false, sold: 300, desc: "Sneakers kulit premium, sol empuk dan nyaman.", featured: false },
    { name: "Blender Portable USB", cat: "Home & Living", brand: "Nova Home", price: 219000, salePrice: 179000, stock: 65, weight: 500, badge: "none", flash: false, sold: 250, desc: "Blender portable isi ulang USB untuk smoothie kapan saja.", featured: false },
    { name: "Sunscreen SPF 50+ PA++++", cat: "Kecantikan", brand: "Nova Beauty", price: 99000, salePrice: 79000, stock: 200, weight: 40, badge: "best_seller", flash: true, sold: 4500, desc: "Sunscreen ringan tanpa whitecast, waterproof 80 menit.", featured: true },
    { name: "Teh Daun Kelor Premium", cat: "Food & Beverage", brand: "Nova Herbal", price: 55000, stock: 180, weight: 100, badge: "new", flash: false, sold: 190, desc: "Teh daun kelor organik kaya antioksidan.", featured: false },
    { name: "Tas Ransel Anti Air 25L", cat: "Fashion", brand: "Nova Apparel", price: 329000, salePrice: 279000, stock: 50, weight: 800, badge: "promo", flash: false, sold: 460, desc: "Ransel anti air dengan kompartemen laptop 15 inch.", featured: false },
  ];

  let count = 0;
  for (const p of productDefs) {
    const id = generateId("prd");
    const price = p.price;
    const salePrice = p.salePrice ?? null;
    const discountPct = salePrice
      ? Math.round((1 - salePrice / price) * 100)
      : 0;
    const slug = slugify(p.name || "");
    await db.insert(schema.products).values({
      id,
      name: p.name || "",
      slug,
      sku: `NV-${String(count + 1).padStart(4, "0")}`,
      categoryId: catIds[p.cat],
      brand: p.brand,
      price,
      salePrice,
      discountPct,
      isFlashSale: p.flash || false,
      flashSaleEndsAt: p.flash ? new Date(Date.now() + 2 * 24 * 3600 * 1000) : null,
      stock: p.stock || 0,
      weight: p.weight || 0,
      thumbnail: `/placeholders/${(count % 10) + 1}.svg`,
      images: [`/placeholders/${(count % 10) + 1}.svg`, `/placeholders/${((count + 2) % 10) + 1}.svg`],
      badge: (p.badge as never) || "none",
      status: "published",
      featured: p.featured || false,
      sold: p.sold || 0,
      shortDescription: p.desc,
      longDescription: `<p>${p.desc}</p><h2>Keunggulan Produk</h2><ul><li>Kualitas premium dan original 100%</li><li>Garansi resmi</li><li>Pengiriman cepat ke seluruh Indonesia</li></ul><h2>Spesifikasi</h2><p>Produk ${p.name} hadir dengan spesifikasi terbaik di kelasnya, cocok untuk gaya hidup modern.</p>`,
      specs: {
        Bahan: "Premium",
        Garansi: "1 Tahun",
        Pengiriman: "Seluruh Indonesia",
        SKU: `NV-${String(count + 1).padStart(4, "0")}`,
      },
      rating: String((4 + Math.random()).toFixed(1)),
      ratingCount: Math.floor(10 + Math.random() * 200),
    });
    count++;
  }
  console.log(`✅ Produk: ${count}`);

  const couponDefs = [
    { code: "NOVA10", type: "percent", value: 10, minSpend: 150000, maxDiscount: 50000 },
    { code: "NOVA20", type: "percent", value: 20, minSpend: 300000, maxDiscount: 100000 },
    { code: "GRATISONGKIR", type: "fixed", value: 0, minSpend: 200000, freeShipping: true },
    { code: "DISKON50K", type: "fixed", value: 50000, minSpend: 250000 },
  ];
  for (const c of couponDefs) {
    const [existing] = await db.select().from(schema.coupons).where(eq(schema.coupons.code, c.code));
    if (existing) continue;
    await db.insert(schema.coupons).values({
      id: generateId(),
      code: c.code,
      type: c.type as never,
      value: c.value,
      minSpend: c.minSpend,
      maxDiscount: c.maxDiscount ?? null,
      quota: 500,
      freeShipping: c.freeShipping || false,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    });
  }
  console.log("✅ Kupon: 4");

  const banners = [
    { title: "Mega Sale Spesial", subtitle: "Diskon hingga 50% untuk koleksi terpilih", type: "promo", link: "/products?discount=1" },
    { title: "New Collection 2026", subtitle: "Temukan produk terbaru kami", type: "hero", link: "/products?sort=newest" },
  ];
  for (const b of banners) {
    await db.insert(schema.banners).values({
      id: generateId(),
      title: b.title,
      subtitle: b.subtitle,
      type: b.type as never,
      active: true,
      link: b.link,
    });
  }
  console.log("✅ Banner: 2");

  const testimonials = [
    { name: "Ayu Lestari", role: "Pelanggan", content: "Produknya bagus banget, kualitas premium dan pengiriman cepat! Sangat recommended.", rating: 5 },
    { name: "Rizky Pratama", role: "Pelanggan", content: "Packing rapi, original, dan harga lebih murah dari toko lain. Mantap!", rating: 5 },
    { name: "Siti Rahma", role: "Pelanggan", content: "Checkout-nya gampang banget, bayar pakai QRIS langsung jadi. Pelayanan memuaskan.", rating: 5 },
    { name: "Dewa Putra", role: "Pelanggan", content: "Sudah langganan 3x belanja disini, kualitas selalu konsisten. Recommended seller!", rating: 5 },
    { name: "Maya Anggraini", role: "Pelanggan", content: "Barang sesuai foto, original, adminnya fast response. Terima kasih Nova Store!", rating: 5 },
    { name: "Fajar Nugraha", role: "Pelanggan", content: "Pengalaman belanja paling nyaman. Produk premium dengan harga bersahabat.", rating: 5 },
  ];
  for (const t of testimonials) {
    await db.insert(schema.testimonials).values({ id: generateId(), ...t });
  }
  console.log("✅ Testimoni: 6");

  const faqDefs = [
    { q: "Apakah produk yang dijual original?", a: "Ya, 100% produk original dengan garansi resmi. Kami hanya menjual produk berkualitas premium." },
    { q: "Berapa lama waktu pengiriman?", a: "Pengiriman ke seluruh Indonesia memakan waktu 1-4 hari kerja tergantung lokasi dan kurir yang dipilih." },
    { q: "Bagaimana cara melakukan pembayaran?", a: "Kami mendukung pembayaran via QRIS, Virtual Account (BCA, BNI, BRI, Mandiri), e-wallet (GoPay, ShopeePay, DANA), kartu kredit, dan retail." },
    { q: "Apakah ada biaya pengiriman?", a: "Gratis ongkir untuk pembelian minimal Rp200.000. Selain itu, ongkir dihitung otomatis sesuai kurir yang dipilih." },
    { q: "Bagaimana jika barang rusak atau tidak sesuai?", a: "Anda dapat mengajukan pengembalian dalam 7 hari setelah barang diterima. Tim kami siap membantu." },
    { q: "Apakah bisa melacak pesanan?", a: "Ya, setelah pesanan dikirim Anda akan menerima nomor resi dan dapat melacaknya di halaman Pesanan Saya." },
  ];
  for (const f of faqDefs) {
    await db.insert(schema.faqs).values({ id: generateId(), question: f.q, answer: f.a });
  }
  console.log("✅ FAQ: 6");

  const postCats = ["Tips & Panduan", "Gaya Hidup", "Promo"];
  const postCatIds: Record<string, string> = {};
  for (const c of postCats) {
    const [existing] = await db.select().from(schema.postCategories).where(eq(schema.postCategories.slug, slugify(c)));
    if (existing) {
      postCatIds[c] = existing.id;
      continue;
    }
    const id = generateId();
    await db.insert(schema.postCategories).values({ id, name: c, slug: slugify(c) });
    postCatIds[c] = id;
  }

  const postDefs = [
    {
      title: "5 Tips Memilih Produk Premium Berkualitas",
      cat: "Tips & Panduan",
      excerpt: "Jangan asal beli! Simak tips jitu memilih produk premium yang benar-benar berkualitas dan tahan lama.",
      content:
        "<p>Memilih produk premium tidak hanya soal harga mahal. Ada beberapa hal yang perlu diperhatikan agar Anda mendapatkan produk yang benar-benar berkualitas.</p><h2>1. Cek Bahan dan Material</h2><p>Produk premium biasanya menggunakan material berkualitas tinggi seperti kulit asli, stainless steel, atau katun premium.</p><h2>2. Perhatikan Detail Finishing</h2><p>Jahitan rapi, logo presisi, dan packaging yang baik adalah ciri produk premium.</p><h2>3. Baca Review Pelanggan</h2><p>Review dari pembeli sebelumnya adalah sumber informasi terpercaya tentang kualitas produk.</p><h2>4. Pastikan Ada Garansi</h2><p>Produk berkualitas biasanya disertai garansi resmi dari brand atau penjual.</p><h2>5. Bandingkan Harga</h2><p>Harga yang terlalu murah bisa jadi tanda kualitas rendah. Bandingkan dengan harga pasaran.</p>",
      tags: ["tips", "premium", "belanja"],
    },
    {
      title: "Cara Merawat Produk Kulit Agar Awet Bertahun-tahun",
      cat: "Tips & Panduan",
      excerpt: "Produk kulit premium perlu perawatan khusus agar tetap awet dan terlihat elegan.",
      content:
        "<p>Produk kulit seperti dompet dan tas premium memerlukan perawatan rutin agar tetap indah.</p><h2>Bersihkan Secara Rutin</h2><p>Gunakan kain lembut untuk membersihkan debu setiap minggu.</p><h2>Gunakan Pelembap Kulit</h2><p>Aplikasikan leather conditioner setiap 2-3 bulan sekali.</p><h2>Hindari Sinar Matahari Langsung</h2><p>Paparan sinar matahari berlebih dapat membuat kulit pudar dan kering.</p><h2>Simpan dengan Benar</h2><p>Simpan di tempat kering dan gunakan dust bag saat tidak digunakan.</p>",
      tags: ["perawatan", "kulit", "tips"],
    },
    {
      title: "Promo Spesial: Diskon hingga 50% Bulan Ini",
      cat: "Promo",
      excerpt: "Jangan lewatkan promo spesial bulan ini! Diskon hingga 50% untuk produk pilihan.",
      content:
        "<p>Bulan ini kami menghadirkan promo spesial untuk Anda! Diskon hingga 50% untuk berbagai produk pilihan.</p><h2>Apa Saja Promonya?</h2><p>Flash sale harian, kupon diskon, dan gratis ongkir untuk pembelian minimal tertentu.</p><h2>Gunakan Kode Kupon</h2><p>Gunakan kode <strong>NOVA10</strong> untuk diskon 10% atau <strong>NOVA20</strong> untuk diskon 20%.</p><h2>Jangan Tunda!</h2><p>Promo terbatas hanya sampai akhir bulan. Segera belanja sebelum kehabisan!</p>",
      tags: ["promo", "diskon", "flash sale"],
    },
  ];
  for (const p of postDefs) {
    const [existing] = await db.select().from(schema.posts).where(eq(schema.posts.slug, slugify(p.title)));
    if (existing) continue;
    await db.insert(schema.posts).values({
      id: generateId(),
      title: p.title,
      slug: slugify(p.title),
      excerpt: p.excerpt,
      content: p.content,
      thumbnail: `/placeholders/${Math.floor(Math.random() * 10) + 1}.svg`,
      authorName: "Admin Nova",
      categoryId: postCatIds[p.cat],
      tags: p.tags,
      status: "published",
      publishedAt: now,
      featured: p.cat === "Promo",
    });
  }
  console.log("✅ Blog: 3");

  await db.insert(schema.analytics).values({ id: "a_demo", date: now.toISOString().slice(0, 10), visitors: 120, views: 380, orders: 12, revenue: 4500000 }).onConflictDoNothing();

  console.log("✅ Seed selesai!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed gagal:", err);
    process.exit(1);
  });
