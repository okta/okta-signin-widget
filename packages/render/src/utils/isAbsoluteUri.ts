export function isAbsoluteUri(uri: string) {
  const pat = /^https?:\/\//i;
  return pat.test(uri);
}