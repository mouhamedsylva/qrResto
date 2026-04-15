import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function initDb() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
  });

  const dbName = process.env.DATABASE_NAME || 'qr_order_db';

  console.log(`Creating database "${dbName}" if it doesn't exist...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  console.log(`Database "${dbName}" is ready.`);

  await connection.end();
}

initDb().catch((err) => {
  console.error('Error creating database:', err);
  process.exit(1);
});
