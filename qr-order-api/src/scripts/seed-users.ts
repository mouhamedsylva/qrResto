import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

async function seedUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'qr_order_db',
  });

  const password = await bcrypt.hash('Password123!', 10);

  const users = [
    {
      id: uuidv4(),
      email: 'thicosylva@gmail.com',
      name: 'Antoine Sylva',
      password,
      role: 'SUPER_ADMIN',
    },
    {
      id: uuidv4(),
      email: 'owner@example.com',
      name: 'Demo Owner',
      password,
      role: 'OWNER',
    },
    {
      id: uuidv4(),
      email: 'manager@example.com',
      name: 'Demo Manager',
      password,
      role: 'MANAGER',
    },
    {
      id: uuidv4(),
      email: 'staff@example.com',
      name: 'Demo Staff',
      password,
      role: 'STAFF',
    },
    {
      id: uuidv4(),
      email: 'customer@example.com',
      name: 'Demo Customer',
      password,
      role: 'CUSTOMER',
    },
  ];

  console.log('Seeding default users...');

  for (const user of users) {
    try {
      await connection.execute(
        'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.email, user.password, user.name, user.role],
      );
      console.log(`User created: ${user.email} (${user.role})`);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`User already exists: ${user.email}`);
      } else {
        console.error(`Error creating user ${user.email}:`, err.message);
      }
    }
  }

  await connection.end();
  console.log('Seeding completed.');
}

seedUsers().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
