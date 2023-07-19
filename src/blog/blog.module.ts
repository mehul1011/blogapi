import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntryEntity } from './models/blog-entry.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { BlogController } from './controller/blog.controller';
import { BlogService } from './service/blog.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntryEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
