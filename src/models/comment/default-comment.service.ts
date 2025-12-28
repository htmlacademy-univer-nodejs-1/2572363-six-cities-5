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

  public async create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>> {
    try {
      const result = await CommentModel.create({
        ...dto,
        offer: new Types.ObjectId(dto.offerId),
        author: new Types.ObjectId(dto.userId)
      });
      this.logger.info(`New comment created for offer: ${dto.offerId}`);
      return result;
    } catch (error) {
      this.logger.error(`Comment creation failed for offer: ${dto.offerId}`, error as Error);
      throw error;
    }
  }

  public async findByOfferId(offerId: string, limit = 50): Promise<DocumentType<CommentEntity>[]> {
    try {
      return await CommentModel
        .find({offerId})
        .populate('author')
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      this.logger.error(`Failed to find comments for offer: ${offerId}`, error as Error);
      return [];
    }
  }

  public async deleteByOfferId(offerId: string): Promise<number | null> {
    try {
      const result = await CommentModel.deleteMany({offerId}).exec();
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
      return await CommentModel.countDocuments({ offerId }).exec();
    } catch (error) {
      this.logger.error(`Failed to count comments for offer: ${offerId}`, error as Error);
      return 0;
    }
  }
}
