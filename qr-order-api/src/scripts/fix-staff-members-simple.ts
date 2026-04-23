import 'dotenv/config';
import { AppDataSource } from '../database/data-source';
import { User, UserRole } from '../modules/users/entities/user.entity';
import { StaffMember, StaffStatus } from '../modules/staff/entities/staff-member.entity';

async function createMissingStaffMembers() {
  try {
    console.log('🔄 Initialisation de la connexion à la base de données...');
    await AppDataSource.initialize();
    console.log('✅ Connexion établie\n');

    const userRepository = AppDataSource.getRepository(User);
    const staffMemberRepository = AppDataSource.getRepository(StaffMember);

    // Récupérer tous les membres d'équipe (MANAGER et STAFF)
    console.log('🔍 Recherche des membres d\'équipe...');
    const teamMembers = await userRepository.find({
      where: [
        { role: UserRole.MANAGER },
        { role: UserRole.STAFF },
      ],
      relations: ['restaurant'],
    });

    console.log(`📊 ${teamMembers.length} membre(s) d'équipe trouvé(s)\n`);

    if (teamMembers.length === 0) {
      console.log('ℹ️  Aucun membre d\'équipe à traiter');
      await AppDataSource.destroy();
      return;
    }

    let createdCount = 0;
    let existingCount = 0;
    let errorCount = 0;

    for (const user of teamMembers) {
      try {
        // Vérifier si une entrée staff_members existe déjà
        const existingStaffMember = await staffMemberRepository.findOne({
          where: {
            user: { id: user.id },
          },
        });

        if (existingStaffMember) {
          existingCount++;
          console.log(`⏭️  Entrée existante pour ${user.name} (${user.email})`);
          continue;
        }

        // Vérifier que le membre a un restaurant
        if (!user.restaurant) {
          console.log(`⚠️  ${user.name} (${user.email}) n'a pas de restaurant associé - ignoré`);
          errorCount++;
          continue;
        }

        // Créer l'entrée staff_members manquante
        const staffMember = staffMemberRepository.create({
          user: user,
          restaurant: user.restaurant,
          status: StaffStatus.ACTIVE,
          phoneNumber: null,
          position: user.role === UserRole.MANAGER ? 'Manager' : 'Staff',
        });

        await staffMemberRepository.save(staffMember);
        createdCount++;
        console.log(`✅ Entrée créée pour ${user.name} (${user.email})`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Erreur pour ${user.name} (${user.email}):`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`✅ Entrées créées      : ${createdCount}`);
    console.log(`⏭️  Entrées existantes  : ${existingCount}`);
    console.log(`❌ Erreurs             : ${errorCount}`);
    console.log(`📊 Total traité        : ${teamMembers.length}`);
    console.log('='.repeat(60));

    await AppDataSource.destroy();
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Erreur lors de l\'exécution du script :');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Exécuter le script
console.log('🚀 Démarrage du script de correction des entrées staff_members\n');
createMissingStaffMembers();
