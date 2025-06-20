#!/usr/bin/env tsx

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from '../server/db.js';
import { admins } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function quickReset() {
  console.log('=== Quick Password Reset ===\n');
  
  try {
    // Get all admins
    const allAdmins = await db.select().from(admins);
    
    if (allAdmins.length === 0) {
      console.log('No admin accounts found. Creating default admin...');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      await db.insert(admins).values({
        username: 'admin',
        password: hashedPassword,
        isActive: true
      });
      
      console.log('✅ Default admin created:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      // Reset the first admin's password to default
      const firstAdmin = allAdmins[0];
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      await db
        .update(admins)
        .set({ 
          password: hashedPassword,
          isActive: true
        })
        .where(eq(admins.id, firstAdmin.id));
      
      console.log(`✅ Password reset for ${firstAdmin.username}:`);
      console.log('   Username:', firstAdmin.username);
      console.log('   Password: admin123');
    }
    
    console.log('\n⚠️  Please change this password after logging in!');
    console.log('You can now login to the admin panel.');
    
  } catch (error) {
    console.error('❌ Error during quick reset:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the database is accessible');
    console.log('2. Check your DATABASE_URL in .env file');
    console.log('3. Stop the server if it\'s running (Ctrl+C)');
  }
}

quickReset().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
