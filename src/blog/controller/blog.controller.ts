import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from '../service/blog.service';
import { Observable } from 'rxjs';
import { BlogEntry } from '../models/blog-entry.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
// import { UserIsUserGuard } from 'src/auth/guards/UserIsUser.guard';

@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogEntry: BlogEntry, @Request() req): Observable<BlogEntry> {
    const user = req.user.user;
    return this.blogService.create(user, blogEntry);
  }

  @Get()
  findBlogEntries(@Query('userId') userId: number): Observable<BlogEntry[]> {
    if (userId == null) {
      return this.blogService.findAll(); // return all user's blog entries
    } else {
      // return only of specific user
      return this.blogService.findAllByUser(userId);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<BlogEntry> {
    return this.blogService.findOne(id);
  }
}
