import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Le mot de passe actuel est incorrect');
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException(
        'La confirmation du mot de passe ne correspond pas',
      );
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

  async listTeamMembersByRestaurant(restaurantId: string) {
    const members = await this.userRepository.find({
      where: {
        restaurant: { id: restaurantId },
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

    const result = await this.userRepository.delete({
      id: In(ids),
      restaurant: { id: restaurantId } as any,
      role: In([UserRole.MANAGER, UserRole.STAFF]),
    });

    return { archivedCount: result.affected || 0 };
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

    const temporaryPassword = Math.random()
      .toString(36)
      .slice(-8)
      .toUpperCase();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    member.password = hashedPassword;
    await this.userRepository.save(member);

    return {
      memberId: member.id,
      temporaryPassword,
    };
  }
}

