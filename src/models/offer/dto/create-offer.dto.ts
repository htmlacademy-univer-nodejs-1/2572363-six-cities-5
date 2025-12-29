import { City } from '../../../types/city.enum.js';
import { OfferType } from '../../../types/offer-type.enum.js';
import { Goods } from '../../../types/goods.enum.js';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsMongoId, IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';


export class CreateOfferDto {
  @IsString()
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  @MaxLength(100, { message: 'Title must be at most 100 characters long' })
  public title!: string;

  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(1024, { message: 'Description must be at most 1024 characters long' })
  public description!: string;

  @IsDateString()
  public publishedDate!: Date;

  @IsEnum(City)
  public city!: City;

  @IsString()
  public previewImage!: string;

  @IsArray()
  @IsString({ each: true })
  public images!: string[];

  @IsBoolean()
  public isPremium!: boolean;

  @IsNumber()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  public rating!: number;

  @IsEnum(OfferType)
  public type!: OfferType;

  @IsInt()
  @Min(1, { message: 'Bedrooms must be at least 1' })
  @Max(8, { message: 'Bedrooms must be at most 8' })
  public bedrooms!: number;

  @IsInt()
  @Min(1, { message: 'Max adults must be at least 1' })
  @Max(10, { message: 'Max adults must be at most 10' })
  public maxAdults!: number;

  @IsInt()
  @Min(100, { message: 'Price must be at least 100' })
  @Max(100000, { message: 'Price must be at most 100000' })
  public price!: number;

  @IsArray()
  @IsEnum(Goods, { each: true })
  public goods!: Goods[];

  @IsMongoId()
  public author!: string;

  @IsInt()
  @Min(0, { message: 'Comments count cannot be negative' })
  public commentsCount!: number;

  @IsNumber()
  public latitude!: number;

  @IsNumber()
  public longitude!: number;
}
