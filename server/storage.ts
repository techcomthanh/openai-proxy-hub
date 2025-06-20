import { apis, modelAliases, apiUsers, requestLogs, configuration, users, type Api, type InsertApi, type ModelAlias, type InsertModelAlias, type ApiUser, type InsertApiUser, type RequestLog, type InsertRequestLog, type Configuration, type InsertConfiguration, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, count } from "drizzle-orm";

export interface IStorage {
  // Legacy user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // API methods
  getApis(): Promise<Api[]>;
  getApi(id: number): Promise<Api | undefined>;
  createApi(api: InsertApi): Promise<Api>;
  updateApi(id: number, api: Partial<InsertApi>): Promise<Api | undefined>;
  deleteApi(id: number): Promise<boolean>;

  // Model alias methods
  getModelAliases(): Promise<ModelAlias[]>;
  getModelAlias(alias: string): Promise<ModelAlias | undefined>;
  createModelAlias(modelAlias: InsertModelAlias): Promise<ModelAlias>;
  updateModelAlias(id: number, modelAlias: Partial<InsertModelAlias>): Promise<ModelAlias | undefined>;
  deleteModelAlias(id: number): Promise<boolean>;

  // API user methods
  getApiUsers(): Promise<ApiUser[]>;
  getApiUser(id: number): Promise<ApiUser | undefined>;
  getApiUserByKey(apiKey: string): Promise<ApiUser | undefined>;
  createApiUser(apiUser: InsertApiUser): Promise<ApiUser>;
  updateApiUser(id: number, apiUser: Partial<InsertApiUser>): Promise<ApiUser | undefined>;
  deleteApiUser(id: number): Promise<boolean>;

  // Request log methods
  getRequestLogs(limit?: number): Promise<RequestLog[]>;
  createRequestLog(log: InsertRequestLog): Promise<RequestLog>;

  // Configuration methods
  getConfiguration(key: string): Promise<Configuration | undefined>;
  setConfiguration(config: InsertConfiguration): Promise<Configuration>;
  getAllConfiguration(): Promise<Configuration[]>;

  // Stats methods
  getStats(): Promise<{
    activeApis: number;
    modelAliases: number;
    activeUsers: number;
    requestsToday: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apis: Map<number, Api>;
  private modelAliases: Map<number, ModelAlias>;
  private apiUsers: Map<number, ApiUser>;
  private requestLogs: Map<number, RequestLog>;
  private configuration: Map<string, Configuration>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.apis = new Map();
    this.modelAliases = new Map();
    this.apiUsers = new Map();
    this.requestLogs = new Map();
    this.configuration = new Map();
    this.currentId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample APIs
    const api1: Api = {
      id: this.currentId++,
      name: "Roxane API",
      baseUrl: "https://myapi.roxane.one/v1/",
      apiKey: "sk-apikey1",
      modelName: "Qwen/Qwen2.5-Coder-7B-Instruct-AWQ",
      isActive: true,
      createdAt: new Date(),
    };
    this.apis.set(api1.id, api1);

    const api2: Api = {
      id: this.currentId++,
      name: "Drake API",
      baseUrl: "https://drake-cpapxtg0my-coding.roxane.one/v1/",
      apiKey: "sk-api2",
      modelName: "Qwen/Qwen3-8B-AWQ",
      isActive: true,
      createdAt: new Date(),
    };
    this.apis.set(api2.id, api2);

    // Add sample model aliases
    const alias1: ModelAlias = {
      id: this.currentId++,
      alias: "coder-model",
      apiId: api1.id,
      isActive: true,
      createdAt: new Date(),
    };
    this.modelAliases.set(alias1.id, alias1);

    const alias2: ModelAlias = {
      id: this.currentId++,
      alias: "embedding-model",
      apiId: api1.id,
      isActive: true,
      createdAt: new Date(),
    };
    this.modelAliases.set(alias2.id, alias2);

    // Add sample users
    const user1: ApiUser = {
      id: this.currentId++,
      name: "User 1",
      apiKey: "user1-api-key",
      allowedModels: ["coder-model", "embedding-model"],
      isActive: true,
      createdAt: new Date(),
    };
    this.apiUsers.set(user1.id, user1);

    const user2: ApiUser = {
      id: this.currentId++,
      name: "User 2",
      apiKey: "user2-api-key",
      allowedModels: ["coder-model"],
      isActive: true,
      createdAt: new Date(),
    };
    this.apiUsers.set(user2.id, user2);

    // Add sample configuration
    this.configuration.set("proxyUrl", {
      id: this.currentId++,
      key: "proxyUrl",
      value: "http://mydomain.com/v1",
      updatedAt: new Date(),
    });

    this.configuration.set("requestTimeout", {
      id: this.currentId++,
      key: "requestTimeout",
      value: 30,
      updatedAt: new Date(),
    });
  }

