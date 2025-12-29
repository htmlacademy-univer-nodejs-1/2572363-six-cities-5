import { HttpError } from './http-error.js';

export class UserNotFoundException extends HttpError {
  constructor(email: string) {
    super(401, `User with email ${email} not found`, 'UserNotFoundException');
  }
}

export class UserPasswordIncorrectException extends HttpError {
  constructor() {
    super(401, 'Incorrect user name or password', 'UserPasswordIncorrectException');
  }
}
