import { User } from '../shared/schema';

declare global {
  namespace Express {
    interface User {
      id: number;
    }
  }
}