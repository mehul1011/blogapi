import { Injectable } from '@nestjs/common';
import { Observable, from, of, switchMap } from 'rxjs';
import { BlogEntry } from '../models/blog-entry.interface';
import { User } from 'src/user/models/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntryEntity } from '../models/blog-entry.entity';
import { Equal, Repository } from 'typeorm';
import { UserService } from 'src/user/service/user.service';
const slugify = require('slugify');

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntryEntity)
    private readonly blogRepository: Repository<BlogEntryEntity>,
    private userService: UserService,
  ) {}
  create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
    blogEntry.author = user;
    return this.generateSlug(blogEntry.title).pipe(
      switchMap((slug: string) => {
        blogEntry.slug = slug;
        return from(this.blogRepository.save(blogEntry));
      }),
    );
  }

  generateSlug(title: string): Observable<string> {
    // SEO friendly link against api
    return of(slugify(title));
  }

  findAll(): Observable<BlogEntry[]> {
    return from(this.blogRepository.find({ relations: ['author'] }));
  }

  findAllByUser(userId: number): Observable<BlogEntry[]> {
    return from(
      this.blogRepository.find({
        where: { author: { id: userId } },
        relations: ['author'],
      }),
    );
  }

  findOne(id: number): Observable<BlogEntry> {
    return from(
      this.blogRepository.findOne({ where: { id }, relations: ['author'] }),
    );
  }
}
