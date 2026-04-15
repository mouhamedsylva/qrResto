import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
  });

  const dbName = process.env.DATABASE_NAME || 'qr_order_db';

  try {
    console.log(`Checking if database "${dbName}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database "${dbName}" checked/created successfully.`);
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createDatabase();
