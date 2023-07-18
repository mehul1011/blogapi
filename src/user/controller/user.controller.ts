import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User, UserRole } from '../models/user.interface';
import { Observable, catchError, from, map, of, tap } from 'rxjs';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
const path = require('path');

export const storage = {
  storage: diskStorage({
    destination: './uploads/profileImages',
    filename: (req, file, callBack) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      callBack(null, `${filename}${extension}`);
    },
  }),
};
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() user: User): Observable<User> {
    return this.userService.create(user);
  }

  @Get(':id')
  findOne(@Param() params): Observable<User | any> {
    return this.userService.findOne(params.id).pipe(
      map((user: User) => user),
      catchError((err) => of({ error: err.message })),
    );
  }

  @Post('login')
  login(@Body() user: User): Observable<any> {
    return this.userService.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
      catchError((err) => of({ error: err.message })),
    );
  }

  // @hasRoles(UserRole.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('username') username: string,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    if (username === null || username === undefined) {
      return from(
        this.userService.paginate({
          page: Number(page),
          limit: Number(limit),
          route: 'http://localhost:3000/api/user', // based on the route it attaches the next, prev, first, last page links
        }),
      );
    } else {
      return from(
        this.userService.paginateFilterByUsername(
          {
            page: Number(page),
            limit: Number(limit),
            route: 'http://localhost:3002/api/user',
          },
          { username },
        ),
      );
    }
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<any> {
    return this.userService.deleteOne(Number(id));
  }

  @Put(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updateOne(Number(id), user);
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateRoleForUser(
    @Param('id') id: string,
    @Body() user: User,
  ): Observable<User> {
    return this.userService.updateRoleOfUser(Number(id), user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Request() req): Observable<any> {
    // console.log(file);
    const user: User = req.user.user;
    return this.userService
      .updateOne(user.id, { profileImage: file.filename })
      .pipe(
        tap((user: User) => console.log(user)),
        map((user: User) => ({ profileImage: user.profileImage })),
      );
    // 2nd arg is only what's required to be changed needs to be passed.
  }

  @Get('profile-image/:imagename')
  findProfileImage(@Param('imagename') imagename, @Res() res): Observable<any> {
    return of(
      res.sendFile(join(process.cwd(), 'uploads/profileImages/' + imagename)),
    );
  }
}
