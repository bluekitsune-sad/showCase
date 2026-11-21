import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const DEMO_PASSWORD = "Maison2026!";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

// Deterministic PRNG so reseeding produces the same demo catalogue.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261117);
const int = (min: number, max: number): number =>
  min + Math.floor(rand() * (max - min + 1));
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  material: string;
  price: number;
  compareAtPrice?: number;
  featured?: boolean;
  sizes: string[];
  colours: string[];
};

type CollectionSeed = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  featured?: boolean;
  products: ProductSeed[];
};

const APPAREL_SIZES = ["S", "M", "L"];
const OBJECT_SIZES = ["One Size"];

const collections: CollectionSeed[] = [
  {
    name: "Atelier Noir",
    slug: "atelier-noir",
    featured: true,
    tagline: "Tailored layers cut for cold mornings.",
    description:
      "Structured outerwear and quiet tailoring in ink, ash and charcoal. Pieces made to sit over everything else you own.",
    products: [
      {
        name: "Wool Overcoat",
        slug: "wool-overcoat",
        description:
          "A long, single-breasted coat in dense Italian wool. Dropped shoulder, deep pockets, unlined through the body so it moves with you.",
        material: "80% wool, 20% recycled polyamide",
        price: 42000,
        featured: true,
        sizes: APPAREL_SIZES,
        colours: ["Ink", "Charcoal"],
      },
      {
        name: "Cropped Trench",
        slug: "cropped-trench",
        description:
          "A short trench with a storm flap and belt, cut to hit just below the waist. Cotton gabardine that softens with wear.",
        material: "100% cotton gabardine",
        price: 31000,
        sizes: APPAREL_SIZES,
        colours: ["Stone"],
      },
      {
        name: "Double-Faced Blazer",
        slug: "double-faced-blazer",
        description:
          "Unlined blazer in double-faced wool, finished with a raw edge at the lapel. Quiet enough for the office, sharp enough for dinner.",
        material: "100% merino wool",
        price: 26500,
        compareAtPrice: 31000,
        sizes: APPAREL_SIZES,
        colours: ["Ash", "Ink"],
      },
      {
        name: "Pleated Wool Trouser",
        slug: "pleated-wool-trouser",
        description:
          "A high-waisted trouser with a single forward pleat and a wide, tapered leg. Falls clean from the hip.",
        material: "70% wool, 30% viscose",
        price: 18500,
        featured: true,
        sizes: APPAREL_SIZES,
        colours: ["Charcoal"],
      },
      {
        name: "Merino Roll Neck",
        slug: "merino-roll-neck",
        description:
          "Fine-gauge merino with a soft roll collar. Light enough to layer under a coat without bulk.",
        material: "100% extra-fine merino",
        price: 14500,
        sizes: APPAREL_SIZES,
        colours: ["Ink", "Oat"],
      },
      {
        name: "Leather Belt",
        slug: "leather-belt",
        description:
          "A narrow belt in vegetable-tanned leather with a brushed brass buckle. Ages into a deeper tone.",
        material: "Vegetable-tanned leather, brass",
        price: 9500,
        sizes: OBJECT_SIZES,
        colours: ["Tan", "Black", "Brown"],
      },
    ],
  },
  {
    name: "Linen Season",
    slug: "linen-season",
    tagline: "Washed linen for long, slow afternoons.",
    description:
      "Airy shirts, wide trousers and soft accessories in stone-washed linen. Everything creases the way linen should.",
    products: [
      {
        name: "Washed Linen Shirt",
        slug: "washed-linen-shirt",
        description:
          "A relaxed shirt with a soft collar and a curved hem. Washed twice before it reaches you, so it already feels broken in.",
        material: "100% European linen",
        price: 12500,
        featured: true,
        sizes: APPAREL_SIZES,
        colours: ["Chalk", "Sky"],
      },
      {
        name: "Wide Linen Trouser",
        slug: "wide-linen-trouser",
        description:
          "An elastic-back trouser with a wide leg and side pockets. Cut to sit at the natural waist.",
        material: "100% European linen",
        price: 14000,
        sizes: APPAREL_SIZES,
        colours: ["Sand", "Olive"],
      },
      {
        name: "Linen Camp Collar",
        slug: "linen-camp-collar",
        description:
          "A boxy short-sleeve shirt with an open camp collar. Made for heat and for eating outside.",
        material: "100% European linen",
        price: 11500,
        sizes: APPAREL_SIZES,
        colours: ["Ecru", "Clay"],
      },
      {
        name: "Belted Linen Dress",
        slug: "belted-linen-dress",
        description:
          "A mid-length dress with a self belt and deep side splits. Loose through the body, gathered at the waist.",
        material: "100% European linen",
        price: 19000,
        sizes: APPAREL_SIZES,
        colours: ["Chalk"],
      },
      {
        name: "Linen Scarf",
        slug: "linen-scarf",
        description:
          "A long, lightweight scarf with hand-knotted fringe. Wide enough to wrap twice.",
        material: "100% linen",
        price: 7000,
        sizes: OBJECT_SIZES,
        colours: ["Sand", "Sky", "Olive"],
      },
      {
        name: "Canvas Tote",
        slug: "canvas-tote",
        description:
          "A heavy canvas tote with leather handles and an inside pocket. Holds a laptop, a market shop, or both.",
        material: "Cotton canvas, leather handles",
        price: 8500,
        featured: true,
        sizes: OBJECT_SIZES,
        colours: ["Natural", "Ink", "Olive"],
      },
    ],
  },
  {
    name: "Everyday Objects",
    slug: "everyday-objects",
    tagline: "Small leather goods, made once and kept.",
    description:
      "Card cases, totes and travel pieces in smooth leather and brushed brass. Useful things that get better with handling.",
    products: [
      {
        name: "Leather Card Case",
        slug: "leather-card-case",
        description:
          "A slim card case with four slots and a central pocket. Cut from a single piece of leather, folded and stitched by hand.",
        material: "Full-grain leather",
        price: 5500,
        sizes: OBJECT_SIZES,
        colours: ["Tan", "Black", "Olive"],
      },
      {
        name: "Folded Leather Tote",
        slug: "folded-leather-tote",
        description:
          "A structural tote built from one folded panel, with a magnetic closure and a suede-lined interior.",
        material: "Full-grain leather, suede lining",
        price: 24000,
        featured: true,
        sizes: OBJECT_SIZES,
        colours: ["Chestnut", "Black", "Stone"],
      },
      {
        name: "Brass Key Ring",
        slug: "brass-key-ring",
        description:
          "A solid brass ring on a leather loop. The brass darkens and the leather softens with use.",
        material: "Solid brass, vegetable-tanned leather",
        price: 4000,
        sizes: OBJECT_SIZES,
        colours: ["Brass", "Black", "Tan"],
      },
      {
        name: "Wool Felt Cap",
        slug: "wool-felt-cap",
        description:
          "A six-panel cap in dense wool felt, with a short brim and a cotton sweatband.",
        material: "100% wool felt",
        price: 6500,
        sizes: OBJECT_SIZES,
        colours: ["Charcoal", "Stone", "Olive"],
      },
      {
        name: "Suede Weekender",
        slug: "suede-weekender",
        description:
          "A soft weekender with a canvas lining and a detachable shoulder strap. Sized for two nights away.",
        material: "Suede, cotton canvas lining",
        price: 36000,
        sizes: OBJECT_SIZES,
        colours: ["Sand", "Brown", "Ink"],
      },
      {
        name: "Silk Pocket Square",
        slug: "silk-pocket-square",
        description:
          "A hand-rolled pocket square in printed silk. Quiet patterns, enough to catch the light.",
        material: "100% silk",
        price: 5000,
        sizes: OBJECT_SIZES,
        colours: ["Rust", "Sky", "Olive"],
      },
    ],
  },
  {
    name: "Quiet Colour",
    slug: "quiet-colour",
    tagline: "Knitwear and soft basics in muted tones.",
    description:
      "Cashmere, cotton and lambswool in the sort of colours that go with everything. Soft layers for the days between seasons.",
    products: [
      {
        name: "Oversized Cashmere Knit",
        slug: "oversized-cashmere-knit",
        description:
          "A generous crew neck in two-ply cashmere. Dropped shoulder, ribbed cuffs, and enough room for a shirt underneath.",
        material: "100% two-ply cashmere",
        price: 29000,
        featured: true,
        sizes: APPAREL_SIZES,
        colours: ["Oat", "Moss"],
      },
      {
        name: "Ribbed Cotton Tee",
        slug: "ribbed-cotton-tee",
        description:
          "A close-fitting tee in heavy ribbed cotton. Holds its shape through the wash.",
        material: "100% organic cotton",
        price: 6500,
        sizes: APPAREL_SIZES,
        colours: ["Chalk", "Ink"],
      },
      {
        name: "Relaxed Cord Shirt",
        slug: "relaxed-cord-shirt",
        description:
          "A soft corduroy overshirt with a boxy cut and patch pockets. Warm enough to wear as a light jacket.",
        material: "100% cotton corduroy",
        price: 15500,
        sizes: APPAREL_SIZES,
        colours: ["Clay"],
      },
      {
        name: "Pleated Midi Skirt",
        slug: "pleated-midi-skirt",
        description:
          "A fine-pleated skirt with an elastic waist and a fluid drape. Falls just below the knee.",
        material: "100% recycled polyester",
        price: 17500,
        sizes: APPAREL_SIZES,
        colours: ["Moss", "Ink"],
      },
      {
        name: "Alpaca Beanie",
        slug: "alpaca-beanie",
        description:
          "A ribbed beanie in brushed alpaca. Warm without the itch, with a deep turn-back cuff.",
        material: "80% alpaca, 20% wool",
        price: 6000,
        sizes: OBJECT_SIZES,
        colours: ["Oat", "Charcoal", "Rust"],
      },
      {
        name: "Lambswool Socks",
        slug: "lambswool-socks",
        description:
          "A pair of soft lambswool socks with a reinforced heel and toe. Made for boots.",
        material: "80% lambswool, 20% nylon",
        price: 2800,
        sizes: OBJECT_SIZES,
        colours: ["Oat", "Moss", "Ink"],
      },
    ],
  },
];

