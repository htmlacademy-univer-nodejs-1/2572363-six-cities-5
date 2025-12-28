import typegoose, { getModelForClass, defaultClasses } from '@typegoose/typegoose';
import { createSHA256 } from '../../shared/helpers/common.js';

const { prop, modelOptions } = typegoose;

export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true,
  }
})
export class UserEntity extends defaultClasses.TimeStamps {
  @prop({ required: true, minlength: 1, maxlength: 15, default: ''})
  public name!: string;

  @prop({ unique: true, required: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, default: ''})
  public email!: string;

  @prop({ default: 'default-avatar.jpg'})
  public avatar?: string;

  @prop({ required: true, default: ''})
  private passwordHash?: string;

  @prop({ required: true, enum: ['ordinary', 'pro'], default: ''})
  public type!: 'ordinary' | 'pro';

  @prop({ required: false, default: [], ref: 'OfferEntity' })
  public favoriteOffers!: typegoose.Ref<typegoose.DocumentType<import('../offer/offer.entity.js').OfferEntity>>[];

  constructor(userData: { name: string; email: string; avatar?: string; type: 'ordinary' | 'pro' }) {
    super();

    this.name = userData.name;
    this.email = userData.email;
    this.avatar = userData.avatar;
    this.type = userData.type;
  }

  public setPassword(password: string, salt: string) {
    this.passwordHash = createSHA256(password, salt);
  }

  public getPassword() {
    return this.passwordHash;
  }

  public verifyPassword(password: string, salt: string) {
    const hash = createSHA256(password, salt);
    return hash === this.passwordHash;
  }
}

export const UserModel = getModelForClass(UserEntity);
