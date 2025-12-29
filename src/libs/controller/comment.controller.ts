import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from './base-controller.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { CommentService } from '../../models/comment/comment-service.interface.js';
import { CreateCommentDto } from '../../models/comment/dto/create-comment.dto.js';
import { fillDTO, transformEntityForResponse } from '../helpers/index.js';
import { CommentRdo } from '../rdo/comment.rdo.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService,
  ) {
    super(logger);
    this.logger.info('Register routes for CommentController...');

    this.addRoute('/offers/:offerId/comments', 'get', this.index);
    this.addRoute('/offers/:offerId/comments', 'post', this.create);
  }

  public async index(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;
    const comments = await this.commentService.findByOfferId(offerId, 50);

    const responseData = comments.map((comment) => {
      const transformedComment = transformEntityForResponse(comment);
      return fillDTO(CommentRdo, transformedComment);
    });
    this.ok(res, responseData);
  }

  public async create(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;
    const body = req.body as CreateCommentDto;

    const result = await this.commentService.create({
      ...body,
      offerId,
      userId: 'dummy-user-id-for-now'
    });

    const transformedResult = transformEntityForResponse(result);
    const responseData = fillDTO(CommentRdo, transformedResult);
    this.created(res, responseData);
  }
}
