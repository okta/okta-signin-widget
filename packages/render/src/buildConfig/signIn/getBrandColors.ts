import { Databag } from '@/types';

export const getBrandColors = ({
  brandPrimaryColor,
  brandPrimaryColorContrast,
  brandSecondaryColor,
  brandSecondaryColorContrast,
  useSiwGen3
}: Databag) => {
  if (!useSiwGen3) {
    return;
  }

  return {
    primaryColor: brandPrimaryColor,
    primaryColorContrast: brandPrimaryColorContrast,
    secondaryColor: brandSecondaryColor,
    secondaryColorContrast: brandSecondaryColorContrast
  };
};
