import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserRole } from './user.interface';
import { BlogEntryEntity } from 'src/blog/models/blog-entry.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  @IsNotEmpty()
  username: string;

  @Column()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ select: false }) // unless SELECT query demands it won't be given
  // @Column()
  @IsNotEmpty()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  profileImage: string;

  @OneToMany(
    (type) => BlogEntryEntity,
    (blogEntryEntity) => blogEntryEntity.author,
  )
  blogEntries: BlogEntryEntity[]; // each instance of author can have => many blogEntries
  // with a author many blogs

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
}
