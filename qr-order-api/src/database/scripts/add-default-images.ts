import { DataSource } from 'typeorm';
import { MenuItem } from '../../modules/menus/entities/menu-item.entity';
import { MenuCategory } from '../../modules/menus/entities/menu-category.entity';

/**
 * Script pour ajouter des images par défaut aux articles qui n'en ont pas
 * Usage: npx ts-node src/database/scripts/add-default-images.ts
 */

// Images par défaut selon la catégorie
const DEFAULT_IMAGES = {
  'entrées': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  'entrees': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  'plats': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  'plat': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  'desserts': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
  'dessert': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
  'boissons': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
  'boisson': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
  'default': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
};

async function addDefaultImages() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'qr_order_db',
    entities: [MenuItem, MenuCategory],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    const menuItemRepository = dataSource.getRepository(MenuItem);

    // Récupérer tous les articles sans image
    const itemsWithoutImage = await menuItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .where('item.imageUrl IS NULL OR item.imageUrl = :empty', { empty: '' })
      .getMany();

    console.log(`\n📊 ${itemsWithoutImage.length} articles sans image trouvés\n`);

    if (itemsWithoutImage.length === 0) {
      console.log('✅ Tous les articles ont déjà une image!');
      await dataSource.destroy();
      return;
    }

    let updated = 0;

    for (const item of itemsWithoutImage) {
      const categoryName = item.category?.name?.toLowerCase() || 'default';
      const defaultImage = DEFAULT_IMAGES[categoryName] || DEFAULT_IMAGES['default'];

      item.imageUrl = defaultImage;
      await menuItemRepository.save(item);

      console.log(`✅ ${item.name} (${item.category?.name || 'Sans catégorie'}) → ${defaultImage}`);
      updated++;
    }

    console.log(`\n🎉 ${updated} articles mis à jour avec succès!`);

    await dataSource.destroy();
    console.log('✅ Connexion fermée');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
addDefaultImages();
