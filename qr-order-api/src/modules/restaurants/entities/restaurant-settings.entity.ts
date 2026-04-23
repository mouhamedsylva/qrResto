import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('restaurant_settings')
export class RestaurantSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '#FF0000' })
  primaryColor: string;

  @Column({ default: '#FFFFFF' })
  secondaryColor: string;

  @Column({ default: 'rounded' })
  buttonStyle: string; // 'rounded' | 'square' | 'pill'

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ default: 'fr' })
  language: string;

  @Column({ default: true })
  isOrderingEnabled: boolean;

  @Column({ default: false })
  isTaxIncluded: boolean;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ default: 20 })
  prepTime: number; // Temps de préparation moyen en minutes

  // Payment methods
  @Column({ default: true })
  paymentCash: boolean;

  @Column({ default: true })
  paymentCard: boolean;

  @Column({ default: false })
  paymentOnline: boolean;

  // --- Permissions STAFF ---
  @Column({ default: true })
  staffCanEditMenu: boolean;

  @Column({ default: true })
  staffCanManageOrders: boolean;

  // --- Permissions MANAGER ---
  @Column({ default: true })
  managerCanEditMenu: boolean;

  @Column({ default: true })
  managerCanManageOrders: boolean;

  @Column({ default: true })
  managerCanSeeStats: boolean;

  @Column({ default: false })
  managerCanManageStaff: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn()
  restaurant: Restaurant;
}
