import { ClassConstructor, plainToInstance } from 'class-transformer';

export function fillDTO<T, V>(someDto: ClassConstructor<T>, plainObject: V) {
  return plainToInstance(someDto, plainObject, {
    excludeExtraneousValues: true,
  });
}

export function transformEntity<T>(entity: T & { _id?: any }): T & { id?: string } {
  if (!entity || typeof entity !== 'object') {
    return entity as T & { id?: string };
  }

  const result = { ...entity } as T & { id?: string };

  if ('_id' in entity && entity._id) {
    if (typeof entity._id === 'object' && 'toString' in entity._id) {
      result.id = entity._id.toString();
    } else {
      result.id = entity._id as string;
    }
    delete (result as any)._id;
  }

  if ('__v' in result) {
    delete (result as any).__v;
  }

  return result;
}

export function transformEntityForResponse<T>(entity: T): T {
  if (!entity || typeof entity !== 'object') {
    return entity;
  }

  const hasToObject = entity &&
    typeof entity === 'object' &&
    'toObject' in entity &&
    typeof (entity as any).toObject === 'function';

  const plainObject = hasToObject
    ? (entity as any).toObject()
    : entity;

  const result = transformEntity(plainObject);

  if ('isFavorite' in entity) {
    (result as any).isFavorite = (entity as any).isFavorite;
  }

  return result;
}
