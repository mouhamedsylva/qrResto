import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string; // Table number/name (e.g., "Table 1" or "A5")

  @Column({ unique: true })
  shortCode: string; // Unique code for QR generation

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.tables)
  restaurant: Restaurant;

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];
}
