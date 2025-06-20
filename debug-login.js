#!/usr/bin/env node

import readline from 'readline';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testLogin() {
  console.log('=== OpenAI Proxy Hub Login Debugger ===\n');
  
  // Test with default credentials first
  console.log('Testing default credentials (admin/admin123)...');
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log('✅ Default credentials work!');
      console.log('Result:', result);
    } else {
      console.log('❌ Default credentials failed:', result);
    }
  } catch (error) {
    console.log('❌ Error testing default credentials:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Interactive login test
  rl.question('Enter username to test: ', (username) => {
    rl.question('Enter password to test: ', async (password) => {
      console.log(`\nTesting login with username: "${username}" and password: "${password}"`);
      
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        });
        
        const result = await response.json();
        console.log('\nResponse Status:', response.status);
        console.log('Response Body:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
          console.log('✅ Login successful!');
        } else {
          console.log('❌ Login failed!');
          
          if (result.error === 'Invalid credentials') {
            console.log('\nPossible issues:');
            console.log('1. Username does not exist');
            console.log('2. Password is incorrect');
            console.log('3. Account is not active');
            console.log('\nTo reset password, you can:');
            console.log('1. Use the admin panel if you have access');
            console.log('2. Reset the database (will lose all data)');
            console.log('3. Manually update the password in the database');
          }
        }
      } catch (error) {
        console.log('❌ Error during login test:', error.message);
      }
      
      rl.close();
    });
  });
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/me');
    console.log('✅ Server is running on port 5000');
    return true;
  } catch (error) {
    console.log('❌ Server is not running on port 5000');
    console.log('Please start the server with: npm start');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testLogin();
  }
}

main().catch(console.error);
