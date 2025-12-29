import { Expose } from 'class-transformer';
import { UserRdo } from './user.rdo.js';

export class CommentRdo {
  @Expose()
  public id!: string;

  @Expose()
  public text!: string;

  @Expose()
  public rating!: number;

  @Expose()
  public author!: UserRdo;

  @Expose()
  public createdAt!: string;
}
