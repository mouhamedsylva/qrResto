import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async getStats() {
    const totalRestaurants = await this.restaurantRepository.count();
    const totalUsers = await this.userRepository.count();
    const totalOrders = await this.orderRepository.count();

    return {
      totalRestaurants,
      totalUsers,
      totalOrders,
    };
  }

  async getAllRestaurants() {
    return this.restaurantRepository.find({ relations: ['owner'] });
  }

  async toggleRestaurantActive(id: string, active: boolean) {
    return this.restaurantRepository.update(id, { isActive: active });
  }
}
