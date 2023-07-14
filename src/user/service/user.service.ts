import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import { Observable, from } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  create(user: User): Observable<User> {
    return from(this.userRepo.save(user));
  } // from converts promise to Observable that is returned

  findOne(id: number): Observable<User> {
    return from(this.userRepo.findOne({ where: { id } }));
  }

  findAll(): Observable<User[]> {
    return from(this.userRepo.find());
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepo.delete(id));
  }

  updateOne(id: number, user: User): Observable<any> {
    return from(this.userRepo.update(id, user));
  }
}
