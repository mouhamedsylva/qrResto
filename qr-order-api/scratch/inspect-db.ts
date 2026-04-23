import { AppDataSource } from '../src/database/data-source';

async function inspect() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  
  const tables = ['categories', 'menu_items', 'order_items', 'orders', 'tables', 'subscriptions', 'restaurant_settings'];
  
  for (const table of tables) {
    console.log(`--- Table: ${table} ---`);
    try {
      const createTable = await queryRunner.query(`SHOW CREATE TABLE \`${table}\``);
      console.log(createTable[0]['Create Table']);
    } catch (e) {
      console.log(`Error showing table ${table}: ${e.message}`);
    }
  }
  
  await AppDataSource.destroy();
}

inspect().catch(err => console.error(err));
