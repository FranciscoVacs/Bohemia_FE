import { Purchase } from './';
import { BaseEntity } from './';

export interface User extends BaseEntity {
  email: string;
  user_name: string;
  user_surname: string;
  password: string;
  birth_date: Date;
  isAdmin?: boolean;
  purchase?: Purchase[];
}