const customers = [
  { name: "Ada Winters", email: "ada.winters@example.com" },
  { name: "Rui Nakamura", email: "rui.nakamura@example.com" },
  { name: "Sofia Almeida", email: "sofia.almeida@example.com" },
  { name: "Noah Berg", email: "noah.berg@example.com" },
  { name: "Ines Duarte", email: "ines.duarte@example.com" },
  { name: "Tomas Reed", email: "tomas.reed@example.com" },
];

const addresses = [
  { line1: "14 Alder Lane", city: "Portland", region: "OR", postalCode: "97205" },
  { line1: "88 Kestrel Street", city: "Austin", region: "TX", postalCode: "78702" },
  { line1: "2 Marlowe Court", city: "Brooklyn", region: "NY", postalCode: "11215" },
  { line1: "41 Finch Road", city: "Chicago", region: "IL", postalCode: "60607" },
  { line1: "9 Harbour Walk", city: "Seattle", region: "WA", postalCode: "98104" },
  { line1: "26 Olive Terrace", city: "Denver", region: "CO", postalCode: "80205" },
];

function skuFor(slug: string, colour: string, size: string): string {
  const code = colour.replace(/[^a-zA-Z0-9]+/g, "").slice(0, 3).toUpperCase();
  return `${slug.toUpperCase()}-${code}-${size.toUpperCase()}`;
}

