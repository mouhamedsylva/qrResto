import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MenuItem } from './menu-item.entity';

@Entity('menu_item_options')
export class MenuItemOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.id, { onDelete: 'CASCADE' })
  menuItem: MenuItem;
}
