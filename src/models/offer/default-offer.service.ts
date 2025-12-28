import { inject, injectable } from 'inversify';
import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { OfferService } from './offer-service.interface.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { OfferModel } from './offer.entity.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger
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
      return await OfferModel.findById(offerId).exec();
    } catch (error) {
      this.logger.error(`Failed to find offer: ${offerId}`, error as Error);
      return null;
    }
  }

  public async find(limit: number): Promise<DocumentType<OfferEntity>[]> {
    try {
      return await OfferModel.find().limit(limit).exec();
    } catch (error) {
      this.logger.error(`Failed to find offers with limit: ${limit}`, error as Error);
      return [];
    }
  }
}
