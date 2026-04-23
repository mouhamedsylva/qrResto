import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantSettings } from './entities/restaurant-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Order, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Between } from 'typeorm';
import * as QRCode from 'qrcode';
import { Table } from '../tables/entities/table.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(RestaurantSettings)
    private settingsRepository: Repository<RestaurantSettings>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
    private storageService: StorageService,
  ) {}

  private formatTrendPercent(current: number, previous: number): number {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  private getPeriodBounds() {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    return { todayStart, todayEnd, yesterdayStart, yesterdayEnd };
  }

  private computeAveragePreparationTime(orders: Order[]): number {
    const doneOrders = orders.filter((order) =>
      [OrderStatus.READY, OrderStatus.COMPLETED].includes(order.status),
    );

    if (doneOrders.length === 0) {
      return 0;
    }

    const totalMinutes = doneOrders.reduce((sum, order) => {
      const diffMs =
        new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime();
      return sum + Math.max(0, diffMs / 60000);
    }, 0);

    return Number((totalMinutes / doneOrders.length).toFixed(1));
  }


  async create(createRestaurantDto: any) {
    const restaurant = this.restaurantRepository.create(createRestaurantDto);
    return this.restaurantRepository.save(restaurant);
  }

  async findAll() {
    return this.restaurantRepository.find();
  }

  async findOne(id: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['categories', 'categories.items', 'tables'],
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    
    // Filter out inactive items for client consumption
    if (restaurant.categories) {
      restaurant.categories = restaurant.categories.map(category => ({
        ...category,
        items: category.items ? category.items.filter(item => item.isActive) : [],
      }));
    }
    
    return restaurant;
  }

  async update(id: string, updateRestaurantDto: any) {
    await this.restaurantRepository.update(id, updateRestaurantDto);
    return this.findOne(id);
  }

  async updateLogo(id: string, file: Express.Multer.File) {
    const restaurant = await this.findOne(id);
    const logoUrl = await this.storageService.uploadFile(file, 'uploads/logos');
    restaurant.logoUrl = logoUrl;
    return this.restaurantRepository.save(restaurant);
  }

  async generateQRCode(restaurantId: string, tableId: string) {
    // URL scheme: frontend_url/menu/restaurantId/tableId
    const url = `https://qr-order.app/menu/${restaurantId}/${tableId}`;
    return QRCode.toDataURL(url);
  }

  async updateSettings(restaurantId: string, dto: UpdateSettingsDto) {
    let settings = await this.settingsRepository.findOne({
      where: { restaurant: { id: restaurantId } },
    });

    if (!settings) {
      settings = this.settingsRepository.create({
        ...dto,
        restaurant: { id: restaurantId } as any,
      });
    } else {
      Object.assign(settings, dto);
    }

    return this.settingsRepository.save(settings);
  }

  async getSettings(restaurantId: string) {
    let settings = await this.settingsRepository.findOne({
      where: { restaurant: { id: restaurantId } },
    });

    if (!settings) {
      settings = this.settingsRepository.create({
        restaurant: { id: restaurantId } as any,
      });
      settings = await this.settingsRepository.save(settings);
    }

    return settings;
  }

  async getRestaurantWithSettings(restaurantId: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    const settings = await this.getSettings(restaurantId);

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phoneNumber: restaurant.phoneNumber,
        email: restaurant.email,
        logoUrl: restaurant.logoUrl,
        isActive: restaurant.isActive,
      },
      settings: {
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        buttonStyle: settings.buttonStyle,
        currency: settings.currency,
        language: settings.language,
        isOrderingEnabled: settings.isOrderingEnabled,
        isTaxIncluded: settings.isTaxIncluded,
        taxRate: settings.taxRate,
        prepTime: settings.prepTime,
        paymentMethods: {
          cash: settings.paymentCash,
          card: settings.paymentCard,
          online: settings.paymentOnline,
        },
        permissions: {
          managerCanSeeStats: settings.managerCanSeeStats,
          managerCanEditMenu: settings.managerCanEditMenu,
          managerCanManageOrders: settings.managerCanManageOrders,
          managerCanManageStaff: settings.managerCanManageStaff,
          staffCanEditMenu: settings.staffCanEditMenu,
          staffCanManageOrders: settings.staffCanManageOrders,
        },
      },
    };
  }

  async getDashboardStats(restaurantId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Ventes aujourd'hui (Chiffre d'affaires)
    const ordersToday = await this.orderRepository.find({
      where: {
        restaurant: { id: restaurantId },
        paymentStatus: PaymentStatus.PAID,
        createdAt: Between(todayStart, todayEnd),
      },
    });

    const dailySales = ordersToday.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0,
    );

    // 2. Nombre de commandes (proxy pour scans/clients)
    const dailyOrdersCount = await this.orderRepository.count({
      where: {
        restaurant: { id: restaurantId },
        createdAt: Between(todayStart, todayEnd),
      },
    });

    // 3. Effectif du restaurant (Manager + Staff)
    const staffUsersCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.restaurantId = :restaurantId', { restaurantId })
      .andWhere('user.role IN (:...roles)', {
        roles: [UserRole.MANAGER, UserRole.STAFF],
      })
      .getCount();

    return {
      dailySales,
      dailyOrdersCount,
      staffCount: staffUsersCount,
      currency: 'XOF', // Par défaut
    };
  }

  async getDashboardOverview(restaurantId: string) {
    const { todayStart, todayEnd, yesterdayStart, yesterdayEnd } =
      this.getPeriodBounds();

    const [ordersToday, ordersYesterday, tables] = await Promise.all([
      this.orderRepository.find({
        where: {
          restaurant: { id: restaurantId },
          createdAt: Between(todayStart, todayEnd),
        },
        relations: ['table'],
        order: { createdAt: 'DESC' },
      }),
      this.orderRepository.find({
        where: {
          restaurant: { id: restaurantId },
          createdAt: Between(yesterdayStart, yesterdayEnd),
        },
        relations: ['table'],
      }),
      this.tableRepository.find({
        where: { restaurant: { id: restaurantId } },
        order: { number: 'ASC' },
      }),
    ]);

    const revenueToday = ordersToday
      .filter((order) => order.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, order) => sum + Number(order.totalPrice), 0);
    const revenueYesterday = ordersYesterday
      .filter((order) => order.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, order) => sum + Number(order.totalPrice), 0);

    const ordersCountToday = ordersToday.length;
    const ordersCountYesterday = ordersYesterday.length;

    const customerKeysToday = new Set(
      ordersToday.map((order) => {
        if (order.customerName?.trim()) {
          return `name:${order.customerName.trim().toLowerCase()}`;
        }
        if (order.table?.id) {
          return `table:${order.table.id}`;
        }
        return `order:${order.id}`;
      }),
    );
    const customerKeysYesterday = new Set(
      ordersYesterday.map((order) => {
        if (order.customerName?.trim()) {
          return `name:${order.customerName.trim().toLowerCase()}`;
        }
        if (order.table?.id) {
          return `table:${order.table.id}`;
        }
        return `order:${order.id}`;
      }),
    );

    const prepToday = this.computeAveragePreparationTime(ordersToday);
    const prepYesterday = this.computeAveragePreparationTime(ordersYesterday);
    const prepDelta = Number((prepToday - prepYesterday).toFixed(1));

    const activeStatuses = [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY];
    const activeOrdersByTable = new Map<string, Order>();

    for (const order of ordersToday) {
      if (!order.table?.id || !activeStatuses.includes(order.status)) {
        continue;
      }
      if (!activeOrdersByTable.has(order.table.id)) {
        activeOrdersByTable.set(order.table.id, order);
      }
    }

    const now = new Date();
    const floorPlan = tables.map((table) => {
      const activeOrder = activeOrdersByTable.get(table.id);
      if (!activeOrder) {
        return {
          tableId: table.id,
          tableNumber: table.number,
          state: 'FREE',
          occupiedMinutes: 0,
        };
      }

      const occupiedMinutes = Math.max(
        0,
        Math.floor(
          (now.getTime() - new Date(activeOrder.createdAt).getTime()) / 60000,
        ),
      );

      return {
        tableId: table.id,
        tableNumber: table.number,
        state: occupiedMinutes > 45 ? 'LONG_OCCUPIED' : 'OCCUPIED',
        occupiedMinutes,
      };
    });

    const recentOrders = ordersToday.slice(0, 8).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || 'Client',
      table: order.table?.number || 'A emporter',
      status: order.status,
      amount: Number(order.totalPrice),
      createdAt: order.createdAt,
    }));

    return {
      stats: {
        revenue: {
          value: Number(revenueToday.toFixed(2)),
          trendPercent: this.formatTrendPercent(revenueToday, revenueYesterday),
        },
        orders: {
          value: ordersCountToday,
          trendPercent: this.formatTrendPercent(ordersCountToday, ordersCountYesterday),
        },
        customers: {
          value: customerKeysToday.size,
          trendPercent: this.formatTrendPercent(
            customerKeysToday.size,
            customerKeysYesterday.size,
          ),
        },
        prepTime: {
          valueMinutes: prepToday,
          trendMinutes: prepDelta,
          improved: prepDelta <= 0,
        },
      },
      recentOrders,
      floorPlan,
    };
  }

}
