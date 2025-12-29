import { Middleware } from '../../libs/middleware/middleware.interface.js';
import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { Config } from '../../core/config/config.interface.js';
import { RestSchema } from '../../core/config/rest.schema.js';
import { JWT_ALGORITHM } from '../../constants.js';

export class ParseTokenMiddleware implements Middleware {
  constructor(
    private readonly config: Config<RestSchema>
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next();
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      const jwtSecret = this.config.get('JWT_SECRET');
      const secretKey = new TextEncoder().encode(jwtSecret);

      const { payload } = await jose.jwtVerify(token, secretKey, {
        algorithms: [JWT_ALGORITHM]
      });

      req.tokenPayload = { ...payload } as any;
    } catch {
      return next();
    }

    next();
  }
}
