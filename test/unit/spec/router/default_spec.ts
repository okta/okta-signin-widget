import { routerClassFactory } from '../../../../src/router/default';
import V1Router from '../../../../src/v1/LoginRouter';
import V2Router from '../../../../src/v2/WidgetRouter';

describe('default router class factory', () => {

  describe('okta-hosted or non-OAuth config', () => {

    it('default: creates a V1 router', () => {
      const Router = routerClassFactory({});
      expect(Router).toBe(V1Router);
    });
  
    it('V1 stateToken: creates a V1 router', () => {
      const Router = routerClassFactory({
        stateToken: '00abc' // V1 tokens start with "00"
      });
      expect(Router).toBe(V1Router);
    });


    it('V2 stateToken: creates a V2 router', () => {
      const Router = routerClassFactory({
        stateToken: 'abc' // V2 tokens can be any string, not starting with "00"
      });
      expect(Router).toBe(V2Router);
    });
  });

  describe('OAuth config', () => {
    it('default: creates a V2 router', () => {
      const Router = routerClassFactory({
        clientId: 'abc'
      });
      expect(Router).toBe(V2Router);
    });
    it('with "useClassicEngine" option: creates a V1 router', () => {
      const Router = routerClassFactory({
        clientId: 'abc',
        useClassicEngine: true
      });
      expect(Router).toBe(V1Router);
    });
  });

});
