import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { StaffMember, StaffStatus } from '../staff/entities/staff-member.entity';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(StaffMember)
    private staffMemberRepository: Repository<StaffMember>,
    private emailService: EmailService,
  ) {}

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      relations: ['restaurant'],
    });
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateData: any) {
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  async createTeamMember(ownerId: string, dto: AddTeamMemberDto) {
    const owner = await this.findById(ownerId);
    if (!owner.restaurant) {
      throw new BadRequestException(
        "Vous devez avoir un restaurant pour ajouter des membres d'équipe.",
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email déjà utilisé.');
    }

    // Générer un mot de passe de 8 caractères (alphanumérique)
    const generatedPassword = Math.random()
      .toString(36)
      .slice(-8)
      .toUpperCase();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      restaurant: owner.restaurant,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Créer l'entrée correspondante dans staff_members
    const staffMember = this.staffMemberRepository.create({
      user: savedUser,
      restaurant: owner.restaurant,
      status: StaffStatus.ACTIVE,
      phoneNumber: null,
      position: dto.role === UserRole.MANAGER ? 'Manager' : 'Staff',
    });

    await this.staffMemberRepository.save(staffMember);

    return {
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
      generatedPassword, // Le mot de passe en clair pour le restaurateur
    };
  }

  async createTeamMemberByRestaurant(restaurantId: string, dto: AddTeamMemberDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email deja utilise.');
    }

    // Récupérer le restaurant pour obtenir son nom
    const restaurant = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.restaurant', 'restaurant')
      .where('restaurant.id = :restaurantId', { restaurantId })
      .getOne();

    const restaurantName = restaurant?.restaurant?.name || 'Votre Restaurant';

    const generatedPassword = Math.random()
      .toString(36)
      .slice(-8)
      .toUpperCase();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      restaurant: { id: restaurantId } as any,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Créer l'entrée correspondante dans staff_members
    const staffMember = this.staffMemberRepository.create({
      user: savedUser,
      restaurant: { id: restaurantId } as any,
      status: StaffStatus.ACTIVE,
      phoneNumber: null,
      position: dto.role === UserRole.MANAGER ? 'Manager' : 'Staff',
    });

    await this.staffMemberRepository.save(staffMember);

    // Envoyer l'email d'invitation avec le mot de passe
    await this.emailService.sendTeamMemberInvitation(
      savedUser.email,
      savedUser.name,
      generatedPassword,
      restaurantName,
    );

    return {
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
      generatedPassword,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Le mot de passe actuel est incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: 'Mot de passe mis à jour avec succès' };
  }

  async listTeamMembers(ownerId: string) {
    const owner = await this.findById(ownerId);
    if (!owner.restaurant?.id) {
      throw new BadRequestException(
        "Vous devez avoir un restaurant pour lister l'equipe.",
      );
    }

    const members = await this.userRepository.find({
      where: {
        restaurant: { id: owner.restaurant.id },
        role: In([UserRole.MANAGER, UserRole.STAFF]),
      },
      relations: ['restaurant'],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        restaurant: {
          id: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    return members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      createdAt: member.createdAt,
      restaurantId: member.restaurant?.id || null,
      restaurantName: member.restaurant?.name || null,
    }));
  }

  async listTeamMembersByRestaurant(restaurantId: string, includeArchived = false) {
    const members = await this.userRepository.find({
      where: {
        restaurant: { id: restaurantId },
        role: In([UserRole.MANAGER, UserRole.STAFF]),
        ...(includeArchived ? {} : { isArchived: false }),
      },
      relations: ['restaurant'],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        restaurant: {
          id: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    // Récupérer les statuts depuis staff_members
    const membersWithStatus = await Promise.all(
      members.map(async (member) => {
        const staffMember = await this.staffMemberRepository.findOne({
          where: {
            user: { id: member.id },
            restaurant: { id: restaurantId },
          },
        });

        return {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          createdAt: member.createdAt,
          restaurantId: member.restaurant?.id || null,
          restaurantName: member.restaurant?.name || null,
          status: staffMember?.status || 'ACTIVE',
        };
      }),
    );

    return membersWithStatus;
  }

  async listArchivedTeamMembersByRestaurant(restaurantId: string) {
    const members = await this.userRepository.find({
      where: {
        restaurant: { id: restaurantId },
        role: In([UserRole.MANAGER, UserRole.STAFF]),
        isArchived: true,
      },
      relations: ['restaurant'],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        restaurant: {
          id: true,
          name: true,
        },
      },
      order: { updatedAt: 'DESC' },
    });

    return members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      createdAt: member.createdAt,
      archivedAt: member.updatedAt,
      restaurantId: member.restaurant?.id || null,
      restaurantName: member.restaurant?.name || null,
    }));
  }

  async importTeamMembersByRestaurant(
    restaurantId: string,
    members: AddTeamMemberDto[],
  ) {
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const member of members) {
      try {
        await this.createTeamMemberByRestaurant(restaurantId, member);
        successCount += 1;
      } catch (error: any) {
        failCount += 1;
        errors.push(
          `${member.email}: ${error?.message || "Erreur d'import"}`,
        );
      }
    }

    return { successCount, failCount, errors };
  }

  async archiveTeamMembersByRestaurant(restaurantId: string, ids: string[]) {
    if (!ids.length) {
      return { archivedCount: 0 };
    }

    const result = await this.userRepository.update(
      {
        id: In(ids),
        restaurant: { id: restaurantId } as any,
        role: In([UserRole.MANAGER, UserRole.STAFF]),
      },
      { isArchived: true },
    );

    return { archivedCount: result.affected || 0 };
  }

  async unarchiveTeamMemberByRestaurant(
    restaurantId: string,
    memberId: string,
  ) {
    const member = await this.userRepository.findOne({
      where: {
        id: memberId,
        restaurant: { id: restaurantId },
        role: In([UserRole.MANAGER, UserRole.STAFF]),
        isArchived: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Membre archivé introuvable dans ce restaurant.');
    }

    member.isArchived = false;
    await this.userRepository.save(member);

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      isArchived: false,
    };
  }

  async unarchiveTeamMembersByRestaurant(restaurantId: string, ids: string[]) {
    if (!ids.length) {
      return { unarchivedCount: 0 };
    }

    const result = await this.userRepository.update(
      {
        id: In(ids),
        restaurant: { id: restaurantId } as any,
        role: In([UserRole.MANAGER, UserRole.STAFF]),
        isArchived: true,
      },
      { isArchived: false },
    );

    return { unarchivedCount: result.affected || 0 };
  }

  async updateStaffMemberStatus(
    restaurantId: string,
    memberId: string,
    status: any,
  ) {
    // Vérifier que le membre existe et appartient au restaurant
    const user = await this.userRepository.findOne({
      where: {
        id: memberId,
        restaurant: { id: restaurantId },
        role: In([UserRole.MANAGER, UserRole.STAFF]),
      },
      relations: ['restaurant'],
    });

    if (!user) {
      throw new NotFoundException('Membre introuvable dans ce restaurant.');
    }

    // Trouver l'entrée staff_members correspondante
    let staffMember = await this.staffMemberRepository.findOne({
      where: {
        user: { id: memberId },
        restaurant: { id: restaurantId },
      },
    });

    // Si l'entrée n'existe pas, la créer (pour les membres créés avant cette fonctionnalité)
    if (!staffMember) {
      staffMember = this.staffMemberRepository.create({
        user: user,
        restaurant: user.restaurant,
        status: StaffStatus.ACTIVE,
        phoneNumber: null,
        position: user.role === UserRole.MANAGER ? 'Manager' : 'Staff',
      });
      await this.staffMemberRepository.save(staffMember);
    }

    // Mettre à jour le statut
    staffMember.status = status;
    await this.staffMemberRepository.save(staffMember);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: staffMember.status,
    };
  }

  async updateTeamMemberRoleByRestaurant(
    restaurantId: string,
    memberId: string,
    role: UserRole,
  ) {
    const member = await this.userRepository.findOne({
      where: {
        id: memberId,
        restaurant: { id: restaurantId },
        role: In([UserRole.MANAGER, UserRole.STAFF]),
      },
      relations: ['restaurant'],
    });

    if (!member) {
      throw new NotFoundException('Membre introuvable dans ce restaurant.');
    }

    member.role = role;
    await this.userRepository.save(member);

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
    };
  }

  async getTeamMemberDetailsByRestaurant(
    restaurantId: string,
    memberId: string,
  ) {
    const member = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.restaurant', 'restaurant')
      .where('user.id = :memberId', { memberId })
      .andWhere('restaurant.id = :restaurantId', { restaurantId })
      .andWhere('user.role IN (:...roles)', {
        roles: [UserRole.MANAGER, UserRole.STAFF],
      })
      .getOne();

    if (!member) {
      throw new NotFoundException('Membre introuvable dans ce restaurant.');
    }

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      hasPassword: true,
      restaurant: member.restaurant
        ? { id: member.restaurant.id, name: member.restaurant.name }
        : null,
    };
  }

  async resetTeamMemberPasswordByRestaurant(
    restaurantId: string,
    memberId: string,
  ) {
    const member = await this.userRepository.findOne({
      where: {
        id: memberId,
        restaurant: { id: restaurantId },
        role: In([UserRole.MANAGER, UserRole.STAFF]),
      },
      relations: ['restaurant'],
    });

    if (!member) {
      throw new NotFoundException('Membre introuvable dans ce restaurant.');
    }

    const restaurantName = member.restaurant?.name || 'Votre Restaurant';

    const temporaryPassword = Math.random()
      .toString(36)
      .slice(-8)
      .toUpperCase();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    member.password = hashedPassword;
    await this.userRepository.save(member);

    // Envoyer l'email de réinitialisation
    await this.emailService.sendPasswordReset(
      member.email,
      member.name,
      temporaryPassword,
      restaurantName,
    );

    return {
      memberId: member.id,
      temporaryPassword,
    };
  }
}

