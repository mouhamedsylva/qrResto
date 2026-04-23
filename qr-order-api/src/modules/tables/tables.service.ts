import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Table } from './entities/table.entity';

// TODO: Idéalement, récupérez cette URL depuis ConfigService
const CLIENT_APP_URL = 'https://qr-order-client.web.app';

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
    
    const savedTable = await this.tableRepository.save(table);
    const qrData = `${CLIENT_APP_URL}/menu?restaurantId=${restaurantId}&tableId=${savedTable.id}`;
    
    return {
      ...savedTable,
      qrCodeUrl: this.generateQrUrl(qrData, 'medium'),
    };
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
    const savedTables = await this.tableRepository.save(createdTables);

    return savedTables.map((table) => {
      const qrData = `${CLIENT_APP_URL}/menu?restaurantId=${restaurantId}&tableId=${table.id}`;
      return {
        ...table,
        qrCodeUrl: this.generateQrUrl(qrData, bulkDto.size || 'medium'),
      };
    });
  }

  async generateQrCode(id: string) {
    const table = await this.findOne(id);
    const qrData = `${CLIENT_APP_URL}/menu?restaurantId=${table.restaurant.id}&tableId=${table.id}`;
    return {
      tableId: id,
      qrCodeUrl: this.generateQrUrl(qrData, 'medium'),
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

  async bulkQrExport(exportDto: any) {
    const { tableIds, format, size, customization } = exportDto;

    // Récupérer les tables
    const tables = await this.tableRepository.find({
      where: { id: In(tableIds) },
      relations: ['restaurant'],
    });

    if (!tables.length) {
      throw new NotFoundException('Aucune table trouvée');
    }

    // Générer les QR codes
    const qrCodes = tables.map((table) => {
      const qrData = `${CLIENT_APP_URL}/menu?restaurantId=${table.restaurant.id}&tableId=${table.id}`;
      return {
        tableId: table.id,
        tableNumber: table.number,
        qrCodeUrl: this.generateQrUrl(qrData, size, customization),
      };
    });

    return {
      format,
      qrCodes,
      downloadUrl: `/api/tables/download-bulk/${Date.now()}`, // Mock URL
      message: `${qrCodes.length} QR codes générés`,
    };
  }

  async generateCustomQr(id: string, customization: any) {
    const table = await this.findOne(id);

    const {
      foregroundColor = '#000000',
      backgroundColor = '#FFFFFF',
      logoUrl,
      text,
      size = 'medium',
      format = 'png',
    } = customization;

    const qrData = `${CLIENT_APP_URL}/menu?restaurantId=${table.restaurant.id}&tableId=${table.id}`;
    const qrUrl = this.generateQrUrl(qrData, size, {
      foregroundColor,
      backgroundColor,
      logoUrl,
      text,
    });

    return {
      tableId: table.id,
      tableNumber: table.number,
      qrCodeUrl: qrUrl,
      format,
      customization: {
        foregroundColor,
        backgroundColor,
        logoUrl,
        text,
        size,
      },
    };
  }

  async generateRestaurantCustomQr(restaurantId: string, customization: any) {
    const {
      foregroundColor = '#000000',
      backgroundColor = '#FFFFFF',
      logoUrl,
      text,
      size = 'medium',
      format = 'png',
    } = customization;

    const qrData = `${CLIENT_APP_URL}/menu?restaurantId=${restaurantId}`;
    const qrUrl = this.generateQrUrl(qrData, size, {
      foregroundColor,
      backgroundColor,
      logoUrl,
      text,
    });

    return {
      restaurantId,
      qrCodeUrl: qrUrl,
      format,
      customization: {
        foregroundColor,
        backgroundColor,
        logoUrl,
        text,
        size,
      },
    };
  }

  private generateQrUrl(
    qrData: string,
    size: string = 'medium',
    customization?: any,
  ): string {
    const sizeMap: Record<string, number> = {
      small: 200,
      medium: 300,
      large: 500,
      xlarge: 800,
    };

    const qrSize = sizeMap[size] || 300;

    const encodedData = encodeURIComponent(qrData);
    // Utiliser l'API QR Server avec personnalisation
    let url = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedData}`;

    if (customization?.foregroundColor) {
      const color = customization.foregroundColor.replace('#', '');
      url += `&color=${color}`;
    }

    if (customization?.backgroundColor) {
      const bgColor = customization.backgroundColor.replace('#', '');
      url += `&bgcolor=${bgColor}`;
    }

    return url;
  }
}
