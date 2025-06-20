import { db } from "./db";
import { apis, modelAliases, apiUsers, configuration } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database with initial data...");

  try {
    // Check if data already exists
    const existingApis = await db.select().from(apis);
    if (existingApis.length > 0) {
      console.log("Database already contains data, skipping seed.");
      return;
    }

    // Insert sample APIs
    const [api1, api2] = await db.insert(apis).values([
      {
        name: "Roxane API",
        baseUrl: "https://myapi.roxane.one/v1/",
        apiKey: "sk-apikey1",
        modelName: "Qwen/Qwen2.5-Coder-7B-Instruct-AWQ",
        isActive: true,
      },
      {
        name: "Drake API", 
        baseUrl: "https://drake-cpapxtg0my-coding.roxane.one/v1/",
        apiKey: "sk-api2",
        modelName: "Qwen/Qwen3-8B-AWQ",
        isActive: true,
      }
    ]).returning();

    console.log("Created sample APIs:", api1.name, api2.name);

    // Insert sample model aliases
    await db.insert(modelAliases).values([
      {
        alias: "coder-model",
        apiId: api1.id,
        isActive: true,
      },
      {
        alias: "embedding-model", 
        apiId: api1.id,
        isActive: true,
      },
    ]);

    console.log("Created sample model aliases");

    // Insert sample users
    await db.insert(apiUsers).values([
      {
        name: "User 1",
        apiKey: "user1-api-key",
        allowedModels: ["coder-model", "embedding-model"],
        isActive: true,
      },
      {
        name: "User 2",
        apiKey: "user2-api-key", 
        allowedModels: ["coder-model"],
        isActive: true,
      }
    ]);

    console.log("Created sample users");

    // Insert sample configuration
    await db.insert(configuration).values([
      {
        key: "proxyUrl",
        value: "http://mydomain.com/v1",
      },
      {
        key: "requestTimeout",
        value: 30,
      }
    ]);

    console.log("Created sample configuration");
    console.log("Database seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

export { seedDatabase };