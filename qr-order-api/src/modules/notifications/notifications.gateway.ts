import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(client: Socket, restaurantId: string) {
    client.join(`restaurant_${restaurantId}`);
    return { event: 'joined', room: `restaurant_${restaurantId}` };
  }

  notifyNewOrder(restaurantId: string, order: any) {
    this.server.to(`restaurant_${restaurantId}`).emit('newOrder', order);
  }

  notifyOrderStatusUpdate(restaurantId: string, orderId: string, status: string) {
    this.server.to(`restaurant_${restaurantId}`).emit('orderStatusUpdated', { orderId, status });
  }
}
