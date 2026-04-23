import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Script de test pour vérifier les valeurs isActive et isDishOfDay
 * Usage: npm run test:menu-update
 */

async function testMenuItemUpdate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'qr_order_db',
  });

  try {
    console.log('✅ Connexion à la base de données établie\n');

    // Récupérer quelques articles pour tester
    const [rows] = await connection.execute(`
      SELECT 
        id,
        name,
        isActive,
        isDishOfDay
      FROM menu_items
      LIMIT 10
    `);

    const items = rows as any[];
    
    console.log('📊 État actuel des 10 premiers articles:\n');
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   isActive: ${item.isActive ? '✅ Actif' : '❌ Inactif'}`);
      console.log(`   isDishOfDay: ${item.isDishOfDay ? '🔥 Plat du jour' : '⚪ Normal'}`);
      console.log('');
    });

    // Compter les articles par statut
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN isDishOfDay = 1 THEN 1 ELSE 0 END) as dishOfDay
      FROM menu_items
    `);

    const summary = (stats as any[])[0];
    console.log('📈 Résumé global:');
    console.log(`   Total d'articles: ${summary.total}`);
    console.log(`   Articles actifs: ${summary.active}`);
    console.log(`   Articles inactifs: ${summary.inactive}`);
    console.log(`   Plats du jour: ${summary.dishOfDay}`);

    await connection.end();
    console.log('\n✅ Connexion fermée');
  } catch (error) {
    console.error('❌ Erreur:', error);
    await connection.end();
    process.exit(1);
  }
}

// Exécuter le script
testMenuItemUpdate();
