import { areCookiesEnabled } from './areCookiesEnabled';

describe('areCookiesEnabled', () => {

  it('should return true when cookies are enabled', () => {
    jest.spyOn(document, 'cookie', 'get').mockReturnValue('testcookie=1; SameSite=Lax');
    const result = areCookiesEnabled();
    expect(result).toBe(true);
  });

  it('should return false when cookies are not enabled', () => {
    jest.spyOn(document, 'cookie', 'get').mockReturnValue('');
    const result = areCookiesEnabled();
    expect(result).toBe(false);
  });

});