import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  name: text("name").notNull(),
  role: text("role").notNull().default('promotor'),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const chains = pgTable("chains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChainSchema = createInsertSchema(chains).omit({
  id: true,
  createdAt: true,
});

export type InsertChain = z.infer<typeof insertChainSchema>;
export type Chain = typeof chains.$inferSelect;

export const zones = pgTable("zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chainId: varchar("chain_id").notNull().references(() => chains.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertZoneSchema = createInsertSchema(zones).omit({
  id: true,
  createdAt: true,
});

export type InsertZone = z.infer<typeof insertZoneSchema>;
export type Zone = typeof zones.$inferSelect;

export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chainId: varchar("chain_id").notNull().references(() => chains.id, { onDelete: 'cascade' }),
  zoneId: varchar("zone_id").notNull().references(() => zones.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  geofenceRadius: integer("geofence_radius").default(100),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
});

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const storeAssignments = pgTable("store_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  storeId: varchar("store_id").notNull().references(() => stores.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStoreAssignmentSchema = createInsertSchema(storeAssignments).omit({
  id: true,
  createdAt: true,
});

export type InsertStoreAssignment = z.infer<typeof insertStoreAssignmentSchema>;
export type StoreAssignment = typeof storeAssignments.$inferSelect;

export const evaluations = pgTable("evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  storeId: varchar("store_id").notNull().references(() => stores.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  status: text("status").notNull().default('in_progress'),
  currentStep: integer("current_step").notNull().default(1),
  
  stock: integer("stock"),
  location: text("location"),
  displayCondition: text("display_condition"),
  areaPhotoUrl: text("area_photo_url"),
  
  freshness: integer("freshness"),
  appearance: text("appearance"),
  packagingCondition: text("packaging_condition"),
  qualityPhotoUrl: text("quality_photo_url"),
  
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  suggestedPrice: decimal("suggested_price", { precision: 10, scale: 2 }),
  activePromotions: text("active_promotions").array(),
  pricePhotoUrl: text("price_photo_url"),
  
  hasIncidents: boolean("has_incidents").default(false),
  
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEvaluationSchema = createInsertSchema(evaluations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  completedAt: z.coerce.date().optional().nullable(),
});

export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluations.$inferSelect;

export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  evaluationId: varchar("evaluation_id").notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  description: text("description"),
  actionRequired: text("action_required"),
  photoUrl: text("photo_url"),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

export const backupLogs = pgTable("backup_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  adminUserId: varchar("admin_user_id").notNull().references(() => users.id),
  adminUsername: text("admin_username").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBackupLogSchema = createInsertSchema(backupLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertBackupLog = z.infer<typeof insertBackupLogSchema>;
export type BackupLog = typeof backupLogs.$inferSelect;

export const promoterVisits = pgTable("promoter_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  storeId: varchar("store_id").notNull().references(() => stores.id, { onDelete: 'cascade' }),
  checkInTime: timestamp("check_in_time").notNull().defaultNow(),
  checkOutTime: timestamp("check_out_time"),
  checkInLatitude: decimal("check_in_latitude", { precision: 10, scale: 7 }),
  checkInLongitude: decimal("check_in_longitude", { precision: 10, scale: 7 }),
  checkOutLatitude: decimal("check_out_latitude", { precision: 10, scale: 7 }),
  checkOutLongitude: decimal("check_out_longitude", { precision: 10, scale: 7 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPromoterVisitSchema = createInsertSchema(promoterVisits).omit({
  id: true,
  createdAt: true,
});

export type InsertPromoterVisit = z.infer<typeof insertPromoterVisitSchema>;
export type PromoterVisit = typeof promoterVisits.$inferSelect;
