import { Databag } from '@/types';

export const getProxyIdxResponse = (databag: Databag) => {
  const { deviceEnrollment } = databag;
  if (!deviceEnrollment) {
    return;
  }

  return {
    deviceEnrollment: {
      type: 'object',
      value: { ...deviceEnrollment }
    }
  };
};
