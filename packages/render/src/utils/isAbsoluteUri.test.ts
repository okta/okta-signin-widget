import { isAbsoluteUri } from './isAbsoluteUri';

describe('isAbsoluteUri', () => {
  it('returns true if uri starts with http', () => {
    const uri = 'http://mockuri.com';
    expect(isAbsoluteUri(uri)).toBe(true);
  });

  it('returns true if uri starts with https', () => {
    const uri = 'https://mockuri.com';
    expect(isAbsoluteUri(uri)).toBe(true);
  });

  it('returns false if uri starts with neither https nor http', () => {
    const uri = 'file://mockuri.com';
    expect(isAbsoluteUri(uri)).toBe(false);
  });

  it('returns false with relative uri', () => {
    const uri = '/relative-path';
    expect(isAbsoluteUri(uri)).toBe(false);
  });
});
