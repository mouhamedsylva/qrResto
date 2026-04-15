import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantSettings } from './entities/restaurant-settings.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Table } from '../tables/entities/table.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, RestaurantSettings, Order, User]),
    TypeOrmModule.forFeature([Table]),
    AuthModule,
  ],

  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
