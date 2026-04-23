import * as fs from 'fs';
import * as path from 'path';

/**
 * Script pour vérifier les images uploadées
 * Usage: npm run check:images
 */

function checkUploadedImages() {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'menu-items');
  
  console.log('🔍 Vérification des images uploadées\n');
  console.log(`📁 Dossier: ${uploadsDir}\n`);

  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Le dossier uploads/menu-items n\'existe pas');
    console.log('💡 Aucune image n\'a encore été uploadée\n');
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  
  if (files.length === 0) {
    console.log('⚠️  Le dossier est vide');
    console.log('💡 Aucune image n\'a encore été uploadée\n');
    return;
  }

  console.log(`📊 ${files.length} fichier(s) trouvé(s)\n`);

  files.forEach((file, index) => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`${index + 1}. ${file}`);
    console.log(`   Taille: ${sizeKB} KB`);
    console.log(`   Date: ${stats.mtime.toLocaleString()}`);
    
    // Vérifier si le fichier est vide ou trop petit
    if (stats.size === 0) {
      console.log(`   ❌ ERREUR: Fichier vide!`);
    } else if (stats.size < 100) {
      console.log(`   ⚠️  ATTENTION: Fichier très petit (possiblement corrompu)`);
    } else {
      console.log(`   ✅ Taille correcte`);
    }
    
    // Vérifier l'extension
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      console.log(`   ✅ Extension valide: ${ext}`);
    } else {
      console.log(`   ⚠️  Extension inhabituelle: ${ext}`);
    }
    
    console.log('');
  });

  console.log('📝 Résumé:');
  console.log(`   Total: ${files.length} fichier(s)`);
  
  const emptyFiles = files.filter(file => {
    const filePath = path.join(uploadsDir, file);
    return fs.statSync(filePath).size === 0;
  });
  
  if (emptyFiles.length > 0) {
    console.log(`   ❌ Fichiers vides: ${emptyFiles.length}`);
    console.log(`   💡 Ces fichiers doivent être supprimés et re-uploadés`);
  } else {
    console.log(`   ✅ Aucun fichier vide`);
  }
  
  console.log('\n💡 URL d\'accès:');
  console.log(`   http://localhost:3000/uploads/menu-items/{nom-du-fichier}`);
}

// Exécuter le script
checkUploadedImages();
