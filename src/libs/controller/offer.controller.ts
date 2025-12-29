import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from './base-controller.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { OfferService } from '../../models/offer/offer-service.interface.js';
import { CommentService } from '../../models/comment/comment-service.interface.js';
import { UserService } from '../../models/user/user-service.interface.js';
import { CreateOfferDto } from '../../models/offer/dto/create-offer.dto.js';
import { UpdateOfferDto } from '../../models/offer/dto/update-offer.dto.js';
import { fillDTO, transformEntityForResponse } from '../helpers/index.js';
import { OfferShortRdo } from '../rdo/offer-short.rdo.js';
import { OfferFullRdo } from '../rdo/offer-full.rdo.js';
import { ValidateObjectIdMiddleware } from '../middleware/validate-object-id.middleware.js';
import { ValidateDtoMiddleware } from '../middleware/validate-dto.middleware.js';
import { DocumentExistsMiddleware } from '../middleware/document-exists.middleware.js';
import { CommentRdo } from '../rdo/comment.rdo.js';
import { PrivateRouteMiddleware } from '../../lib/auth/private-route.middleware.js';
import { HttpError } from '../../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.UserService) private readonly userService: UserService,
  ) {
    super(logger);
    this.logger.info('Register routes for OfferController...');

    this.addRoute('/offers', 'get', this.index);
    this.addRoute('/offers', 'post', this.create, [
      new PrivateRouteMiddleware(),
      new ValidateDtoMiddleware(CreateOfferDto)
    ]);

    this.addRoute('/offers/:offerId', 'get', this.show, [
      new ValidateObjectIdMiddleware('offerId'),
      new DocumentExistsMiddleware(this.offerService, 'offerId')
    ]);

    this.addRoute('/offers/:offerId', 'put', this.update, [
      new PrivateRouteMiddleware(),
      new ValidateObjectIdMiddleware('offerId'),
      new ValidateDtoMiddleware(UpdateOfferDto),
      new DocumentExistsMiddleware(this.offerService, 'offerId')
    ]);

    this.addRoute('/offers/:offerId', 'delete', this.delete, [
      new PrivateRouteMiddleware(),
      new ValidateObjectIdMiddleware('offerId'),
      new DocumentExistsMiddleware(this.offerService, 'offerId')
    ]);

    this.addRoute('/offers/:offerId/comments', 'get', this.getComments, [
      new ValidateObjectIdMiddleware('offerId'),
      new DocumentExistsMiddleware(this.offerService, 'offerId')
    ]);

    this.addRoute('/offers/premium_by_city/:city', 'get', this.getPremiumByCity);
    this.addRoute('/favorites', 'get', this.getFavorites, [
      new PrivateRouteMiddleware()
    ]);
    this.addRoute('/favorites/:offerId', 'post', this.addFavorite, [
      new PrivateRouteMiddleware(),
      new ValidateObjectIdMiddleware('offerId'),
      new DocumentExistsMiddleware(this.offerService, 'offerId')
    ]);
    this.addRoute('/favorites/:offerId', 'delete', this.removeFavorite, [
      new PrivateRouteMiddleware(),
      new ValidateObjectIdMiddleware('offerId'),
      new DocumentExistsMiddleware(this.offerService, 'offerId')
    ]);
  }

  public async index(
    req: Request,
    res: Response,
  ): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 60;
    const city = req.query.city as string;
    const userId = req.tokenPayload?.id;

    const offers = await this.offerService.find(limit, city, userId);

    const offerResponse = offers.map((offer) => {
      const transformedOffer = transformEntityForResponse(offer);
      return fillDTO(OfferShortRdo, transformedOffer);
    });
    this.ok(res, offerResponse);
  }

  public async create(
    req: Request,
    res: Response,
  ): Promise<void> {
    const body = req.body as CreateOfferDto;

    if (!req.tokenPayload) {
      throw new Error('User not authenticated');
    }

    const offerData: CreateOfferDto = {
      ...body,
      author: req.tokenPayload.id
    };

    const result = await this.offerService.create(offerData);

    const transformedResult = transformEntityForResponse(result);
    const responseData = fillDTO(OfferFullRdo, transformedResult);
    this.created(res, responseData);
  }

  public async show(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;
    const userId = req.tokenPayload?.id;

    const offer = await this.offerService.findById(offerId);

    if (offer && userId) {
      const isFavorite = await this.userService.isOfferInFavorites(userId, offerId);
      (offer as any).isFavorite = isFavorite;
    } else if (offer) {
      (offer as any).isFavorite = false;
    }

    const transformedOffer = transformEntityForResponse(offer);
    const responseData = fillDTO(OfferFullRdo, transformedOffer);
    this.ok(res, responseData);
  }

  public async update(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;
    const body = req.body as UpdateOfferDto;

    if (!req.tokenPayload) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        'OfferController'
      );
    }

    const authorId = offer.author instanceof Types.ObjectId
      ? offer.author.toString()
      : offer.author._id?.toString() || offer.author.toString();

    if (authorId !== req.tokenPayload.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You can only edit your own offers',
        'OfferController'
      );
    }

    const updatedOffer = await this.offerService.updateById(offerId, body);

    const transformedOffer = transformEntityForResponse(updatedOffer);
    const responseData = fillDTO(OfferFullRdo, transformedOffer);
    this.ok(res, responseData);
  }

  public async delete(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;

    if (!req.tokenPayload) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        'OfferController'
      );
    }

    const authorId = offer.author instanceof Types.ObjectId
      ? offer.author.toString()
      : offer.author._id?.toString() || offer.author.toString();

    if (authorId !== req.tokenPayload.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You can only delete your own offers',
        'OfferController'
      );
    }

    await this.offerService.deleteById(offerId);

    this.noContent(res);
  }

  public async getComments(
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

  public async getPremiumByCity(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { city } = req.params;
    const userId = req.tokenPayload?.id;

    const offers = await this.offerService.findPremiumByCity(city, 3, userId);

    const responseData = offers.map((offer) => {
      const transformedOffer = transformEntityForResponse(offer);
      return fillDTO(OfferShortRdo, transformedOffer);
    });
    this.ok(res, responseData);
  }

  public async getFavorites(
    req: Request,
    res: Response,
  ): Promise<void> {
    if (!req.tokenPayload) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    const offers = await this.offerService.findFavorites(req.tokenPayload.id);

    const responseData = offers.map((offer) => {
      const transformedOffer = transformEntityForResponse(offer);
      return fillDTO(OfferShortRdo, transformedOffer);
    });
    this.ok(res, responseData);
  }

  public async addFavorite(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;

    if (!req.tokenPayload) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    const updatedUser = await this.userService.addToFavorites(req.tokenPayload.id, offerId);

    if (!updatedUser) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `User not found`,
        'OfferController'
      );
    }

    this.ok(res, {
      message: `Added offer ${offerId} to favorites`,
      offerId
    });
  }

  public async removeFavorite(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;

    if (!req.tokenPayload) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    const updatedUser = await this.userService.removeFromFavorites(req.tokenPayload.id, offerId);

    if (!updatedUser) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `User not found`,
        'OfferController'
      );
    }

    this.ok(res, {
      message: `Removed offer ${offerId} from favorites`,
      offerId
    });
  }
}
