import { DocumentType } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

interface CreateCommentData extends Omit<CreateCommentDto, 'userId'> {
  userId: string;
}

export interface CommentService {
  create(dto: CreateCommentData, offerId: string): Promise<DocumentType<CommentEntity>>;
  findByOfferId(offerId: string, limit?: number): Promise<DocumentType<CommentEntity>[]>;
  deleteByOfferId(offerId: string): Promise<number | null>;
  calculateAverageRating(offerId: string): Promise<number>;
  countByOfferId(offerId: string): Promise<number>;
}
