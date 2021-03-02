import buildRenderOptions from 'widget/buildRenderOptions';

describe('widget/buildRenderOptions', () => {

  function callBuildRenderOptions () {
    return buildRenderOptions.apply(null, arguments);
  }

  describe('general behavior', () => {
    it('does not modify widgetOptions or local options objects', () => {
      const scopes = ['a', 'b'];
      const state = 'foo';
      const widgetOptions = {
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          state: 'widget-state',
          scopes: ['widget', 'scopes']
        }
      };
      const localOptions = {
        scopes,
        state
      };
      expect(buildRenderOptions(widgetOptions, localOptions)).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          scopes,
          state
        }
      });
      expect(widgetOptions).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          state: 'widget-state',
          scopes: ['widget', 'scopes']
        }
      });
      expect(localOptions).toEqual({
        scopes,
        state
      });
    });
    it('2nd parameter, `options`, is optional', () => {
      expect(buildRenderOptions({ el: 'x', clientId: 'x', redirectUri: 'x' })).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {}
      });
    });
  
    it('ignores unknown widget options', () => {
      expect(buildRenderOptions({ el: 'x', clientId: 'x', redirectUri: 'x', unknown: 'foo' })).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {}
      });
    });
  
    it('ignores unknown local options', () => {
      expect(buildRenderOptions({ el: 'x', clientId: 'x', redirectUri: 'x' }, { unknown: 'foo' })).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {}
      });
    });
  });

  describe('option: `el`', () => {
    it('is required and throws if not provided', () => {
      expect(callBuildRenderOptions).toThrowError('"el" is required');
    });
    it('can be specified in widgetOptions', () => {
      const result = buildRenderOptions({ el: 'foo', clientId: 'x', redirectUri: 'x' });
      expect(result.el).toBe('foo');
    });
    it('can be overridden by local options', () => {
      const result = buildRenderOptions({ el: 'foo', clientId: 'x', redirectUri: 'x' }, { el: 'bar' });
      expect(result.el).toBe('bar');
    });
    it('can be specified only in local options', () => {
      const result = buildRenderOptions({ clientId: 'x', redirectUri: 'x' }, { el: 'bar' });
      expect(result.el).toBe('bar');
    });
  });

  describe('option: `clientId`', () => {
    it('is required and throws if not provided', () => {
      expect(callBuildRenderOptions.bind(null, { el: 'x' })).toThrowError('"clientId" is required');
    });
    it('can be specified in widgetOptions', () => {
      const result = buildRenderOptions({ el: 'x', clientId: 'foo', redirectUri: 'x' });
      expect(result.clientId).toBe('foo');
    });
    it('can be overridden by local options', () => {
      const result = buildRenderOptions({ el: 'x', clientId: 'foo', redirectUri: 'x' }, { clientId: 'bar' });
      expect(result.clientId).toBe('bar');
    });
    it('can be specified only in local options', () => {
      const result = buildRenderOptions({ el: 'x', redirectUri: 'x' }, { clientId: 'bar' });
      expect(result.clientId).toBe('bar');
    });
  });

  describe('option `redirectUri`:', () => {
    it('is required and throws if not provided', () => {
      expect(callBuildRenderOptions.bind(null, { el: 'x', clientId: 'x' })).toThrowError('"redirectUri" is required');
    });
    it('can be specified in widgetOptions', () => {
      const result = buildRenderOptions({ el: 'x', clientId: 'x', redirectUri: 'foo' });
      expect(result.redirectUri).toBe('foo');
    });
    it('can be overridden by local options', () => {
      const result = buildRenderOptions({ el: 'x', clientId: 'x', redirectUri: 'foo' }, { redirectUri: 'bar' });
      expect(result.redirectUri).toBe('bar');
    });
    it('can be specified only in local options', () => {
      const result = buildRenderOptions({ el: 'x', clientId: 'x' }, { redirectUri: 'bar' });
      expect(result.redirectUri).toBe('bar');
    });
  });

  describe('authParams', () => {
    it('will use authParams from widgetOptions', () => {
      const scopes = ['a', 'b'];
      const state = 'foo';
      const widgetOptions = {
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          state,
          scopes
        }
      };
      expect(buildRenderOptions(widgetOptions)).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          scopes,
          state
        }
      });
    });

    it('plucks OAuth params from `options` and puts them in `authParams` object', () => {
      const scopes = ['a', 'b'];
      const state = 'foo';
      expect(buildRenderOptions({ el: 'x', clientId: 'x', redirectUri: 'x' }, { scopes, state })).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          scopes,
          state
        }
      });
    });

    it('non-OAuth params from `options` are not put in `authParams`', () => {
      const scopes = ['a', 'b'];
      const state = 'foo';
      const unknown = 'bar';
      expect(buildRenderOptions({ el: 'x', clientId: 'x', redirectUri: 'x' }, { scopes, state, unknown })).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          scopes,
          state
        }
      });
    });

    it('authParams are merged from local options into widgetOptions', () => {
      const scopes = ['a', 'b'];
      const state = 'foo';
      const widgetOptions = {
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          state,
        }
      };

      expect(buildRenderOptions(widgetOptions, { scopes })).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          scopes,
          state
        }
      });
    });

    it('local options override widgetOptions', () => {
      const scopes = ['a', 'b'];
      const state = 'foo';
      const widgetOptions = {
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          state: 'widget-state',
          scopes: ['widget', 'scopes']
        }
      };

      expect(buildRenderOptions(widgetOptions, { scopes, state })).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          scopes,
          state
        }
      });
    });
    it('a property named `authParams` in local options will be ignored', () => {
      const scopes = ['a', 'b'];
      const state = 'foo';
      const widgetOptions = {
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          state,
          scopes
        }
      };
      expect(buildRenderOptions(widgetOptions, { authParams: { state: 'other', scopes: ['other']}})).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          scopes,
          state
        }
      });
    });
  });
});