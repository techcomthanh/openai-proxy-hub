import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { proxyMiddleware } from "./proxy";
import { insertApiSchema, insertModelAliasSchema, insertApiUserSchema, insertConfigurationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // OpenAI-compatible proxy endpoints
  app.use('/v1/*', proxyMiddleware);

  // Admin API routes
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // API management routes
  app.get('/api/apis', async (req, res) => {
    try {
      const apis = await storage.getApis();
      res.json(apis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch APIs' });
    }
  });

  app.post('/api/apis', async (req, res) => {
    try {
      const validatedData = insertApiSchema.parse(req.body);
      const api = await storage.createApi(validatedData);
      res.status(201).json(api);
    } catch (error) {
      res.status(400).json({ error: 'Invalid API data' });
    }
  });

  app.put('/api/apis/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertApiSchema.partial().parse(req.body);
      const api = await storage.updateApi(id, validatedData);
      if (!api) {
        return res.status(404).json({ error: 'API not found' });
      }
      res.json(api);
    } catch (error) {
      res.status(400).json({ error: 'Invalid API data' });
    }
  });

  app.delete('/api/apis/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteApi(id);
      if (!deleted) {
        return res.status(404).json({ error: 'API not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete API' });
    }
  });

  // Model alias routes
  app.get('/api/model-aliases', async (req, res) => {
    try {
      const aliases = await storage.getModelAliases();
      res.json(aliases);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch model aliases' });
    }
  });

  app.post('/api/model-aliases', async (req, res) => {
    try {
      const validatedData = insertModelAliasSchema.parse(req.body);
      const alias = await storage.createModelAlias(validatedData);
      res.status(201).json(alias);
    } catch (error) {
      res.status(400).json({ error: 'Invalid model alias data' });
    }
  });

  app.put('/api/model-aliases/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertModelAliasSchema.partial().parse(req.body);
      const alias = await storage.updateModelAlias(id, validatedData);
      if (!alias) {
        return res.status(404).json({ error: 'Model alias not found' });
      }
      res.json(alias);
    } catch (error) {
      res.status(400).json({ error: 'Invalid model alias data' });
    }
  });

  app.delete('/api/model-aliases/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteModelAlias(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Model alias not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete model alias' });
    }
  });

  // User management routes
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getApiUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const validatedData = insertApiUserSchema.parse(req.body);
      const user = await storage.createApiUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: 'Invalid user data' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertApiUserSchema.partial().parse(req.body);
      const user = await storage.updateApiUser(id, validatedData);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: 'Invalid user data' });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteApiUser(id);
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Request logs routes
  app.get('/api/request-logs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getRequestLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch request logs' });
    }
  });

  // Configuration routes
  app.get('/api/configuration', async (req, res) => {
    try {
      const config = await storage.getAllConfiguration();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch configuration' });
    }
  });

  app.put('/api/configuration/:key', async (req, res) => {
    try {
      const key = req.params.key;
      const validatedData = insertConfigurationSchema.parse({ key, value: req.body.value });
      const config = await storage.setConfiguration(validatedData);
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: 'Invalid configuration data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