  // Legacy user methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // API methods
  async getApis(): Promise<Api[]> {
    return Array.from(this.apis.values());
  }

  async getApi(id: number): Promise<Api | undefined> {
    return this.apis.get(id);
  }

  async createApi(insertApi: InsertApi): Promise<Api> {
    const id = this.currentId++;
    const api: Api = {
      id,
      name: insertApi.name,
      baseUrl: insertApi.baseUrl,
      apiKey: insertApi.apiKey,
      modelName: insertApi.modelName,
      isActive: insertApi.isActive ?? true,
      createdAt: new Date(),
    };
    this.apis.set(id, api);
    return api;
  }

  async updateApi(id: number, updateData: Partial<InsertApi>): Promise<Api | undefined> {
    const api = this.apis.get(id);
    if (!api) return undefined;
    
    const updatedApi = { ...api, ...updateData };
    this.apis.set(id, updatedApi);
    return updatedApi;
  }

  async deleteApi(id: number): Promise<boolean> {
    return this.apis.delete(id);
  }

  // Model alias methods
  async getModelAliases(): Promise<ModelAlias[]> {
    return Array.from(this.modelAliases.values());
  }

  async getModelAlias(alias: string): Promise<ModelAlias | undefined> {
    return Array.from(this.modelAliases.values()).find(
      (modelAlias) => modelAlias.alias === alias && modelAlias.isActive
    );
  }

  async createModelAlias(insertModelAlias: InsertModelAlias): Promise<ModelAlias> {
    const id = this.currentId++;
    const modelAlias: ModelAlias = {
      id,
      alias: insertModelAlias.alias,
      apiId: insertModelAlias.apiId,
      isActive: insertModelAlias.isActive ?? true,
      createdAt: new Date(),
    };
    this.modelAliases.set(id, modelAlias);
    return modelAlias;
  }

  async updateModelAlias(id: number, updateData: Partial<InsertModelAlias>): Promise<ModelAlias | undefined> {
    const modelAlias = this.modelAliases.get(id);
    if (!modelAlias) return undefined;
    
    const updatedModelAlias = { ...modelAlias, ...updateData };
    this.modelAliases.set(id, updatedModelAlias);
    return updatedModelAlias;
  }

  async deleteModelAlias(id: number): Promise<boolean> {
    return this.modelAliases.delete(id);
  }

  // API user methods
  async getApiUsers(): Promise<ApiUser[]> {
    return Array.from(this.apiUsers.values());
  }

  async getApiUser(id: number): Promise<ApiUser | undefined> {
    return this.apiUsers.get(id);
  }

  async getApiUserByKey(apiKey: string): Promise<ApiUser | undefined> {
    return Array.from(this.apiUsers.values()).find(
      (user) => user.apiKey === apiKey && user.isActive
    );
  }

  async createApiUser(insertApiUser: InsertApiUser): Promise<ApiUser> {
    const id = this.currentId++;
    const apiUser: ApiUser = {
      id,
      name: insertApiUser.name,
      apiKey: insertApiUser.apiKey,
      allowedModels: insertApiUser.allowedModels ?? [],
      isActive: insertApiUser.isActive ?? true,
      createdAt: new Date(),
    };
    this.apiUsers.set(id, apiUser);
    return apiUser;
  }

