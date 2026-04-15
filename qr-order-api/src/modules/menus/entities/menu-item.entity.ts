import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  badgeLabel: string;

  @Column({ nullable: true })
  badgeColor: string;

  @Column({ default: 0 })
  stockQty: number;

  @Column({ default: 5 })
  lowStockThreshold: number;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDishOfDay: boolean;

  @Column({ nullable: true })
  prepTime: number;

  @Column({ nullable: true })
  calories: number;

  @Column('simple-array', { nullable: true })
  allergens: string[];

  @Column('simple-array', { nullable: true })
  dietaryLabels: string[];

  @Column('simple-array', { nullable: true })
  availableDays: number[];

  @Column({ default: 0 })
  ordersCount: number;

  @Column({ nullable: true })
  subcategoryName: string;

  @ManyToOne(() => Category, (category) => category.items, { onDelete: 'CASCADE' })
  category: Category;
}
