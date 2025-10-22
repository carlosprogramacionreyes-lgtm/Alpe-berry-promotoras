import bcrypt from 'bcryptjs';
import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  try {
    // Hash the password with bcrypt
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Creating test user...');
    console.log('Username: testadmin');
    console.log('Password: test123');
    console.log('Bcrypt Hash:', hashedPassword);
    
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.username, 'testadmin'));
    
    if (existing.length > 0) {
      console.log('\nUser already exists! Updating password...');
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.username, 'testadmin'));
      console.log('Password updated successfully!');
    } else {
      // Insert new user
      await db.insert(users).values({
        username: 'testadmin',
        password: hashedPassword,
        name: 'Test Admin',
        email: 'testadmin@example.com',
        role: 'admin',
        active: true,
      });
      console.log('\nTest user created successfully!');
    }
    
    console.log('\n✅ You can now login with:');
    console.log('   Username: testadmin');
    console.log('   Password: test123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
