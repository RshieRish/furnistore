import { Model } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private productModel;
    constructor(productModel: Model<ProductDocument>);
    create(createProductDto: CreateProductDto): Promise<ProductDocument>;
    findAll(): Promise<ProductDocument[]>;
    findOne(id: string): Promise<ProductDocument>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument>;
    remove(id: string): Promise<ProductDocument>;
    findByCategory(category: string): Promise<ProductDocument[]>;
    updateStock(id: string, quantity: number): Promise<ProductDocument>;
}
