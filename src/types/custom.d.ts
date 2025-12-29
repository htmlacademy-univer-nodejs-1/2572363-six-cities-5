import { UserType } from './user.type.js';

declare module 'express-serve-static-core' {
  export interface Request {
    tokenPayload?: {
      email: string;
      name: string;
      id: string;
      type: UserType['type'];
    };
  }
}
