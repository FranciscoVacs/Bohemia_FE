import { Purchase } from './purchase.entity';

export interface User {
  email: string;
  user_name: string;
  user_surname: string;
  password: string;
  birth_date: Date;
  isAdmin: boolean;
  purchase: Purchase[];
}