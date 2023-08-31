import { compile, serialize, stringify } from 'stylis';

export const ensmallen = (css: string) => {
  return serialize(compile(css), stringify);
};