async function main() {
  await prisma.testimonial.deleteMany();
  await prisma.editorial.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.customer.deleteMany();

  const createdVariants: {
    id: number;
    productName: string;
    colour: string;
    size: string;
    price: number;
  }[] = [];
  const createdProductIds: number[] = [];

  let outOfStockBudget = 5;
  for (const [order, collection] of collections.entries()) {
    const created = await prisma.collection.create({
      data: {
        name: collection.name,
        slug: collection.slug,
        tagline: collection.tagline,
        description: collection.description,
        featured: collection.featured ?? false,
        sortOrder: order,
      },
    });

    for (const product of collection.products) {
      const record = await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          material: product.material,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? null,
          featured: product.featured ?? false,
          collectionId: created.id,
          images: {
            create: [
              {
                alt: `${product.name} photographed flat against a pale background`,
                sortOrder: 0,
              },
              {
                alt: `${product.name} detail showing fabric and stitching`,
                sortOrder: 1,
              },
            ],
          },
        },
      });

      createdProductIds.push(record.id);

      let variantIndex = 0;
      for (const colour of product.colours) {
        for (const size of product.sizes) {
          const stock =
            outOfStockBudget > 0 && (variantIndex + order) % 7 === 0
              ? (outOfStockBudget--, 0)
              : int(1, 12);
          const variant = await prisma.variant.create({
            data: {
              productId: record.id,
              size,
              colour,
              sku: skuFor(product.slug, colour, size),
              stock,
            },
          });
          createdVariants.push({
            id: variant.id,
            productName: product.name,
            colour,
            size,
            price: product.price,
          });
          variantIndex += 1;
        }
      }
    }
  }

  const demoPasswordHash = await hashPassword(DEMO_PASSWORD);
  const createdCustomers = [];
  for (const [index, customer] of customers.entries()) {
    const address = addresses[index];
    const created = await prisma.customer.create({
      data: {
        name: customer.name,
        email: customer.email,
        passwordHash: demoPasswordHash,
        addresses: {
          create: [
            {
              label: index % 2 === 0 ? "Home" : "Studio",
              line1: address.line1,
              city: address.city,
              region: address.region,
              postalCode: address.postalCode,
              country: "US",
              isDefault: true,
            },
          ],
        },
      },
      include: { addresses: true },
    });
    createdCustomers.push(created);
  }

  await prisma.discount.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "10% off a first order",
        kind: "percent",
        value: 10,
        minSubtotal: 10000,
        active: true,
      },
      {
        code: "ATELIER25",
        description: "$25 off orders over $250",
        kind: "fixed",
        value: 2500,
        minSubtotal: 25000,
        active: true,
      },
    ],
  });

  const statuses = [
    "delivered",
    "in_transit",
    "shipped",
    "processing",
    "packed",
    "cancelled",
    "in_transit",
    "shipped",
  ];

  for (let i = 0; i < 8; i += 1) {
    const customer = createdCustomers[i % createdCustomers.length];
    const address = customer.addresses[0];
    const itemCount = int(1, 3);
    const chosen: typeof createdVariants = [];
    while (chosen.length < itemCount) {
      const candidate = pick(createdVariants);
      if (!chosen.some((entry) => entry.id === candidate.id)) {
        chosen.push(candidate);
      }
    }

    const lines = chosen.map((variant) => {
      const quantity = int(1, 2);
      return {
        variantId: variant.id,
        productName: variant.productName,
        variantLabel: `${variant.colour} / ${variant.size}`,
        status: statuses[i],
        quantity,
        unitPrice: variant.price,
        lineTotal: variant.price * quantity,
      };
    });
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const discountTotal = i === 1 && subtotal >= 10000 ? Math.round(subtotal * 0.1) : 0;
    const shippingTotal = subtotal >= 15000 ? 0 : 850;

    await prisma.order.create({
      data: {
        orderNumber: `MS-${1001 + i}`,
        customerId: customer.id,
        status: statuses[i],
        email: customer.email,
        subtotal,
        discountTotal,
        shippingTotal,
        total: subtotal - discountTotal + shippingTotal,
        discountCode: discountTotal > 0 ? "WELCOME10" : null,
        shippingName: customer.name,
        shippingLine1: address.line1,
        shippingCity: address.city,
        shippingRegion: address.region,
        shippingPostalCode: address.postalCode,
        shippingCountry: address.country,
        placedAt: daysAgo(24 - i * 3),
        items: { create: lines },
      },
    });
  }

  await prisma.testimonial.createMany({
    data: [
      {
        quote:
          "The coat arrived in two days and has not left my shoulders since. It feels like something my mother would have kept for thirty years.",
        author: "Ada Winters",
        detail: "Portland, OR — Atelier Noir, second season",
        sortOrder: 0,
      },
      {
        quote:
          "I bought one linen shirt to test the fit and came back for three more. The creases are the point, not a flaw.",
        author: "Rui Nakamura",
        detail: "Austin, TX — Linen Season",
        sortOrder: 1,
      },
      {
        quote:
          "Quiet packaging, a care card with the mill's name on it, and a hem I have already had shortened twice. Small things done properly.",
        author: "Sofia Almeida",
        detail: "Brooklyn, NY — made-to-last knitwear",
        sortOrder: 2,
      },
    ],
  });

  await prisma.editorial.createMany({
    data: [
      {
        title: "The case for a five-winter coat",
        standfirst:
          "What a good coat should survive, and the three details worth checking before you commit.",
        body:
          "A coat earns its price in the seams. We look for a full lining that can be replaced, a shoulder that sits on the natural line, and cloth heavy enough to hold a press. Everything else is decoration.",
        category: "Field notes",
        href: "/collections/atelier-noir",
        sortOrder: 0,
      },
      {
        title: "Linen, and why it should crease",
        standfirst:
          "A short guide to the weave we return to every spring, and how to wash it without losing the hand.",
        body:
          "Stone-washed linen softens with every wear. Wash cool, skip the dryer, and hang it damp. The rumple you see after a long lunch is the fibre relaxing, not the shirt failing.",
        category: "Cloth",
        href: "/collections/linen-season",
        sortOrder: 1,
      },
      {
        title: "Repair is part of the design",
        standfirst:
          "Send back anything that wears through. We re-stitch, patch and return it for the life of the piece.",
        body:
          "Our repair bench sees more elbows and hems than anything else. Bring a garment in at the first sign of wear and it usually costs nothing; leave it a season and the fix gets bigger. Write to the studio with a photograph and we will tell you what it needs.",
        category: "Care",
        href: "/#story",
        sortOrder: 2,
      },
    ],
  });

  await prisma.wishlistItem.createMany({
    data: [
      { customerId: createdCustomers[0].id, productId: createdProductIds[0] },
      { customerId: createdCustomers[0].id, productId: createdProductIds[12] },
      { customerId: createdCustomers[2].id, productId: createdProductIds[6] },
    ],
  });

  const [collectionCount, productCount, variantCount, orderCount] =
    await Promise.all([
      prisma.collection.count(),
      prisma.product.count(),
      prisma.variant.count(),
      prisma.order.count(),
    ]);
  console.log(
    `Seeded ${collectionCount} collections, ${productCount} products, ${variantCount} variants, ${orderCount} orders.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
