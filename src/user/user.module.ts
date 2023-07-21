import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { BlogModule } from 'src/blog/blog.module';
import { BlogService } from 'src/blog/service/blog.service';
import { BlogEntryEntity } from 'src/blog/models/blog-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    // TypeOrmModule.forFeature([BlogEntryEntity]),

    forwardRef(() => AuthModule),
    forwardRef(() => BlogModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