  async updateApiUser(id: number, updateData: Partial<InsertApiUser>): Promise<ApiUser | undefined> {
    const apiUser = this.apiUsers.get(id);
    if (!apiUser) return undefined;
    
    const updatedApiUser = { ...apiUser, ...updateData };
    this.apiUsers.set(id, updatedApiUser);
    return updatedApiUser;
  }

  async deleteApiUser(id: number): Promise<boolean> {
    return this.apiUsers.delete(id);
  }

  // Request log methods
  async getRequestLogs(limit: number = 100): Promise<RequestLog[]> {
    const logs = Array.from(this.requestLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return logs;
  }

  async createRequestLog(insertLog: InsertRequestLog): Promise<RequestLog> {
    const id = this.currentId++;
    const log: RequestLog = {
      id,
      userApiKey: insertLog.userApiKey,
      modelAlias: insertLog.modelAlias,
      upstreamApiId: insertLog.upstreamApiId ?? null,
      statusCode: insertLog.statusCode,
      responseTimeMs: insertLog.responseTimeMs,
      requestTokens: insertLog.requestTokens ?? null,
      responseTokens: insertLog.responseTokens ?? null,
      errorMessage: insertLog.errorMessage ?? null,
      createdAt: new Date(),
    };
    this.requestLogs.set(id, log);
    return log;
  }

  // Configuration methods
  async getConfiguration(key: string): Promise<Configuration | undefined> {
    return this.configuration.get(key);
  }

  async setConfiguration(insertConfig: InsertConfiguration): Promise<Configuration> {
    const existing = this.configuration.get(insertConfig.key);
    const config: Configuration = {
      id: existing?.id || this.currentId++,
      ...insertConfig,
      updatedAt: new Date(),
    };
    this.configuration.set(insertConfig.key, config);
    return config;
  }

  async getAllConfiguration(): Promise<Configuration[]> {
    return Array.from(this.configuration.values());
  }

  // Stats methods
  async getStats(): Promise<{
    activeApis: number;
    modelAliases: number;
    activeUsers: number;
    requestsToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const requestsToday = Array.from(this.requestLogs.values()).filter(
      log => log.createdAt >= today
    ).length;

    return {
      activeApis: Array.from(this.apis.values()).filter(api => api.isActive).length,
      modelAliases: Array.from(this.modelAliases.values()).filter(alias => alias.isActive).length,
      activeUsers: Array.from(this.apiUsers.values()).filter(user => user.isActive).length,
      requestsToday,
    };
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getApis(): Promise<Api[]> {
    return await db.select().from(apis);
  }

  async getApi(id: number): Promise<Api | undefined> {
    const [api] = await db.select().from(apis).where(eq(apis.id, id));
    return api || undefined;
  }

  async createApi(insertApi: InsertApi): Promise<Api> {
    const [api] = await db
      .insert(apis)
      .values({
        name: insertApi.name,
        baseUrl: insertApi.baseUrl,
        apiKey: insertApi.apiKey,
        modelName: insertApi.modelName,
        isActive: insertApi.isActive ?? true,
      })
      .returning();
    return api;
  }

  async updateApi(id: number, updateData: Partial<InsertApi>): Promise<Api | undefined> {
    const [api] = await db
      .update(apis)
      .set(updateData)
      .where(eq(apis.id, id))
      .returning();
    return api || undefined;
  }

  async deleteApi(id: number): Promise<boolean> {
    const result = await db.delete(apis).where(eq(apis.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getModelAliases(): Promise<ModelAlias[]> {
    return await db.select().from(modelAliases);
  }

  async getModelAlias(alias: string): Promise<ModelAlias | undefined> {
    const [modelAlias] = await db
      .select()
      .from(modelAliases)
      .where(eq(modelAliases.alias, alias));
    return modelAlias || undefined;
  }

  async createModelAlias(insertModelAlias: InsertModelAlias): Promise<ModelAlias> {
    const [modelAlias] = await db
      .insert(modelAliases)
      .values({
        alias: insertModelAlias.alias,
        apiId: insertModelAlias.apiId,
        isActive: insertModelAlias.isActive ?? true,
      })
      .returning();
    return modelAlias;
  }

  async updateModelAlias(id: number, updateData: Partial<InsertModelAlias>): Promise<ModelAlias | undefined> {
    const [modelAlias] = await db
      .update(modelAliases)
      .set(updateData)
      .where(eq(modelAliases.id, id))
      .returning();
    return modelAlias || undefined;
  }

  async deleteModelAlias(id: number): Promise<boolean> {
    const result = await db.delete(modelAliases).where(eq(modelAliases.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getApiUsers(): Promise<ApiUser[]> {
    return await db.select().from(apiUsers);
  }

  async getApiUser(id: number): Promise<ApiUser | undefined> {
    const [user] = await db.select().from(apiUsers).where(eq(apiUsers.id, id));
    return user || undefined;
  }

  async getApiUserByKey(apiKey: string): Promise<ApiUser | undefined> {
    const [user] = await db
      .select()
      .from(apiUsers)
      .where(eq(apiUsers.apiKey, apiKey));
    return user || undefined;
  }

  async createApiUser(insertApiUser: InsertApiUser): Promise<ApiUser> {
    const [user] = await db
      .insert(apiUsers)
      .values({
        name: insertApiUser.name,
        apiKey: insertApiUser.apiKey,
        allowedModels: insertApiUser.allowedModels ?? [],
        isActive: insertApiUser.isActive ?? true,
      })
      .returning();
    return user;
  }

  async updateApiUser(id: number, updateData: Partial<InsertApiUser>): Promise<ApiUser | undefined> {
    const [user] = await db
      .update(apiUsers)
      .set(updateData)
      .where(eq(apiUsers.id, id))
      .returning();
    return user || undefined;
  }

  async deleteApiUser(id: number): Promise<boolean> {
    const result = await db.delete(apiUsers).where(eq(apiUsers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getRequestLogs(limit: number = 100): Promise<RequestLog[]> {
    return await db
      .select()
      .from(requestLogs)
      .orderBy(desc(requestLogs.createdAt))
      .limit(limit);
  }

  async createRequestLog(insertLog: InsertRequestLog): Promise<RequestLog> {
    const [log] = await db
      .insert(requestLogs)
      .values({
        userApiKey: insertLog.userApiKey,
        modelAlias: insertLog.modelAlias,
        upstreamApiId: insertLog.upstreamApiId ?? null,
        statusCode: insertLog.statusCode,
        responseTimeMs: insertLog.responseTimeMs,
        requestTokens: insertLog.requestTokens ?? null,
        responseTokens: insertLog.responseTokens ?? null,
        errorMessage: insertLog.errorMessage ?? null,
      })
      .returning();
    return log;
  }

  async getConfiguration(key: string): Promise<Configuration | undefined> {
    const [config] = await db
      .select()
      .from(configuration)
      .where(eq(configuration.key, key));
    return config || undefined;
  }

  async setConfiguration(insertConfig: InsertConfiguration): Promise<Configuration> {
    const [config] = await db
      .insert(configuration)
      .values(insertConfig)
      .onConflictDoUpdate({
        target: configuration.key,
        set: {
          value: insertConfig.value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return config;
  }

  async getAllConfiguration(): Promise<Configuration[]> {
    return await db.select().from(configuration);
  }

  async getStats(): Promise<{
    activeApis: number;
    modelAliases: number;
    activeUsers: number;
    requestsToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get counts using separate queries to avoid complexity
    const activeApisCount = await db.select().from(apis).where(eq(apis.isActive, true));
    const modelAliasesCount = await db.select().from(modelAliases).where(eq(modelAliases.isActive, true));
    const activeUsersCount = await db.select().from(apiUsers).where(eq(apiUsers.isActive, true));
    const requestsTodayCount = await db.select().from(requestLogs).where(gte(requestLogs.createdAt, today));

    return {
      activeApis: activeApisCount.length,
      modelAliases: modelAliasesCount.length,
      activeUsers: activeUsersCount.length,
      requestsToday: requestsTodayCount.length,
    };
  }
}

export const storage = new DatabaseStorage();
