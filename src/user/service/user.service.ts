import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Like, Repository } from 'typeorm';
import { User, UserRole } from '../models/user.interface';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/auth/services/auth.service';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  create(user: User): Observable<User> {
    return this.authService.hashPassword(user.password).pipe(
      switchMap((hashedPassword: string) => {
        const newUser = new UserEntity();
        newUser.name = user.name;
        newUser.username = user.username;
        newUser.email = user.email;
        newUser.password = hashedPassword;
        newUser.role = UserRole.USER; // by default lowest role
        return from(this.userRepo.save(newUser)).pipe(
          map((user: User) => {
            const { password, ...result } = user;
            return result;
          }),
          catchError((err) => throwError(() => err)),
        );
      }),
    );
    // return from(this.userRepo.save(user));
  } // from converts promise to Observable that is returned

  findOne(id: number): Observable<User> {
    return from(this.userRepo.findOne({ where: { id } })).pipe(
      map((user: User) => {
        const { password, ...result } = user;
        return result;
      }),
    );
  }

  findAll(): Observable<User[]> {
    return from(this.userRepo.find()).pipe(
      map((users: User[]) => {
        users.forEach(function (item) {
          delete item.password;
        });
        return users;
      }),
    );
  }

  paginate(options: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.userRepo, options)).pipe(
      map((userPagable: Pagination<User>) => {
        userPagable.items.forEach((val) => delete val.password);
        return userPagable;
      }),
    );
  }

  paginateFilterByUsername(
    options: IPaginationOptions,
    user: User,
  ): Observable<Pagination<User>> {
    console.log(options, user);
    return from(
      this.userRepo.findAndCount({
        skip: Number(options.page) * Number(options.limit) || 0,
        take: Number(options.limit) || 10,
        order: { id: 'ASC' },
        select: ['id', 'name', 'username', 'email', 'role'],
        where: [
          {
            username: Like(`%${user.username}%`),
          },
        ],
      }),
    ).pipe(
      map(([users, totalUsers]) => {
        console.log(users, totalUsers);
        const usersPagable: Pagination<User> = {
          items: users,
          links: {
            first: options.route + `?limit=${options.limit}`,
            previous:
              Number(options.page) > 0
                ? options.route +
                  `?page=${Number(options.page) - 1}&limit=${options.limit}`
                : '',
            next:
              Number(options.page) !=
              Math.ceil(totalUsers / Number(options.limit))
                ? options.route +
                  `?limit=${options.limit}&page=${Number(options.page) + 1}`
                : '',
            last:
              options.route +
              `?limit=${options.limit}&page=${Math.ceil(
                totalUsers / Number(options.limit),
              )}`,
          },
          meta: {
            currentPage: Number(options.page),
            itemCount: users.length,
            totalItems: totalUsers,
            totalPages: Math.ceil(totalUsers / Number(options.limit)),
            itemsPerPage: Number(options.limit),
          },
        };
        return usersPagable;
      }),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepo.delete(id));
  }

  updateOne(id: number, user: User): Observable<any> {
    // check if the actual user is asking for this change
    delete user.password;
    delete user.email;
    delete user.role; // user can't delete their own role
    return from(this.userRepo.update(id, user)).pipe(
      switchMap(() => this.findOne(id)),
    );
  }

  login(user: User): Observable<string> {
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: User) => {
        if (user) {
          return this.authService
            .generateJWT(user)
            .pipe(map((jwt: string) => jwt));
        } else {
          return 'Invalid credentials';
        }
      }),
    );
  }

  validateUser(email: string, password: string): Observable<User | Error> {
    return this.findByMail(email).pipe(
      switchMap((user: User) =>
        this.authService.comparePasswords(password, user.password).pipe(
          map((matched: boolean) => {
            if (matched) {
              const { password, ...result } = user;
              return result;
            } else {
              throw Error;
            }
          }),
        ),
      ),
    );
  }

  findByMail(email: string): Observable<User> {
    return from(this.userRepo.findOne({ where: { email } }));
  }

  updateRoleOfUser(id: number, user: User): Observable<any> {
    return from(this.userRepo.update(id, user));
  }
}
