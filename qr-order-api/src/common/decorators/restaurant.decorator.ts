import { SetMetadata } from '@nestjs/common';

export const RESTAURANT_KEY = 'restaurant';
export const RestaurantOnly = () => SetMetadata(RESTAURANT_KEY, true);
