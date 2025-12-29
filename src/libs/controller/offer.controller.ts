import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from './base-controller.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { OfferService } from '../../models/offer/offer-service.interface.js';
import { CreateOfferDto } from '../../models/offer/dto/create-offer.dto.js';
import { UpdateOfferDto } from '../../models/offer/dto/update-offer.dto.js';
import { HttpError } from '../../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { fillDTO, transformEntityForResponse } from '../helpers/index.js';
import { OfferShortRdo } from '../rdo/offer-short.rdo.js';
import { OfferFullRdo } from '../rdo/offer-full.rdo.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger);
    this.logger.info('Register routes for OfferController...');

    this.addRoute('/offers', 'get', this.index);
    this.addRoute('/offers', 'post', this.create);
    this.addRoute('/offers/:offerId', 'get', this.show);
    this.addRoute('/offers/:offerId', 'put', this.update);
    this.addRoute('/offers/:offerId', 'delete', this.delete);
    this.addRoute('/offers/premium_by_city/:city', 'get', this.getPremiumByCity);
    this.addRoute('/favorites', 'get', this.getFavorites);
    this.addRoute('/favorites/:offerId', 'post', this.addFavorite);
    this.addRoute('/favorites/:offerId', 'delete', this.removeFavorite);
  }

  public async index(
    req: Request,
    res: Response,
  ): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 60;
    const city = req.query.city as string;
    const offers = await this.offerService.find(limit, city);

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
    const result = await this.offerService.create(body);

    const transformedResult = transformEntityForResponse(result);
    const responseData = fillDTO(OfferFullRdo, transformedResult);
    this.created(res, responseData);
  }

  public async show(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;
    const offer = await this.offerService.findById(offerId);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id «${offerId}» not found`,
        'OfferController'
      );
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
    const updatedOffer = await this.offerService.updateById(offerId, body);

    if (!updatedOffer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id «${offerId}» not found`,
        'OfferController'
      );
    }

    const transformedOffer = transformEntityForResponse(updatedOffer);
    const responseData = fillDTO(OfferFullRdo, transformedOffer);
    this.ok(res, responseData);
  }

  public async delete(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;
    const deletedOffer = await this.offerService.deleteById(offerId);

    if (!deletedOffer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id «${offerId}» not found`,
        'OfferController'
      );
    }

    this.noContent(res);
  }

  public async getPremiumByCity(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { city } = req.params;
    const offers = await this.offerService.findPremiumByCity(city, 3);

    const responseData = offers.map((offer) => {
      const transformedOffer = transformEntityForResponse(offer);
      return fillDTO(OfferShortRdo, transformedOffer);
    });
    this.ok(res, responseData);
  }

  public async getFavorites(
    _req: Request,
    res: Response,
  ): Promise<void> {
    this.unauthorized(res, 'Not implemented yet');
  }

  public async addFavorite(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;

    this.ok(res, {
      message: `Added offer ${offerId} to favorites (not implemented)`,
      offerId
    });
  }

  public async removeFavorite(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { offerId } = req.params;

    this.ok(res, {
      message: `Removed offer ${offerId} from favorites (not implemented)`,
      offerId
    });
  }
}
