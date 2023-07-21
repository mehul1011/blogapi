import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from '../service/blog.service';
import { Observable } from 'rxjs';
import { BlogEntry } from '../models/blog-entry.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserIsAuthorGuard } from '../guards/user-is-author.guard';
// import { UserIsUserGuard } from 'src/auth/guards/UserIsUser.guard';

export const BLOG_ENTRY_URL = 'http://localhost:3002/api/blog-entries/';
@Controller('blog-entries')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogEntry: BlogEntry, @Request() req): Observable<BlogEntry> {
    const user = req.user;
    return this.blogService.create(user, blogEntry);
  }

  // @Get()
  // findBlogEntries(@Query('userId') userId: number): Observable<BlogEntry[]> {
  //   if (userId == null) {
  //     return this.blogService.findAll(); // return all user's blog entries
  //   } else {
  //     // return only of specific user
  //     return this.blogService.findAllByUser(userId);
  //   }
  // }
  @Get('') // get all blogs paginated
  index(@Query('page') page = 1, @Query('limit') limit = 10) {
    limit = limit > 100 ? 100 : limit;
    return this.blogService.paginateAll({
      page: Number(page),
      limit: Number(limit),
      route: BLOG_ENTRY_URL,
    });
  }

  @Get('user/:userId') // all blog entries for a user paginated
  indexByUser(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Param('userId') userId: number,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.blogService.paginateByUser(
      {
        page: Number(page),
        limit: Number(limit),
        route: BLOG_ENTRY_URL,
      },
      Number(userId),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<BlogEntry> {
    return this.blogService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Put(':id')
  updateOne(
    @Param('id') id: number,
    @Body() blogEntry: BlogEntry,
  ): Observable<BlogEntry> {
    return this.blogService.updateOne(Number(id), blogEntry);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.blogService.deleteOne(id);
  }
}
