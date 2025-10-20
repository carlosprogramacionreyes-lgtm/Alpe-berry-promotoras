import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { setupAuth, requireAuth, requireRole, hashPassword } from "./auth";
import { storage } from "./storage";
import { 
  insertUserSchema, insertChainSchema, insertZoneSchema, 
  insertStoreSchema, insertProductSchema, insertStoreAssignmentSchema,
  insertEvaluationSchema, insertIncidentSchema, insertEvaluationFieldSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Auth routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Error en el servidor" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Usuario o contraseña incorrectos" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error al iniciar sesión" });
        }
        return res.json({ user });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.json({ message: "Sesión cerrada" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  // User management routes
  app.get("/api/users", requireAuth, requireRole("admin", "supervisor"), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });

  app.post("/api/users", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.findUserByUsernameCaseInsensitive(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Ya existe un usuario con ese nombre de usuario" });
      }
      
      const hashedPass = await hashPassword(userData.password);
      const user = await storage.createUser({ ...userData, password: hashedPass });
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al crear usuario" });
    }
  });

  app.put("/api/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      if (userData.username) {
        const existingUser = await storage.findUserByUsernameCaseInsensitive(userData.username, id);
        if (existingUser) {
          return res.status(400).json({ message: "Ya existe un usuario con ese nombre de usuario" });
        }
      }
      
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al actualizar usuario" });
    }
  });

  app.delete("/api/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ message: "Usuario eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  });

  // Chain management routes
  app.get("/api/chains", requireAuth, async (req, res) => {
    try {
      const chains = await storage.getAllChains();
      res.json(chains);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener cadenas" });
    }
  });

  app.post("/api/chains", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const chainData = insertChainSchema.parse(req.body);
      
      const existingChain = await storage.findChainByNameCaseInsensitive(chainData.name);
      if (existingChain) {
        return res.status(400).json({ message: "Ya existe una cadena con ese nombre" });
      }
      
      const chain = await storage.createChain(chainData);
      res.json(chain);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al crear cadena" });
    }
  });

  app.put("/api/chains/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const chainData = req.body;
      
      if (chainData.name) {
        const existingChain = await storage.findChainByNameCaseInsensitive(chainData.name, id);
        if (existingChain) {
          return res.status(400).json({ message: "Ya existe una cadena con ese nombre" });
        }
      }
      
      const chain = await storage.updateChain(id, chainData);
      if (!chain) {
        return res.status(404).json({ message: "Cadena no encontrada" });
      }
      res.json(chain);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al actualizar cadena" });
    }
  });

  app.delete("/api/chains/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteChain(id);
      if (!deleted) {
        return res.status(404).json({ message: "Cadena no encontrada" });
      }
      res.json({ message: "Cadena eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar cadena" });
    }
  });

  // Zone management routes
  app.get("/api/zones", requireAuth, async (req, res) => {
    try {
      const { chainId } = req.query;
      const zones = chainId 
        ? await storage.getZonesByChain(chainId as string)
        : await storage.getAllZones();
      res.json(zones);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener zonas" });
    }
  });

  app.post("/api/zones", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const zoneData = insertZoneSchema.parse(req.body);
      
      const existingZone = await storage.findZoneByNameCaseInsensitive(zoneData.name, zoneData.chainId);
      if (existingZone) {
        return res.status(400).json({ message: "Ya existe una zona con ese nombre en esta cadena" });
      }
      
      const zone = await storage.createZone(zoneData);
      res.json(zone);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al crear zona" });
    }
  });

  app.put("/api/zones/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const zoneData = req.body;
      
      if (zoneData.name && zoneData.chainId) {
        const existingZone = await storage.findZoneByNameCaseInsensitive(zoneData.name, zoneData.chainId, id);
        if (existingZone) {
          return res.status(400).json({ message: "Ya existe una zona con ese nombre en esta cadena" });
        }
      }
      
      const zone = await storage.updateZone(id, zoneData);
      if (!zone) {
        return res.status(404).json({ message: "Zona no encontrada" });
      }
      res.json(zone);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al actualizar zona" });
    }
  });

  app.delete("/api/zones/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteZone(id);
      if (!deleted) {
        return res.status(404).json({ message: "Zona no encontrada" });
      }
      res.json({ message: "Zona eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar zona" });
    }
  });

  // Store management routes
  app.get("/api/stores", requireAuth, async (req, res) => {
    try {
      const { chainId, zoneId } = req.query;
      let stores;
      
      if (zoneId) {
        stores = await storage.getStoresByZone(zoneId as string);
      } else if (chainId) {
        stores = await storage.getStoresByChain(chainId as string);
      } else {
        stores = await storage.getAllStores();
      }
      
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener tiendas" });
    }
  });

  app.post("/api/stores", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const storeData = insertStoreSchema.parse(req.body);
      
      const existingStore = await storage.findStoreByNameCaseInsensitive(storeData.name);
      if (existingStore) {
        return res.status(400).json({ message: "Ya existe una tienda con ese nombre" });
      }
      
      const store = await storage.createStore(storeData);
      res.json(store);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al crear tienda" });
    }
  });

  app.put("/api/stores/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const storeData = req.body;
      
      if (storeData.name) {
        const existingStore = await storage.findStoreByNameCaseInsensitive(storeData.name, id);
        if (existingStore) {
          return res.status(400).json({ message: "Ya existe una tienda con ese nombre" });
        }
      }
      
      const store = await storage.updateStore(id, storeData);
      if (!store) {
        return res.status(404).json({ message: "Tienda no encontrada" });
      }
      res.json(store);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al actualizar tienda" });
    }
  });

  app.delete("/api/stores/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteStore(id);
      if (!deleted) {
        return res.status(404).json({ message: "Tienda no encontrada" });
      }
      res.json({ message: "Tienda eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar tienda" });
    }
  });

  // Product management routes
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productos" });
    }
  });

  app.post("/api/products", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      const existingProduct = await storage.findProductByNameCaseInsensitive(productData.name);
      if (existingProduct) {
        return res.status(400).json({ message: "Ya existe un producto con ese nombre" });
      }
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al crear producto" });
    }
  });

  app.put("/api/products/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;
      
      if (productData.name) {
        const existingProduct = await storage.findProductByNameCaseInsensitive(productData.name, id);
        if (existingProduct) {
          return res.status(400).json({ message: "Ya existe un producto con ese nombre" });
        }
      }
      
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al actualizar producto" });
    }
  });

  app.delete("/api/products/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.json({ message: "Producto eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar producto" });
    }
  });

  // Store Assignment routes
  app.get("/api/store-assignments", requireAuth, requireRole("admin", "supervisor"), async (req, res) => {
    try {
      const { userId, storeId } = req.query;
      
      if (userId) {
        const assignments = await storage.getStoreAssignmentsByUser(userId as string);
        return res.json(assignments);
      }
      
      if (storeId) {
        const assignments = await storage.getStoreAssignmentsByStore(storeId as string);
        return res.json(assignments);
      }
      
      // Get all assignments when no filter is provided
      const allAssignments = await storage.getAllStoreAssignments();
      res.json(allAssignments);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener asignaciones" });
    }
  });

  app.post("/api/store-assignments", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const assignmentData = insertStoreAssignmentSchema.parse(req.body);
      const assignment = await storage.assignUserToStore(assignmentData);
      res.json(assignment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al crear asignación" });
    }
  });

  app.delete("/api/store-assignments/:userId/:storeId", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { userId, storeId } = req.params;
      const deleted = await storage.removeStoreAssignment(userId, storeId);
      if (!deleted) {
        return res.status(404).json({ message: "Asignación no encontrada" });
      }
      res.json({ message: "Asignación eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar asignación" });
    }
  });

  // Evaluation routes
  app.get("/api/evaluations", requireAuth, async (req, res) => {
    try {
      const { userId, storeId } = req.query;
      let evaluations;
      
      if (userId) {
        evaluations = await storage.getEvaluationsByUser(userId as string);
      } else if (storeId) {
        evaluations = await storage.getEvaluationsByStore(storeId as string);
      } else {
        evaluations = await storage.getAllEvaluations();
      }
      
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener evaluaciones" });
    }
  });

  app.get("/api/evaluations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const evaluation = await storage.getEvaluation(id);
      if (!evaluation) {
        return res.status(404).json({ message: "Evaluación no encontrada" });
      }
      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener evaluación" });
    }
  });

  app.post("/api/evaluations", requireAuth, async (req, res) => {
    try {
      const evaluationData = insertEvaluationSchema.parse({
        ...req.body,
        userId: req.user?.id,
      });
      const evaluation = await storage.createEvaluation(evaluationData);
      res.json(evaluation);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al crear evaluación" });
    }
  });

  app.put("/api/evaluations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const evaluation = await storage.updateEvaluation(id, req.body);
      if (!evaluation) {
        return res.status(404).json({ message: "Evaluación no encontrada" });
      }
      res.json(evaluation);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al actualizar evaluación" });
    }
  });

  // Incident routes
  app.get("/api/incidents", requireAuth, async (req, res) => {
    try {
      const { evaluationId } = req.query;
      if (!evaluationId) {
        return res.status(400).json({ message: "Se requiere evaluationId" });
      }
      const incidents = await storage.getIncidentsByEvaluation(evaluationId as string);
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener incidencias" });
    }
  });

  app.post("/api/incidents", requireAuth, async (req, res) => {
    try {
      const incidentData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(incidentData);
      res.json(incident);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al crear incidencia" });
    }
  });

  app.put("/api/incidents/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const incident = await storage.updateIncident(id, req.body);
      if (!incident) {
        return res.status(404).json({ message: "Incidencia no encontrada" });
      }
      res.json(incident);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al actualizar incidencia" });
    }
  });

  app.delete("/api/incidents/:id", requireAuth, requireRole("admin", "supervisor"), async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteIncident(id);
      if (!deleted) {
        return res.status(404).json({ message: "Incidencia no encontrada" });
      }
      res.json({ message: "Incidencia eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar incidencia" });
    }
  });

  // Dashboard stats routes
  app.get("/api/stats/dashboard", requireAuth, async (req, res) => {
    try {
      const evaluations = await storage.getAllEvaluations();
      const users = await storage.getAllUsers();
      const stores = await storage.getAllStores();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const visitsToday = evaluations.filter(e => {
        const evalDate = new Date(e.createdAt);
        evalDate.setHours(0, 0, 0, 0);
        return evalDate.getTime() === today.getTime();
      }).length;
      
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const visitsThisMonth = evaluations.filter(e => {
        const evalDate = new Date(e.createdAt);
        return evalDate.getMonth() === currentMonth && evalDate.getFullYear() === currentYear;
      }).length;
      
      const completedEvaluations = evaluations.filter(e => e.status === 'completed');
      const activePromoters = users.filter(u => u.role === 'promotor' && u.active).length;
      
      const avgFreshness = completedEvaluations.length > 0
        ? completedEvaluations.reduce((sum, e) => sum + (e.freshness || 0), 0) / completedEvaluations.length
        : 0;
      
      res.json({
        visitsToday,
        visitsThisMonth,
        activePromoters,
        totalStores: stores.length,
        completedEvaluations: completedEvaluations.length,
        pendingEvaluations: evaluations.filter(e => e.status === 'in_progress').length,
        avgQuality: avgFreshness.toFixed(1),
      });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener estadísticas" });
    }
  });

  // Backup logs routes
  app.get("/api/backup-logs", requireAuth, requireRole("admin", "supervisor"), async (req, res) => {
    try {
      const backupLogs = await storage.getAllBackupLogs();
      res.json(backupLogs);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener historial de respaldos" });
    }
  });

  // Database tables routes
  app.get("/api/database/tables", requireAuth, requireRole("admin", "supervisor"), async (req, res) => {
    try {
      const tables = await storage.getDatabaseTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener tablas de la base de datos" });
    }
  });

  // Database backup route
  app.post("/api/database/backup", requireAuth, requireRole("admin", "supervisor"), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const user = req.user as any;
      const backupFilename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      
      const backupContent = await storage.generateDatabaseStructureBackup();
      
      await storage.createBackupLog({
        filename: backupFilename,
        adminUserId: user.id,
        adminUsername: user.username,
      });
      
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${backupFilename}"`);
      res.send(backupContent);
    } catch (error: any) {
      console.error('Error generating backup:', error);
      res.status(500).json({ message: error.message || "Error al generar respaldo" });
    }
  });

  // Evaluation fields routes
  app.get("/api/evaluation-fields", requireAuth, async (req, res) => {
    try {
      const fields = await storage.getAllEvaluationFields();
      res.json(fields);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener campos de evaluación" });
    }
  });

  app.post("/api/evaluation-fields", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const fieldData = insertEvaluationFieldSchema.parse(req.body);
      
      const existingField = await storage.findEvaluationFieldByTechnicalName(fieldData.technicalName);
      if (existingField) {
        return res.status(400).json({ message: "Ya existe un campo con ese nombre técnico" });
      }
      
      const field = await storage.createEvaluationField(fieldData);
      res.json(field);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al crear campo" });
    }
  });

  app.put("/api/evaluation-fields/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const fieldData = insertEvaluationFieldSchema.partial().parse(req.body);
      
      if (fieldData.technicalName) {
        const existingField = await storage.findEvaluationFieldByTechnicalName(fieldData.technicalName);
        if (existingField && existingField.id !== id) {
          return res.status(400).json({ message: "Ya existe un campo con ese nombre técnico" });
        }
      }
      
      const field = await storage.updateEvaluationField(id, fieldData);
      res.json(field);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al actualizar campo" });
    }
  });

  app.delete("/api/evaluation-fields/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEvaluationField(id);
      res.json({ message: "Campo eliminado correctamente" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error al eliminar campo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
