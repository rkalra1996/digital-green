import { Module } from '@nestjs/common';
import { RolesController } from './controllers/roles/roles.controller';
import { RolesCoreService } from './services/roles-core/roles-core.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesSchema } from './schemas/roles.schema';
import { RolesUtilityService } from './services/roles-utility/roles-utility.service';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'roles', schema: RolesSchema}]),
    ],
    controllers: [RolesController],
    providers: [RolesCoreService, RolesUtilityService],
})
export class RolesModule {}
