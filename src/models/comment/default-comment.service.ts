import { inject, injectable } from 'inversify';
import { DocumentType } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CommentService } from './comment-service.interface.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { CommentModel } from './comment.entity.js';
import { Types } from 'mongoose';

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger
  ) {}

  public async create(dto: CreateCommentDto, offerId: string): Promise<DocumentType<CommentEntity>> {
    try {
      const result = await CommentModel.create({
        text: dto.text,
        rating: dto.rating,
        offer: offerId,
        author: dto.userId
      });
      this.logger.info(`New comment created for offer: ${offerId}`);
      return result.populate('author');
    } catch (error) {
      this.logger.error(`Comment creation failed for offer: ${offerId}`, error as Error);
      throw error;
    }
  }

  public async findByOfferId(offerId: string, limit = 50): Promise<DocumentType<CommentEntity>[]> {
    try {
      const query = CommentModel.find();
      query.where('offer').equals(offerId);
      query.populate('author');
      query.sort({ createdAt: -1 });
      query.limit(limit);

      return await query.exec();
    } catch (error) {
      this.logger.error(`Failed to find comments for offer: ${offerId}`, error as Error);
      return [];
    }
  }

  public async deleteByOfferId(offerId: string): Promise<number | null> {
    try {
      const query = CommentModel.deleteMany();
      query.where('offer').equals(offerId);

      const result = await query.exec();
      this.logger.info(`Deleted ${result.deletedCount} comments for offer: ${offerId}`);
      return result.deletedCount;
    } catch (error) {
      this.logger.error(`Failed to delete comments for offer: ${offerId}`, error as Error);
      return null;
    }
  }

  public async calculateAverageRating(offerId: string): Promise<number> {
    try {
      const result = await CommentModel.aggregate([
        { $match: { offer: new Types.ObjectId(offerId) } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } }
      ]).exec();

      return result.length > 0 ? parseFloat(result[0].averageRating.toFixed(1)) : 0;
    } catch (error) {
      this.logger.error(`Failed to calculate average rating for offer: ${offerId}`, error as Error);
      return 0;
    }
  }

  public async countByOfferId(offerId: string): Promise<number> {
    try {
      const query = CommentModel.countDocuments();
      query.where('offer').equals(offerId);

      return await query.exec();
    } catch (error) {
      this.logger.error(`Failed to count comments for offer: ${offerId}`, error as Error);
      return 0;
    }
  }
}
