import { City } from '../../types/city.enum.js';
import { OfferType } from '../../types/offer-type.enum.js';
import { Goods } from '../../types/goods.enum.js';
import { CreateOfferDto } from '../../models/offer/dto/create-offer.dto.js';
import { CreateUserDto } from '../../models/user/dto/create-user.dto.js';

export function parseTSVLine(line: string): { userDto: CreateUserDto; offerDto: CreateOfferDto } {
  const [
    title,
    description,
    publishedDate,
    city,
    previewImage,
    imagesStr,
    isPremiumStr,
    ratingStr,
    type,
    bedroomsStr,
    maxAdultsStr,
    priceStr,
    goodsStr,
    userStr,
    commentsCountStr,
    latitudeStr,
    longitudeStr
  ] = line.split('\t');

  const userData = JSON.parse(userStr);
  const userDto: CreateUserDto = {
    name: userData.name,
    email: userData.email,
    password: 'defaultPassword',
    type: userData.type
  };

  if (userData.avatar) {
    userDto.avatar = userData.avatar;
  }

  const offerDto: CreateOfferDto = {
    title,
    description,
    publishedDate: new Date(publishedDate),
    city: city as City,
    previewImage,
    images: JSON.parse(imagesStr),
    isPremium: isPremiumStr.toLowerCase() === 'true',
    rating: parseFloat(ratingStr),
    type: type as OfferType,
    bedrooms: parseInt(bedroomsStr, 10),
    maxAdults: parseInt(maxAdultsStr, 10),
    price: parseInt(priceStr, 10),
    goods: JSON.parse(goodsStr) as Goods[],
    commentsCount: parseInt(commentsCountStr, 10),
    latitude: parseFloat(latitudeStr),
    longitude: parseFloat(longitudeStr)
  };

  return { userDto, offerDto };
}
