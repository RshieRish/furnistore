export declare class CreateOrderDto {
    items: {
        productId: string;
        quantity: number;
    }[];
    shippingAddress: string;
    totalAmount: number;
}
