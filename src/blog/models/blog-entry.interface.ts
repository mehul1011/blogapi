import { User } from 'src/user/models/user.interface';

export interface BlogEntry {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  body?: string;
  createdAt?: Date;
  updatedAt?: Date;
  likes?: number;
  author?: User; // a blog entry would be having a single user ie why only User and not User[]
  headerImage?: string;
  publishedDate?: Date;
  isPublished?: boolean;
}
