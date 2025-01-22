import { IMailValidatorValue } from '../@types/api';
import { RedisService } from './redis';

export const prefix = 'mail:';
export const getMailValidator: (
  key: string,
) => Promise<IMailValidatorValue> = async key => {
  return (await RedisService.hGet(key)) as unknown as IMailValidatorValue;
};

export const getMailKeys: () => Promise<string[]> = async () => {
  return await RedisService.keys(`${prefix}*`);
};

export const getMailValues: () => Promise<IMailValidatorValue[]> = async () => {
  const keys = await getMailKeys();
  const values: IMailValidatorValue[] = [];
  for (let key of keys) {
    values.push(await getMailValidator(key));
  }
  return values;
};

export const setMailValidator: (
  key: string,
  value: IMailValidatorValue,
  ttl?: number,
) => Promise<void> = async (key, value, ttl) => {
  await RedisService.hSet(key, value, ttl);
};
