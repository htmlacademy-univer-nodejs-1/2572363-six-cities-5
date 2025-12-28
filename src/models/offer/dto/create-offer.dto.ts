import { City } from '../../../types/city.enum.js';
import { OfferType } from '../../../types/offer-type.enum.js';
import { Goods } from '../../../types/goods.enum.js';

export class CreateOfferDto {
  public title!: string;
  public description!: string;
  public publishedDate!: Date;
  public city!: City;
  public previewImage!: string;
  public images!: string[];
  public isPremium!: boolean;
  public isFavorite!: boolean;
  public rating!: number;
  public type!: OfferType;
  public bedrooms!: number;
  public maxAdults!: number;
  public price!: number;
  public goods!: Goods[];
  public author!: string;
  public commentsCount!: number;
  public latitude!: number;
  public longitude!: number;
}
