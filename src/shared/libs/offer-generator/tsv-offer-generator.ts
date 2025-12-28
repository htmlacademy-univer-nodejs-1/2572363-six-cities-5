import { OfferGenerator } from './offer-generator.interface.js';
import { MockServerData } from '../../../types/mock-server-data.type.js';
import { generateRandomValue, getRandomItem, getRandomItems } from '../../../shared/helpers/common.js';

export class TSVOfferGenerator implements OfferGenerator {
  constructor(private readonly mockData: MockServerData) {}

  public generate(): string {
    const title = getRandomItem(this.mockData.names);
    const description = getRandomItem(this.mockData.descriptions);
    const publishedDate = new Date().toISOString();
    const city = getRandomItem(this.mockData.cities);
    const previewImage = getRandomItem(this.mockData.previewImages);
    const images = JSON.stringify(getRandomItem(this.mockData.images));
    const isPremium = Math.random() > 0.6;
    const isFavorite = Math.random() > 0.8;
    const rating = generateRandomValue(1, 5, 1);
    const type = getRandomItem(this.mockData.types);
    const bedrooms = generateRandomValue(1, 5);
    const maxAdults = generateRandomValue(1, 10);
    const price = generateRandomValue(100, 100000);
    const goods = JSON.stringify(getRandomItems(this.mockData.goods));
    const user = getRandomItem(this.mockData.users);
    const commentsCount = generateRandomValue(0, 50);

    const cityCoordinates: Record<string, {latitude: number; longitude: number}> = {
      'Paris': { latitude: 48.85661, longitude: 2.351499 },
      'Cologne': { latitude: 50.938361, longitude: 6.959974 },
      'Brussels': { latitude: 50.846557, longitude: 4.351697 },
      'Amsterdam': { latitude: 52.370216, longitude: 4.895168 },
      'Hamburg': { latitude: 53.550341, longitude: 10.000654 },
      'Dusseldorf': { latitude: 51.225402, longitude: 6.776314 }
    };

    const coordinates = cityCoordinates[city] || cityCoordinates['Paris'];
    const { latitude, longitude } = coordinates;

    return [
      title, description, publishedDate, city, previewImage, images,
      isPremium, isFavorite, rating, type, bedrooms, maxAdults, price,
      goods, JSON.stringify(user), commentsCount, latitude, longitude
    ].join('\t');
  }
}
