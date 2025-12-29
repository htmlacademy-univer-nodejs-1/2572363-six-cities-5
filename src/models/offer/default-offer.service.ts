import { inject, injectable } from 'inversify';
import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { OfferService } from './offer-service.interface.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { OfferModel } from './offer.entity.js';
import { City } from '../../types/city.enum.js';
import { CommentService } from '../comment/comment-service.interface.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    try {
      const result = await OfferModel.create(dto);
      this.logger.info(`Created offer: ${dto.title}`);
      return result;
    } catch (error) {
      this.logger.error(`Offer creation failed: ${dto.title}`, error as Error);
      throw error;
    }
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    try {
      return await OfferModel
        .findById(offerId)
        .populate('author')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to find offer: ${offerId}`, error as Error);
      return null;
    }
  }

  public async find(limit: number, city?: string): Promise<DocumentType<OfferEntity>[]> {
    try {
      const query = city ? { city: city as City } : {};
      return await OfferModel
        .find(query)
        .limit(limit)
        .populate('author')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to find offers with limit: ${limit}`, error as Error);
      return [];
    }
  }

  public async deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    try {
      const result = await OfferModel.findByIdAndDelete(offerId).exec();
      if (result) {
        await this.commentService.deleteByOfferId(offerId);
      }
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete offer: ${offerId}`, error as Error);
      return null;
    }
  }

  public async updateById(offerId: string, dto: Partial<CreateOfferDto>): Promise<DocumentType<OfferEntity> | null> {
    try {
      return await OfferModel
        .findByIdAndUpdate(offerId, dto, { new: true })
        .populate('author')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to update offer: ${offerId}`, error as Error);
      return null;
    }
  }

  public async findPremiumByCity(city: string, limit = 3): Promise<DocumentType<OfferEntity>[]> {
    try {
      return await OfferModel
        .find({
          city: city as City,
          isPremium: true
        })
        .limit(limit)
        .populate('author')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to find premium offers for city: ${city}`, error as Error);
      return [];
    }
  }

  public async updateRating(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    try {
      const averageRating = await this.commentService.calculateAverageRating(offerId);
      const commentsCount = await this.commentService.countByOfferId(offerId);

      return await OfferModel
        .findByIdAndUpdate(
          offerId,
          {
            rating: averageRating,
            commentsCount
          },
          { new: true }
        )
        .exec();
    } catch (error) {
      this.logger.error(`Failed to update rating for offer: ${offerId}`, error as Error);
      return null;
    }
  }

  public async incCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    try {
      const commentsCount = await this.commentService.countByOfferId(offerId);

      return await OfferModel
        .findByIdAndUpdate(
          offerId,
          { commentsCount },
          { new: true }
        )
        .exec();
    } catch (error) {
      this.logger.error(`Failed to increment comment count for offer: ${offerId}`, error as Error);
      return null;
    }
  }

  public async exists(offerId: string): Promise<boolean> {
    try {
      const count = await OfferModel.countDocuments({ _id: offerId }).exec();
      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check if offer exists: ${offerId}`, error as Error);
      return false;
    }
  }
}
