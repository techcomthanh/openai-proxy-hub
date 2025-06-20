#!/usr/bin/env tsx

import 'dotenv/config';
import readline from 'readline';
import bcrypt from 'bcrypt';
import { db } from '../server/db.js';
import { admins } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function resetPassword() {
  console.log('=== OpenAI Proxy Hub Password Reset ===\n');
  
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
      console.log('\nPlease change this password after logging in!');
      return;
    }
    
    console.log('Available admin accounts:');
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.username} (${admin.isActive ? 'Active' : 'Inactive'})`);
    });
    
    const selection = await question('\nSelect admin account number to reset password: ');
    const selectedIndex = parseInt(selection.trim()) - 1;
    
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= allAdmins.length) {
      console.log('❌ Invalid selection. Please enter a valid number.');
      return;
    }
    
    const selectedAdmin = allAdmins[selectedIndex];
    
    if (!selectedAdmin) {
      console.log('❌ Selected admin not found');
      return;
    }
    
    console.log(`\nResetting password for: ${selectedAdmin.username}`);
    
    const newPassword = await question('Enter new password: ');
    
    if (newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      return;
    }
    
    const confirmPassword = await question('Confirm new password: ');
    
    if (newPassword !== confirmPassword) {
      console.log('❌ Passwords do not match');
      return;
    }
    
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the password in database
    await db
      .update(admins)
      .set({ 
        password: hashedPassword,
        isActive: true // Ensure account is active
      })
      .where(eq(admins.id, selectedAdmin.id));
    
    console.log(`✅ Password successfully reset for ${selectedAdmin.username}`);
    console.log('You can now login with the new password.');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the database is accessible');
    console.log('2. Check your DATABASE_URL in .env file');
    console.log('3. Ensure the server dependencies are installed');
    console.log('4. Make sure the server is not running (stop with Ctrl+C)');
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nOperation cancelled.');
  rl.close();
  process.exit(0);
});

resetPassword().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
