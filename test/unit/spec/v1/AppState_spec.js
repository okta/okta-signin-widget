import { getSecurityImageUrl } from 'v1/models/AppState';

describe('AppState', () => {
  describe('getSecurityImageUrl', () => {
    it('should return the correct URL for a given base URL and username', () => {
      const baseUrl = 'https://example.com';
      const username = 'testuser';
      const expectedUrl = 'https://example.com/login/getimage?username=testuser';
      expect(getSecurityImageUrl(baseUrl, username)).toBe(expectedUrl);
    });

    it('should preserve single quote in username', () => {
      const baseUrl = 'https://example.com';
      // eslint-disable-next-line quotes
      const username = "abc'xyz@orgglj2ixjxl0g4.com";
      // eslint-disable-next-line quotes
      const expectedUrl = "https://example.com/login/getimage?username=abc'xyz%40orgglj2ixjxl0g4.com";
      expect(getSecurityImageUrl(baseUrl, username)).toBe(expectedUrl);
    });

    it('should encode special characters in the username', () => {
      const baseUrl = 'https://example.com';
      // eslint-disable-next-line quotes
      const username = "dL1Xs5KFeT!#$%&'*+-/=?^_`.{|}~MO3oLBzMHf@orgglj2ixjxl0g4.com";
      // eslint-disable-next-line quotes
      const expectedUrl = "https://example.com/login/getimage?username=dL1Xs5KFeT!%23%24%25%26'*%2B-%2F%3D%3F%5E_%60.%7B%7C%7D~MO3oLBzMHf%40orgglj2ixjxl0g4.com";
      expect(getSecurityImageUrl(baseUrl, username)).toBe(expectedUrl);
    });
  });
});