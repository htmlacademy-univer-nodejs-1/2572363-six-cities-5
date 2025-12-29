import { City } from '../../../types/city.enum.js';
import { OfferType } from '../../../types/offer-type.enum.js';
import { Goods } from '../../../types/goods.enum.js';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  @MaxLength(100, { message: 'Title must be at most 100 characters long' })
  public title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(1024, { message: 'Description must be at most 1024 characters long' })
  public description?: string;

  @IsOptional()
  @IsEnum(City)
  public city?: City;

  @IsOptional()
  @IsString()
  public previewImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public images?: string[];

  @IsOptional()
  @IsBoolean()
  public isPremium?: boolean;

  @IsOptional()
  @IsEnum(OfferType)
  public type?: OfferType;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Bedrooms must be at least 1' })
  @Max(8, { message: 'Bedrooms must be at most 8' })
  public bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Max adults must be at least 1' })
  @Max(10, { message: 'Max adults must be at most 10' })
  public maxAdults?: number;

  @IsOptional()
  @IsInt()
  @Min(100, { message: 'Price must be at least 100' })
  @Max(100000, { message: 'Price must be at most 100000' })
  public price?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(Goods, { each: true })
  public goods?: Goods[];
}
