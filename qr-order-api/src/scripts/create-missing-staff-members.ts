import { DataSource } from 'typeorm';
import { User, UserRole } from '../modules/users/entities/user.entity';
import { StaffMember, StaffStatus } from '../modules/staff/entities/staff-member.entity';
import { Restaurant } from '../modules/restaurants/entities/restaurant.entity';

async function createMissingStaffMembers() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'qr_order_db',
    entities: [User, StaffMember, Restaurant],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    const userRepository = dataSource.getRepository(User);
    const staffMemberRepository = dataSource.getRepository(StaffMember);

    // Récupérer tous les membres d'équipe (MANAGER et STAFF)
    const teamMembers = await userRepository.find({
      where: [
        { role: UserRole.MANAGER },
        { role: UserRole.STAFF },
      ],
      relations: ['restaurant'],
    });

    console.log(`📊 ${teamMembers.length} membre(s) d'équipe trouvé(s)`);

    let createdCount = 0;
    let existingCount = 0;

    for (const user of teamMembers) {
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
    }

    console.log('\n📊 Résumé :');
    console.log(`   - Entrées créées : ${createdCount}`);
    console.log(`   - Entrées existantes : ${existingCount}`);
    console.log(`   - Total : ${teamMembers.length}`);

    await dataSource.destroy();
    console.log('\n✅ Script terminé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script :', error);
    process.exit(1);
  }
}

createMissingStaffMembers();
