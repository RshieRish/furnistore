import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import("./schemas/product.schema").ProductDocument>;
    findAll(category?: string): Promise<import("./schemas/product.schema").ProductDocument[]>;
    findOne(id: string): Promise<import("./schemas/product.schema").ProductDocument>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("./schemas/product.schema").ProductDocument>;
    remove(id: string): Promise<import("./schemas/product.schema").ProductDocument>;
}
