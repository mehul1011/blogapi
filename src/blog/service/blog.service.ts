import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Observable, from, map, of, switchMap, tap } from 'rxjs';
import { BlogEntry } from '../models/blog-entry.interface';
import { User } from 'src/user/models/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntryEntity } from '../models/blog-entry.entity';
import { Equal, Repository } from 'typeorm';
import { UserService } from 'src/user/service/user.service';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
const slugify = require('slugify');

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntryEntity)
    private readonly blogRepository: Repository<BlogEntryEntity>,
    @Inject(forwardRef(() => UserService))
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
    console.log(id);
    return from(
      this.blogRepository.findOne({ where: { id }, relations: ['author'] }),
      // ).pipe(
      //   map((blogEntity) => {
      //     console.log(blogEntity);
      //     return blogEntity;
      //   }),
    );
  }

  updateOne(id: number, blogEntry: BlogEntry): Observable<BlogEntry> {
    return from(this.blogRepository.update(id, blogEntry)).pipe(
      switchMap(() => this.findOne(id)),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.blogRepository.delete(id));
  }

  paginateAll(options: IPaginationOptions): Observable<Pagination<BlogEntry>> {
    return from(
      paginate<BlogEntry>(this.blogRepository, options, {
        relations: ['author'],
      }),
    ).pipe(map((blogEntries: Pagination<BlogEntry>) => blogEntries));
  }

  paginateByUser(
    options: IPaginationOptions,
    userId: number,
  ): Observable<Pagination<BlogEntry>> {
    return from(
      paginate<BlogEntry>(this.blogRepository, options, {
        relations: ['author'],
        where: [{ author: { id: userId } }],
      }),
    ).pipe(map((blogEntries: Pagination<BlogEntry>) => blogEntries));
  }
}
