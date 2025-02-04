import { Server, Socket } from 'socket.io';
export declare class EstimatesGateway {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    sendEstimateStatus(userId: string, status: string, message: string): void;
    sendEstimateResult(userId: string, estimate: any): void;
}
