import { db } from "./db";
import { 
  users, chains, zones, stores, products, storeAssignments, evaluations, incidents,
  type User, type InsertUser,
  type Chain, type InsertChain,
  type Zone, type InsertZone,
  type Store, type InsertStore,
  type Product, type InsertProduct,
  type StoreAssignment, type InsertStoreAssignment,
  type Evaluation, type InsertEvaluation,
  type Incident, type InsertIncident,
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Chains
  getChain(id: string): Promise<Chain | undefined>;
  getChainByName(name: string): Promise<Chain | undefined>;
  createChain(chain: InsertChain): Promise<Chain>;
  deleteChain(id: string): Promise<boolean>;
  getAllChains(): Promise<Chain[]>;

  // Zones
  getZone(id: string): Promise<Zone | undefined>;
  getZonesByChain(chainId: string): Promise<Zone[]>;
  createZone(zone: InsertZone): Promise<Zone>;
  deleteZone(id: string): Promise<boolean>;
  getAllZones(): Promise<Zone[]>;

  // Stores
  getStore(id: string): Promise<Store | undefined>;
  getStoresByZone(zoneId: string): Promise<Store[]>;
  getStoresByChain(chainId: string): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, store: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;
  getAllStores(): Promise<Store[]>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getAllProducts(): Promise<Product[]>;

  // Store Assignments
  assignUserToStore(assignment: InsertStoreAssignment): Promise<StoreAssignment>;
  getUserStores(userId: string): Promise<Store[]>;
  getStoreUsers(storeId: string): Promise<User[]>;
  removeStoreAssignment(userId: string, storeId: string): Promise<boolean>;

  // Evaluations
  getEvaluation(id: string): Promise<Evaluation | undefined>;
  getEvaluationsByUser(userId: string): Promise<Evaluation[]>;
  getEvaluationsByStore(storeId: string): Promise<Evaluation[]>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  updateEvaluation(id: string, evaluation: Partial<InsertEvaluation>): Promise<Evaluation | undefined>;
  getAllEvaluations(): Promise<Evaluation[]>;

  // Incidents
  getIncident(id: string): Promise<Incident | undefined>;
  getIncidentsByEvaluation(evaluationId: string): Promise<Incident[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, incident: Partial<InsertIncident>): Promise<Incident | undefined>;
  deleteIncident(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Chains
  async getChain(id: string): Promise<Chain | undefined> {
    const result = await db.select().from(chains).where(eq(chains.id, id)).limit(1);
    return result[0];
  }

  async getChainByName(name: string): Promise<Chain | undefined> {
    const result = await db.select().from(chains).where(eq(chains.name, name)).limit(1);
    return result[0];
  }

  async createChain(chain: InsertChain): Promise<Chain> {
    const result = await db.insert(chains).values(chain).returning();
    return result[0];
  }

  async deleteChain(id: string): Promise<boolean> {
    const result = await db.delete(chains).where(eq(chains.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllChains(): Promise<Chain[]> {
    return await db.select().from(chains).orderBy(desc(chains.createdAt));
  }

  // Zones
  async getZone(id: string): Promise<Zone | undefined> {
    const result = await db.select().from(zones).where(eq(zones.id, id)).limit(1);
    return result[0];
  }

  async getZonesByChain(chainId: string): Promise<Zone[]> {
    return await db.select().from(zones).where(eq(zones.chainId, chainId)).orderBy(zones.name);
  }

  async createZone(zone: InsertZone): Promise<Zone> {
    const result = await db.insert(zones).values(zone).returning();
    return result[0];
  }

  async deleteZone(id: string): Promise<boolean> {
    const result = await db.delete(zones).where(eq(zones.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllZones(): Promise<Zone[]> {
    return await db.select().from(zones).orderBy(desc(zones.createdAt));
  }

  // Stores
  async getStore(id: string): Promise<Store | undefined> {
    const result = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
    return result[0];
  }

  async getStoresByZone(zoneId: string): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.zoneId, zoneId)).orderBy(stores.name);
  }

  async getStoresByChain(chainId: string): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.chainId, chainId)).orderBy(stores.name);
  }

  async createStore(store: InsertStore): Promise<Store> {
    const result = await db.insert(stores).values(store).returning();
    return result[0];
  }

  async updateStore(id: string, store: Partial<InsertStore>): Promise<Store | undefined> {
    const result = await db.update(stores).set(store).where(eq(stores.id, id)).returning();
    return result[0];
  }

  async deleteStore(id: string): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllStores(): Promise<Store[]> {
    return await db.select().from(stores).orderBy(desc(stores.createdAt));
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  // Store Assignments
  async assignUserToStore(assignment: InsertStoreAssignment): Promise<StoreAssignment> {
    const result = await db.insert(storeAssignments).values(assignment).returning();
    return result[0];
  }

  async getUserStores(userId: string): Promise<Store[]> {
    const result = await db
      .select({ store: stores })
      .from(storeAssignments)
      .innerJoin(stores, eq(storeAssignments.storeId, stores.id))
      .where(eq(storeAssignments.userId, userId));
    return result.map(r => r.store);
  }

  async getStoreUsers(storeId: string): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(storeAssignments)
      .innerJoin(users, eq(storeAssignments.userId, users.id))
      .where(eq(storeAssignments.storeId, storeId));
    return result.map(r => r.user);
  }

  async removeStoreAssignment(userId: string, storeId: string): Promise<boolean> {
    const result = await db
      .delete(storeAssignments)
      .where(and(
        eq(storeAssignments.userId, userId),
        eq(storeAssignments.storeId, storeId)
      ));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Evaluations
  async getEvaluation(id: string): Promise<Evaluation | undefined> {
    const result = await db.select().from(evaluations).where(eq(evaluations.id, id)).limit(1);
    return result[0];
  }

  async getEvaluationsByUser(userId: string): Promise<Evaluation[]> {
    return await db.select().from(evaluations).where(eq(evaluations.userId, userId)).orderBy(desc(evaluations.createdAt));
  }

  async getEvaluationsByStore(storeId: string): Promise<Evaluation[]> {
    return await db.select().from(evaluations).where(eq(evaluations.storeId, storeId)).orderBy(desc(evaluations.createdAt));
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    const result = await db.insert(evaluations).values(evaluation).returning();
    return result[0];
  }

  async updateEvaluation(id: string, evaluation: Partial<InsertEvaluation>): Promise<Evaluation | undefined> {
    const result = await db.update(evaluations).set({
      ...evaluation,
      updatedAt: new Date(),
    }).where(eq(evaluations.id, id)).returning();
    return result[0];
  }

  async getAllEvaluations(): Promise<Evaluation[]> {
    return await db.select().from(evaluations).orderBy(desc(evaluations.createdAt));
  }

  // Incidents
  async getIncident(id: string): Promise<Incident | undefined> {
    const result = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
    return result[0];
  }

  async getIncidentsByEvaluation(evaluationId: string): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.evaluationId, evaluationId)).orderBy(desc(incidents.createdAt));
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const result = await db.insert(incidents).values(incident).returning();
    return result[0];
  }

  async updateIncident(id: string, incident: Partial<InsertIncident>): Promise<Incident | undefined> {
    const result = await db.update(incidents).set(incident).where(eq(incidents.id, id)).returning();
    return result[0];
  }

  async deleteIncident(id: string): Promise<boolean> {
    const result = await db.delete(incidents).where(eq(incidents.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DbStorage();
