import { DocumentType } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

export interface CommentService {
  create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>>;
  findByOfferId(offerId: string, limit?: number): Promise<DocumentType<CommentEntity>[]>;
  deleteByOfferId(offerId: string): Promise<number | null>;
  calculateAverageRating(offerId: string): Promise<number>;
  countByOfferId(offerId: string): Promise<number>;
}
