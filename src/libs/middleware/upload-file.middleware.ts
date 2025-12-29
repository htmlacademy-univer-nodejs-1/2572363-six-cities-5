import { Middleware } from './middleware.interface.js';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { extension } from 'mime-types';
import { nanoid } from 'nanoid';

export class UploadFileMiddleware implements Middleware {
  constructor(
    private uploadDirectory: string,
    private fieldName: string
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const storage = multer.diskStorage({
      destination: this.uploadDirectory,
      filename: (_req, file, callback) => {
        const fileExt = extension(file.mimetype);
        const filename = nanoid();
        callback(null, `${filename}.${fileExt}`);
      }
    });

    const uploadSingleFileMiddleware = multer({ storage }).single(this.fieldName);

    uploadSingleFileMiddleware(req, _res, next);
  }
}
