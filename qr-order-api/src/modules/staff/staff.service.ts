import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAllByRestaurant(restaurantId: string) {
    return this.userRepository.find({
      where: {
        restaurant: { id: restaurantId },
        role: UserRole.STAFF,
      },
    });
  }

  async invite(restaurantId: string, inviteData: any) {
    const user = this.userRepository.create({
      ...inviteData,
      role: inviteData.role || UserRole.STAFF,
      restaurant: { id: restaurantId },
    });
    return this.userRepository.save(user);
  }

  async updateRole(id: string, role: UserRole) {
    return this.userRepository.update(id, { role });
  }

  async remove(id: string) {
    return this.userRepository.delete(id);
  }
}
