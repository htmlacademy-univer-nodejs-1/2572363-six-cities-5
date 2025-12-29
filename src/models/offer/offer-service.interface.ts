import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';

interface CreateOfferData extends Omit<CreateOfferDto, 'author'> {
  author: string;
}

export interface OfferService {
  create(dto: CreateOfferData): Promise<DocumentType<OfferEntity>>;
  findById(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  find(limit: number, city?: string): Promise<DocumentType<OfferEntity>[]>;
  deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  updateById(offerId: string, dto: Partial<CreateOfferData>): Promise<DocumentType<OfferEntity> | null>;
  findPremiumByCity(city: string, limit?: number): Promise<DocumentType<OfferEntity>[]>;
  updateRating(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  incCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  exists(offerId: string): Promise<boolean>;
}
