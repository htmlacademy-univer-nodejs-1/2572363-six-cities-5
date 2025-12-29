import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from './base-controller.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { CommentService } from '../../models/comment/comment-service.interface.js';
import { OfferService } from '../../models/offer/offer-service.interface.js';
import { CreateCommentDto } from '../../models/comment/dto/create-comment.dto.js';
import { fillDTO, transformEntityForResponse } from '../helpers/index.js';
import { CommentRdo } from '../rdo/comment.rdo.js';
import { ValidateObjectIdMiddleware } from '../middleware/validate-object-id.middleware.js';
import { ValidateDtoMiddleware } from '../middleware/validate-dto.middleware.js';
import { DocumentExistsMiddleware } from '../middleware/document-exists.middleware.js';
import { PrivateRouteMiddleware } from '../../lib/auth/private-route.middleware.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger);
    this.logger.info('Register routes for CommentController...');

    this.addRoute('/offers/:offerId/comments', 'get', this.index, [
      new ValidateObjectIdMiddleware('offerId'),
      new DocumentExistsMiddleware(this.offerService, 'offerId')
    ]);

    this.addRoute('/offers/:offerId/comments', 'post', this.create, [
      new PrivateRouteMiddleware(),
      new ValidateObjectIdMiddleware('offerId'),
      new ValidateDtoMiddleware(CreateCommentDto),
      new DocumentExistsMiddleware(this.offerService, 'offerId')
    ]);
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

    if (!req.tokenPayload) {
      throw new Error('User not authenticated');
    }

    const body = req.body as CreateCommentDto;
    const commentData = {
      text: body.text,
      rating: body.rating,
      userId: req.tokenPayload.id
    };

    const result = await this.commentService.create(commentData as any, offerId);

    await this.offerService.updateRating(offerId);

    const transformedResult = transformEntityForResponse(result);
    const responseData = fillDTO(CommentRdo, transformedResult);
    this.created(res, responseData);
  }
}
