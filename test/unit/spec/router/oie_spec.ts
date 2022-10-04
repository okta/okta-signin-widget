import { routerClassFactory } from '../../../../src/router/oie';
import V2Router from '../../../../src/v2/WidgetRouter';
import { ConfigError } from '../../../../src/util/Errors';

describe('oie router class factory', () => {

  describe('okta-hosted or non-OAuth config', () => {

    it('default: creates a V2 router', () => {
      const Router = routerClassFactory({});
      expect(Router).toBe(V2Router);
    });
  
    it('V2 stateToken: creates a V2 router', () => {
      const Router = routerClassFactory({
        stateToken: 'abc' // V2 tokens can be any string, not starting with "00"
      });
      expect(Router).toBe(V2Router);
    });

    it('V1 stateToken: throws an error', () => {
      const expectedError = new ConfigError('This version of the Sign-in Widget does not support Classic Engine');
      const fn = () => {
        return routerClassFactory({
          stateToken: '00abc' // V1 tokens start with "00"
        });
      };
      expect(fn).toThrow(expectedError);
    });
  });

  describe('OAuth config', () => {
    it('default: creates a V2 router', () => {
      const Router = routerClassFactory({
        clientId: 'abc'
      });
      expect(Router).toBe(V2Router);
    });
    it('"useClassicEngine" option: ignored', () => {
      const Router = routerClassFactory({
        clientId: 'abc',
        useClassicEngine: true
      });
      expect(Router).toBe(V2Router);
    });
  });

});
