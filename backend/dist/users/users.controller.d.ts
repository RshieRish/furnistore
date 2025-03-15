import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<any>;
    findAll(): Promise<{}>;
    findOne(id: string): unknown;
    update(id: string, updateUserDto: UpdateUserDto): unknown;
    remove(id: string): unknown;
}
