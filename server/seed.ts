import { db } from "./db";
import { users, chains, zones, stores, products } from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await hashPassword("admin123");
  const [admin] = await db.insert(users).values({
    username: "superadmin",
    email: "admin@admin.com",
    password: hashedPassword,
    name: "Super Admin",
    role: "admin",
  }).returning();
  console.log("Created admin user:", admin.username);

  // Create promoter user
  const promoterPassword = await hashPassword("promoter123");
  const [promoter] = await db.insert(users).values({
    username: "carlos",
    email: "admin@test.com",
    password: promoterPassword,
    name: "Carlos",
    role: "promotor",
  }).returning();
  console.log("Created promoter user:", promoter.username);

  // Create another promoter
  const promoter2Password = await hashPassword("lucio123");
  const [promoter2] = await db.insert(users).values({
    username: "lucio",
    email: "lucio@gmail.com.mx",
    password: promoter2Password,
    name: "Lucio",
    role: "promotor",
  }).returning();
  console.log("Created promoter user:", promoter2.username);

  // Create chains
  const [hebChain] = await db.insert(chains).values({
    name: "HEB",
    description: "H-E-B Supermercados",
  }).returning();
  console.log("Created chain:", hebChain.name);

  const [lacomerChain] = await db.insert(chains).values({
    name: "La Comer",
    description: "—",
  }).returning();
  console.log("Created chain:", lacomerChain.name);

  // Create zone
  const [norteZone] = await db.insert(zones).values({
    chainId: lacomerChain.id,
    name: "Norte",
    description: "—",
  }).returning();
  console.log("Created zone:", norteZone.name);

  // Create stores
  const [store1] = await db.insert(stores).values({
    chainId: lacomerChain.id,
    zoneId: norteZone.id,
    name: "comer nor test",
    city: "Monterrey",
    latitude: "25.6866",
    longitude: "-100.3161",
    geofenceRadius: 100,
  }).returning();
  console.log("Created store:", store1.name);

  const [store2] = await db.insert(stores).values({
    chainId: lacomerChain.id,
    zoneId: norteZone.id,
    name: "La comer Nor",
    city: "Monterrey",
    latitude: "25.6866",
    longitude: "-100.3161",
    geofenceRadius: 100,
  }).returning();
  console.log("Created store:", store2.name);

  // Create products
  const [espinaca] = await db.insert(products).values({
    name: "Espinaca Baby",
    icon: "Grape",
    color: "hsl(142, 71%, 45%)",
  }).returning();
  console.log("Created product:", espinaca.name);

  const [arandano] = await db.insert(products).values({
    name: "Arándano",
    icon: "Apple",
    color: "hsl(217, 91%, 60%)",
  }).returning();
  console.log("Created product:", arandano.name);

  const [frambuesa] = await db.insert(products).values({
    name: "Frambuesa",
    icon: "Cherry",
    color: "hsl(340, 82%, 52%)",
  }).returning();
  console.log("Created product:", frambuesa.name);

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
