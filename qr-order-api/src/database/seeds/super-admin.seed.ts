import { DataSource } from 'typeorm';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export const seedSuperAdmin = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  const superAdminEmail = 'admin@clearcode.com';
  const existingAdmin = await userRepository.findOne({
    where: { email: superAdminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123!', 10);
    const superAdmin = userRepository.create({
      email: superAdminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
    });

    await userRepository.save(superAdmin);
    console.log('Super Admin user created successfully!');
  }
};
