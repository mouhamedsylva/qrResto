import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Script de vérification des champs isActive et isDishOfDay
 * Vérifie que tous les articles ont des valeurs correctes
 * Usage: npm run verify:menu-fields
 */

async function verifyMenuFields() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'qr_order_db',
  });

  try {
    console.log('✅ Connexion à la base de données établie\n');

    // Vérifier la structure de la table
    console.log('🔍 Vérification de la structure de la table menu_items...\n');
    
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM menu_items
      WHERE Field IN ('isActive', 'isDishOfDay', 'isAvailable')
    `);

    console.log('📋 Colonnes trouvées:');
    (columns as any[]).forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} DEFAULT ${col.Default}`);
    });
    console.log('');

    // Vérifier s'il y a des valeurs NULL
    const [nullCheck] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN isActive IS NULL THEN 1 ELSE 0 END) as nullActive,
        SUM(CASE WHEN isDishOfDay IS NULL THEN 1 ELSE 0 END) as nullDishOfDay
      FROM menu_items
    `);

    const nullStats = (nullCheck as any[])[0];
    
    if (nullStats.nullActive > 0 || nullStats.nullDishOfDay > 0) {
      console.log('⚠️  Valeurs NULL détectées:');
      console.log(`   - isActive NULL: ${nullStats.nullActive}`);
      console.log(`   - isDishOfDay NULL: ${nullStats.nullDishOfDay}`);
      console.log('');
      
      console.log('🔧 Correction des valeurs NULL...');
      
      // Corriger les valeurs NULL
      await connection.execute(`
        UPDATE menu_items 
        SET isActive = 1 
        WHERE isActive IS NULL
      `);
      
      await connection.execute(`
        UPDATE menu_items 
        SET isDishOfDay = 0 
        WHERE isDishOfDay IS NULL
      `);
      
      console.log('✅ Valeurs NULL corrigées\n');
    } else {
      console.log('✅ Aucune valeur NULL détectée\n');
    }

    // Statistiques finales
    const [finalStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN isDishOfDay = 1 THEN 1 ELSE 0 END) as dishOfDay
      FROM menu_items
    `);

    const stats = (finalStats as any[])[0];
    
    console.log('📊 État final:');
    console.log(`   Total d'articles: ${stats.total}`);
    console.log(`   Articles actifs: ${stats.active} (${((stats.active / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   Articles inactifs: ${stats.inactive} (${((stats.inactive / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   Plats du jour: ${stats.dishOfDay} (${((stats.dishOfDay / stats.total) * 100).toFixed(1)}%)`);
    console.log('');

    // Vérifier s'il y a des articles avec des valeurs incorrectes
    const [invalidValues] = await connection.execute(`
      SELECT id, name, isActive, isDishOfDay
      FROM menu_items
      WHERE isActive NOT IN (0, 1) OR isDishOfDay NOT IN (0, 1)
      LIMIT 5
    `);

    if ((invalidValues as any[]).length > 0) {
      console.log('⚠️  Articles avec des valeurs incorrectes:');
      (invalidValues as any[]).forEach(item => {
        console.log(`   - ${item.name}: isActive=${item.isActive}, isDishOfDay=${item.isDishOfDay}`);
      });
      console.log('');
    } else {
      console.log('✅ Toutes les valeurs sont correctes (0 ou 1)\n');
    }

    // Exemples d'articles
    const [examples] = await connection.execute(`
      SELECT name, isActive, isDishOfDay
      FROM menu_items
      ORDER BY RAND()
      LIMIT 5
    `);

    console.log('📝 Exemples d\'articles:');
    (examples as any[]).forEach((item, index) => {
      const activeIcon = item.isActive ? '✅' : '❌';
      const dishIcon = item.isDishOfDay ? '🔥' : '⚪';
      console.log(`   ${index + 1}. ${item.name}`);
      console.log(`      ${activeIcon} ${item.isActive ? 'Actif' : 'Inactif'} | ${dishIcon} ${item.isDishOfDay ? 'Plat du jour' : 'Normal'}`);
    });

    await connection.end();
    console.log('\n✅ Vérification terminée');
  } catch (error) {
    console.error('❌ Erreur:', error);
    await connection.end();
    process.exit(1);
  }
}

// Exécuter le script
verifyMenuFields();
