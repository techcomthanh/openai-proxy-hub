import { db } from "./db";
import { apis, modelAliases, apiUsers, configuration, admins } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  console.log("Seeding database with initial data...");

  try {
    // Check if data already exists
    const existingApis = await db.select().from(apis);
    if (existingApis.length > 0) {
      console.log("Database already contains data, skipping seed.");
      
      // Check if admin needs password update or creation
      const existingAdmins = await db.select().from(admins);
      if (existingAdmins.length === 0) {
        console.log("Creating default admin account...");
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);
        await db.insert(admins).values({
          username: 'admin',
          password: hashedPassword,
          isActive: true
        });
        console.log("Default admin account created successfully.");
      } else {
        // Check if any admin has plain text password and update it
        for (const admin of existingAdmins) {
          if (admin.password === 'admin123') {
            console.log(`Updating password for admin: ${admin.username}`);
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash('admin123', saltRounds);
            await db.update(admins)
              .set({ password: hashedPassword })
              .where(eq(admins.id, admin.id));
            console.log(`Password updated for admin: ${admin.username}`);
          }
        }
      }
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

    // Create default admin with encrypted password
    console.log("Creating default admin account...");
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    await db.insert(admins).values({
      username: 'admin',
      password: hashedPassword,
      isActive: true
    });

    console.log("Default admin account created successfully.");
    console.log("Database seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

export { seedDatabase };