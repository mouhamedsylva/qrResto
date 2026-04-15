import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async findAllByRestaurant(restaurantId: string) {
    return this.tableRepository.find({
      where: { restaurant: { id: restaurantId } },
    });
  }

  async findOne(id: string) {
    const table = await this.tableRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  async create(restaurantId: string, createTableDto: any) {
    const number = String(createTableDto.number).trim();
    const shortCode =
      createTableDto.shortCode?.trim() ||
      `TBL-${number}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const table = this.tableRepository.create({
      number,
      shortCode,
      restaurant: { id: restaurantId },
    });
    return this.tableRepository.save(table);
  }

  async bulkCreate(restaurantId: string, bulkDto: any) {
    const tables: any[] = [];
    const prefix = bulkDto.shortCodePrefix?.trim() || 'TBL';
    for (let i = 0; i < bulkDto.count; i++) {
      const number = String(Number(bulkDto.startNumber) + i);
      const table = {
        number,
        shortCode: `${prefix}-${number}-${Math.random()
          .toString(36)
          .slice(2, 5)
          .toUpperCase()}`,
        restaurant: { id: restaurantId },
      };
      tables.push(table);
    }
    const createdTables = this.tableRepository.create(tables);
    return this.tableRepository.save(createdTables);
  }

  async generateQrCode(id: string) {
    await this.findOne(id);
    return {
      tableId: id,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${id}`,
    };
  }

  async update(id: string, updateTableDto: any) {
    await this.tableRepository.update(id, updateTableDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const table = await this.findOne(id);
    await this.tableRepository.remove(table);
    return { deleted: true };
  }
}
