import getAuthClient from 'widget/getAuthClient';
import config from 'config/config.json';


describe('widget/getAuthClient', () => {
  it('creates auth client if one is not passed through widget options', () => {
    const authClient = getAuthClient({authParams: { issuer: 'https://foo.bar'}});
    expect(authClient.options.issuer).toEqual('https://foo.bar');
  });

  it('returns auth client passed via widget options', () => {
    const mockAuthClient = {
      options: {
        issuer: 'https://options.foo.bar',
      },
      _oktaUserAgent: {
        addEnvironment: jest.fn()
      }
    };

    const authClient = getAuthClient({
      authParams: { issuer: 'https://foo.bar'},
      authClient: mockAuthClient
    });
    expect(authClient.options.issuer).toEqual('https://options.foo.bar');
  });

  it('updates auth client\'s user agent with SIW version', () => {
    const mockAuthClient = {
      _oktaUserAgent: {
        addEnvironment: jest.fn()
      }
    };

    getAuthClient({
      authClient: mockAuthClient
    });
    expect(mockAuthClient._oktaUserAgent.addEnvironment).toHaveBeenCalledWith(`okta-signin-widget-${config.version}`);
  });

  it('throws an error when provided auth client doesn\'t have UA helper', () => {
    expect(() => getAuthClient({ authClient: {} })).toThrowError('The passed in authClient should be version 5.4.0 or above.');
  });
});
