import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  OrderType,
} from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { FilterOrdersDto } from './dto/filter-orders.dto';

@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async generateOrderNumber(restaurantId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.orderRepository.count({
      where: {
        restaurant: { id: restaurantId },
        createdAt: MoreThanOrEqual(today),
      },
    });

    return count + 1;
  }

  async create(createOrderDto: any) {
    const { items, restaurantId, tableId, ...orderData } = createOrderDto;

    // Calculate total price if not provided (e.g. from webhook)
    const totalPrice =
      orderData.totalPrice ||
      items.reduce(
        (acc: number, item: any) => acc + item.priceAtOrder * item.quantity,
        0,
      );

    // Generate consecutive order number for the day
    const orderNumber = await this.generateOrderNumber(restaurantId);

    const order = this.orderRepository.create({
      ...orderData,
      orderNumber,
      totalPrice,
      restaurant: { id: restaurantId },
      table: tableId ? { id: tableId } : null,
      type: orderData.type || OrderType.DINE_IN,
      customerName: orderData.customerName || null,
      status: OrderStatus.PENDING,
      paymentStatus: orderData.paymentStatus || PaymentStatus.UNPAID,
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderItems = items.map((item: any) =>
      this.orderItemRepository.create({
        ...item,
        order: savedOrder,
      }),
    );

    await this.orderItemRepository.save(orderItems);

    const fullOrder = await this.findOne((savedOrder as any).id);

    // Notify the restaurant in real-time
    this.notificationsGateway.notifyNewOrder(restaurantId, fullOrder);

    return fullOrder;
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.menuItem', 'table', 'restaurant'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByRestaurant(restaurantId: string) {
    return this.orderRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['items', 'table'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.orderRepository.update(id, { status });
    const updatedOrder = await this.findOne(id);
    
    // Notify clients in the restaurant room
    if ((updatedOrder as any).restaurant?.id) {
      this.notificationsGateway.notifyOrderStatusUpdate(
        (updatedOrder as any).restaurant.id,
        id,
        status
      );
    }
    
    return updatedOrder;
  }

  async findAll(filter: FilterOrdersDto) {
    const { status, paymentStatus, type, fromDate, toDate, tableId } = filter;
    const where: any = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (type) where.type = type;
    if (tableId) where.table = { id: tableId };

    if (fromDate && toDate) {
      where.createdAt = Between(new Date(fromDate), new Date(toDate));
    } else if (fromDate) {
      where.createdAt = MoreThanOrEqual(new Date(fromDate));
    }

    return this.orderRepository.find({
      where,
      relations: ['items', 'table', 'restaurant'],
      order: { createdAt: 'DESC' },
    });
  }
}

