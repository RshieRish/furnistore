import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
})
export class EstimatesGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendEstimateStatus(userId: string, status: string, message: string) {
    this.server.emit(`estimate:${userId}:status`, { status, message });
  }

  sendEstimateResult(userId: string, estimate: any) {
    this.server.emit(`estimate:${userId}:result`, { estimate });
  }
} 