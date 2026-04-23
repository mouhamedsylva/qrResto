import { DataSource } from 'typeorm';
import { MenuItem } from '../../modules/menus/entities/menu-item.entity';
import { MenuCategory } from '../../modules/menus/entities/menu-category.entity';

/**
 * Script pour corriger les URLs Unsplash obsolètes
 * Usage: npm run fix:unsplash-images
 */

// Mapping des URLs Unsplash valides par catégorie et type de plat
const VALID_UNSPLASH_URLS: { [key: string]: string } = {
  // Entrées
  'salade': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
  'soupe': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
  'velouté': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
  'carpaccio': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
  'tartare': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80',
  'escargot': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80',
  
  // Plats - Viandes
  'steak': 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
  'entrecôte': 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
  'bœuf': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=80',
  'poulet': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&q=80',
  'cordon': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&q=80',
  
  // Plats - Poissons
  'saumon': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80',
  'cabillaud': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80',
  'sole': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80',
  'moules': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80',
  
  // Plats - Pâtes
  'spaghetti': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80',
  'lasagne': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80',
  'tagliatelle': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80',
  'risotto': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80',
  
  // Plats - Pizzas
  'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
  
  // Desserts
  'mousse': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
  'tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
  'tarte': 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80',
  'crème': 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&q=80',
  'crêpe': 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=80',
  'gaufre': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&q=80',
  'glace': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
  'sorbet': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
  'salade de fruits': 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400&q=80',
};

// Images par défaut selon la catégorie
const DEFAULT_IMAGES_BY_CATEGORY: { [key: string]: string } = {
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

function findBestImageUrl(itemName: string, categoryName: string): string {
  const nameLower = itemName.toLowerCase();
  
  // Chercher une correspondance dans le mapping
  for (const [keyword, url] of Object.entries(VALID_UNSPLASH_URLS)) {
    if (nameLower.includes(keyword)) {
      return url;
    }
  }
  
  // Sinon, utiliser l'image par défaut de la catégorie
  const categoryLower = categoryName.toLowerCase();
  return DEFAULT_IMAGES_BY_CATEGORY[categoryLower] || DEFAULT_IMAGES_BY_CATEGORY['default'];
}

async function fixUnsplashImages() {
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
    console.log('✅ Connexion à la base de données établie\n');

    const menuItemRepository = dataSource.getRepository(MenuItem);

    // Récupérer tous les articles avec des URLs Unsplash obsolètes
    const itemsWithOldUrls = await menuItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .where('item.imageUrl LIKE :pattern', { pattern: '%source.unsplash.com%' })
      .orWhere('item.imageUrl IS NULL')
      .orWhere('item.imageUrl = :empty', { empty: '' })
      .getMany();

    console.log(`📊 ${itemsWithOldUrls.length} articles à corriger\n`);

    if (itemsWithOldUrls.length === 0) {
      console.log('✅ Toutes les images sont déjà à jour!');
      await dataSource.destroy();
      return;
    }

    let updated = 0;

    for (const item of itemsWithOldUrls) {
      const categoryName = item.category?.name || 'default';
      const newImageUrl = findBestImageUrl(item.name, categoryName);

      const oldUrl = item.imageUrl || '(vide)';
      item.imageUrl = newImageUrl;
      await menuItemRepository.save(item);

      console.log(`✅ ${item.name}`);
      console.log(`   Catégorie: ${categoryName}`);
      console.log(`   Avant: ${oldUrl.substring(0, 60)}...`);
      console.log(`   Après: ${newImageUrl}`);
      console.log('');
      
      updated++;
    }

    console.log(`\n🎉 ${updated} articles mis à jour avec succès!`);
    console.log('\n📝 Résumé:');
    console.log(`   - Articles corrigés: ${updated}`);
    console.log(`   - Toutes les images utilisent maintenant des URLs Unsplash valides`);

    await dataSource.destroy();
    console.log('\n✅ Connexion fermée');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
fixUnsplashImages();
