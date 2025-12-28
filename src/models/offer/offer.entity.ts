import typegoose, { getModelForClass, defaultClasses } from '@typegoose/typegoose';
import { City } from '../../types/city.enum.js';
import { OfferType } from '../../types/offer-type.enum.js';
import { Goods } from '../../types/goods.enum.js';

const { prop, modelOptions } = typegoose;

export interface OfferEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'offers',
    timestamps: true,
  }
})
export class OfferEntity extends defaultClasses.TimeStamps {
  @prop({ required: true, minlength: 10, maxlength: 100 })
  public title!: string;

  @prop({ required: true, minlength: 20, maxlength: 1024 })
  public description!: string;

  @prop({ required: true })
  public publishedDate!: Date;

  @prop({ required: true, enum: City })
  public city!: City;

  @prop({ required: true })
  public previewImage!: string;

  @prop({ required: true, type: () => [String] })
  public images!: string[];

  @prop({ required: true, default: false })
  public isPremium!: boolean;

  @prop({ required: true, min: 1, max: 5 })
  public rating!: number;

  @prop({ required: true, enum: OfferType })
  public type!: OfferType;

  @prop({ required: true, min: 1, max: 8 })
  public bedrooms!: number;

  @prop({ required: true, min: 1, max: 10 })
  public maxAdults!: number;

  @prop({ required: true, min: 100, max: 100000 })
  public price!: number;

  @prop({ required: true, type: () => [String], enum: Goods })
  public goods!: Goods[];

  @prop({ required: true, ref: 'UserEntity' })
  public author!: typegoose.Ref<typegoose.DocumentType<import('../user/user.entity.js').UserEntity>>;

  @prop({ required: true, default: 0 })
  public commentsCount!: number;

  @prop({ required: true })
  public latitude!: number;

  @prop({ required: true })
  public longitude!: number;
}

export const OfferModel = getModelForClass(OfferEntity);
