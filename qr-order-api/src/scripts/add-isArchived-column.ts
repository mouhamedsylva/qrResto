import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'qr_order_db',
});

async function addIsArchivedColumn() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    // Vérifier si la colonne existe déjà
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DATABASE_NAME}' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'isArchived'
    `;

    const result = await AppDataSource.query(checkQuery);
    const columnExists = result[0].count > 0;

    if (columnExists) {
      console.log('ℹ️  La colonne isArchived existe déjà dans la table users');
    } else {
      // Ajouter la colonne isArchived
      const addColumnQuery = `
        ALTER TABLE users 
        ADD COLUMN isArchived TINYINT(1) NOT NULL DEFAULT 0
      `;

      await AppDataSource.query(addColumnQuery);
      console.log('✅ Colonne isArchived ajoutée avec succès à la table users');
    }

    // Afficher la structure de la table users
    const describeQuery = 'DESCRIBE users';
    const structure = await AppDataSource.query(describeQuery);
    
    console.log('\n📋 Structure de la table users :');
    console.table(structure);

    await AppDataSource.destroy();
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne :', error);
    process.exit(1);
  }
}

addIsArchivedColumn();
