import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { Table } from '../tables/entities/table.entity';
import { AnalyticsQueryDto, AnalyticsPeriod } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  private getDateRange(query: AnalyticsQueryDto): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start: Date;

    switch (query.period) {
      case AnalyticsPeriod.TODAY:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case AnalyticsPeriod.LAST_7:
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case AnalyticsPeriod.LAST_30:
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        break;
      case AnalyticsPeriod.CUSTOM:
        start = query.startDate ? new Date(query.startDate) : new Date(now);
        start.setHours(0, 0, 0, 0);
        if (query.endDate) {
          end.setTime(new Date(query.endDate).getTime());
          end.setHours(23, 59, 59, 999);
        }
        break;
      default:
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  }

  async getAnalytics(restaurantId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(query);
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);

    // Construire les conditions de filtrage
    const whereConditions: any = {
      restaurant: { id: restaurantId },
      createdAt: Between(start, end),
    };

    if (query.status) {
      whereConditions.status = query.status;
    }

    const prevWhereConditions: any = {
      restaurant: { id: restaurantId },
      createdAt: Between(prevStart, prevEnd),
    };

    // Récupérer les commandes
    const orders = await this.orderRepository.find({
      where: whereConditions,
      relations: ['items', 'items.menuItem', 'items.menuItem.category', 'table'],
    });

    const previousOrders = await this.orderRepository.find({
      where: prevWhereConditions,
      relations: ['items', 'items.menuItem'],
    });

    // Filtrer par catégorie et canal si nécessaire
    let filteredOrders = orders;
    if (query.category || query.channel) {
      filteredOrders = orders.filter((order) => {
        let categoryMatch = true;
        let channelMatch = true;

        if (query.category) {
          categoryMatch = order.items.some(
            (item) => item.menuItem?.category?.name === query.category,
          );
        }

        if (query.channel) {
          // Ajouter la logique de canal si disponible dans votre modèle
          // channelMatch = order.channel === query.channel;
        }

        return categoryMatch && channelMatch;
      });
    }

    // Calculer les KPIs
    const kpis = this.calculateKPIs(filteredOrders, previousOrders);

    // Top articles
    const topItems = this.calculateTopItems(filteredOrders);

    // Répartition par statut
    const statusSplit = this.calculateStatusSplit(filteredOrders);

    // Données horaires
    const hourlyData = this.calculateHourlyData(filteredOrders);

    // Performance par catégorie
    const categoryPerformance = await this.calculateCategoryPerformance(
      filteredOrders,
    );

    // Performance des tables
    const tablePerformance = this.calculateTablePerformance(filteredOrders);

    // Annulations
    const cancellations = this.calculateCancellations(filteredOrders);

    // Prévisions
    const forecast = this.calculateForecast(filteredOrders, start, end);

    // Cohortes clients
    const cohorts = this.calculateCohorts(filteredOrders);

    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      kpis,
      topItems,
      statusSplit,
      hourlyData,
      categoryPerformance,
      tablePerformance,
      cancellations,
      forecast,
      cohorts,
      totalOrders: filteredOrders.length,
    };
  }

  private calculateKPIs(
    currentOrders: Order[],
    previousOrders: Order[],
  ): any {
    const currentRevenue = currentOrders.reduce(
      (sum, order) => sum + Number(order.totalPrice || 0),
      0,
    );
    const currentCount = currentOrders.length;
    const currentAvg = currentCount ? currentRevenue / currentCount : 0;
    const currentClients = new Set(
      currentOrders.map((o) => o.customerName || 'anonymous'),
    ).size;

    const prevRevenue = previousOrders.reduce(
      (sum, order) => sum + Number(order.totalPrice || 0),
      0,
    );
    const prevCount = previousOrders.length;
    const prevAvg = prevCount ? prevRevenue / prevCount : 0;
    const prevClients = new Set(
      previousOrders.map((o) => o.customerName || 'anonymous'),
    ).size;

    const calculateTrend = (current: number, previous: number): number => {
      if (previous <= 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      revenue: {
        value: currentRevenue,
        trend: calculateTrend(currentRevenue, prevRevenue),
      },
      orders: {
        value: currentCount,
        trend: calculateTrend(currentCount, prevCount),
      },
      avgTicket: {
        value: currentAvg,
        trend: calculateTrend(currentAvg, prevAvg),
      },
      uniqueClients: {
        value: currentClients,
        trend: calculateTrend(currentClients, prevClients),
      },
    };
  }

  private calculateTopItems(orders: Order[]): any[] {
    const itemMap = new Map<
      string,
      { name: string; orders: number; revenue: number }
    >();

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const name = item.menuItem?.name || 'Article inconnu';
        const existing = itemMap.get(name) || {
          name,
          orders: 0,
          revenue: 0,
        };
        itemMap.set(name, {
          name,
          orders: existing.orders + item.quantity,
          revenue:
            existing.revenue + Number(item.priceAtOrder) * item.quantity,
        });
      });
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private calculateStatusSplit(orders: Order[]): any {
    const statusCount = {
      COMPLETED: 0,
      CANCELLED: 0,
      PREPARING: 0,
      PENDING: 0,
      READY: 0,
    };

    orders.forEach((order) => {
      const status = order.status?.toUpperCase();
      if (status && status in statusCount) {
        statusCount[status as keyof typeof statusCount]++;
      }
    });

    return statusCount;
  }

  private calculateHourlyData(orders: Order[]): any[] {
    const hourlyMap = new Map<
      number,
      { hour: string; orders: number; amount: number }
    >();

    // Initialiser toutes les heures de 10h à 21h
    for (let h = 10; h <= 21; h++) {
      hourlyMap.set(h, {
        hour: `${h}h`,
        orders: 0,
        amount: 0,
      });
    }

    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      if (hour >= 10 && hour <= 21) {
        const existing = hourlyMap.get(hour)!;
        hourlyMap.set(hour, {
          ...existing,
          orders: existing.orders + 1,
          amount: existing.amount + Number(order.totalPrice || 0),
        });
      }
    });

    return Array.from(hourlyMap.values());
  }

  private async calculateCategoryPerformance(orders: Order[]): Promise<any[]> {
    const categoryMap = new Map<
      string,
      { category: string; orders: number; revenue: number; margin: number }
    >();

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const category = item.menuItem?.category?.name || 'Autre';
        const existing = categoryMap.get(category) || {
          category,
          orders: 0,
          revenue: 0,
          margin: 62, // Marge estimée par défaut
        };
        categoryMap.set(category, {
          ...existing,
          orders: existing.orders + item.quantity,
          revenue:
            existing.revenue + Number(item.priceAtOrder) * item.quantity,
        });
      });
    });

    return Array.from(categoryMap.values()).sort(
      (a, b) => b.revenue - a.revenue,
    );
  }

  private calculateTablePerformance(orders: Order[]): any[] {
    const tableMap = new Map<
      string,
      { table: string; orders: number; revenue: number; rotation: number }
    >();

    orders.forEach((order) => {
      const tableName = order.table?.number || 'Sans table';
      const existing = tableMap.get(tableName) || {
        table: tableName,
        orders: 0,
        revenue: 0,
        rotation: 0,
      };
      tableMap.set(tableName, {
        ...existing,
        orders: existing.orders + 1,
        revenue: existing.revenue + Number(order.totalPrice || 0),
        rotation: Math.max(1, Math.round((existing.orders + 1) / 2)),
      });
    });

    return Array.from(tableMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private calculateCancellations(orders: Order[]): any {
    const cancelledOrders = orders.filter(
      (o) => o.status?.toUpperCase() === 'CANCELLED',
    );
    const total = cancelledOrders.length;
    const rate = orders.length ? (total / orders.length) * 100 : 0;

    // Simuler les raisons d'annulation (à adapter selon votre modèle)
    const byReason = {
      'Client annule': Math.floor(total * 0.5),
      'Rupture stock': Math.floor(total * 0.3),
      'Delai long': total - Math.floor(total * 0.5) - Math.floor(total * 0.3),
    };

    return {
      total,
      rate,
      byReason,
    };
  }

  private calculateForecast(
    orders: Order[],
    start: Date,
    end: Date,
  ): any {
    const currentRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice || 0),
      0,
    );

    const now = new Date();
    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = now.getTime() - start.getTime();
    const progress =
      totalDuration > 0 ? elapsedDuration / totalDuration : 1;

    const endDayProjection =
      progress > 0 && progress < 1
        ? currentRevenue / progress
        : currentRevenue;
    const endWeekProjection = endDayProjection * 7;

    return {
      endDayProjection,
      endWeekProjection,
    };
  }

  private calculateCohorts(orders: Order[]): any {
    // Simuler les cohortes (à adapter selon votre modèle de clients)
    const uniqueCustomers = new Set(
      orders.map((o) => o.customerName || 'anonymous'),
    );
    const totalCustomers = uniqueCustomers.size;

    // Estimation : 40% nouveaux, 60% récurrents
    const newCount = Math.floor(totalCustomers * 0.4);
    const returningCount = totalCustomers - newCount;

    return {
      newCount,
      returningCount,
    };
  }
}
