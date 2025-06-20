import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { proxyMiddleware } from "./proxy";
import { insertApiSchema, insertModelAliasSchema, insertApiUserSchema, insertConfigurationSchema, insertAdminSchema } from "@shared/schema";

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    admin?: {
      id: number;
      username: string;
    };
  }
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: any) {
  if (req.session?.admin) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // OpenAI-compatible proxy endpoints - register these first
  app.all('/v1/*', proxyMiddleware);

  // Authentication routes (no auth required)
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const admin = await storage.validateAdminCredentials(username, password);
      if (admin) {
        req.session.admin = { id: admin.id, username: admin.username };
        res.json({ success: true, admin: { id: admin.id, username: admin.username } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        res.status(500).json({ error: 'Logout failed' });
      } else {
        res.json({ success: true });
      }
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    if (req.session?.admin) {
      res.json({ admin: req.session.admin });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  // Admin management routes (protected)
  app.get('/api/admins', requireAuth, async (req, res) => {
    try {
      const admins = await storage.getAdmins();
      // Remove passwords from response
      const safeAdmins = admins.map(admin => ({ ...admin, password: undefined }));
      res.json(safeAdmins);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch admins' });
    }
  });

  app.post('/api/admins', requireAuth, async (req, res) => {
    try {
      const validatedData = insertAdminSchema.parse(req.body);
      const admin = await storage.createAdmin(validatedData);
      const safeAdmin = { ...admin, password: undefined };
      res.status(201).json(safeAdmin);
    } catch (error) {
      res.status(400).json({ error: 'Invalid admin data' });
    }
  });

  app.put('/api/admins/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAdminSchema.partial().parse(req.body);
      const admin = await storage.updateAdmin(id, validatedData);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      const safeAdmin = { ...admin, password: undefined };
      res.json(safeAdmin);
    } catch (error) {
      res.status(400).json({ error: 'Invalid admin data' });
    }
  });

  app.delete('/api/admins/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAdmin(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete admin' });
    }
  });

  // Protected admin API routes
  app.get('/api/stats', requireAuth, async (req, res) => {
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

  // API test endpoint
  app.post('/api/test-api/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const api = await storage.getApi(id);
      if (!api || !api.isActive) {
        return res.status(404).json({ error: 'API not found or inactive' });
      }

      // Make direct call to the upstream API for testing
      const upstreamUrl = api.baseUrl.endsWith('/') ? api.baseUrl + "chat/completions" : api.baseUrl + "/chat/completions";
      console.log(`Testing API ${api.id} (${api.name}) at ${upstreamUrl} with model ${api.modelName}`);
      
      const response = await fetch(upstreamUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${api.apiKey}`,
        },
        body: JSON.stringify({
          model: api.modelName,
          messages: [
            { role: "user", content: message }
          ],
          max_tokens: 150,
          temperature: 0.7
        }),
      });

      const data = await response.json();
      console.log(`API response status: ${response.status}, data:`, data);
      
      if (response.ok && data.choices && data.choices[0]) {
        res.json({ 
          success: true, 
          response: data.choices[0].message.content,
          usage: data.usage
        });
      } else {
        res.status(response.status).json({ 
          success: false, 
          error: data.error?.message || `API returned status ${response.status}`,
          details: data
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Network error occurred" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
