import { $ } from 'okta';
import ColorsUtil from 'util/ColorsUtil';
import Enums from 'util/Enums';

const normalize = function(text) {
  return text.replace(/\s+/g, ' ');
};

describe('ColorsUtil', function() {
  beforeEach(function() {
    $('body').append(`<div id="${Enums.WIDGET_CONTAINER_ID}" />`);
  });
  afterEach(function() {
    $(`#${Enums.WIDGET_CONTAINER_ID}`).remove();
  });

  describe('addStyle', function() {
    it('appends the correct style to head', function() {
      const colors = {
        brand: '#008000',
      };
      const expectedStyle = `
          #okta-sign-in.auth-container .button-primary,
          #okta-sign-in.auth-container .button-primary:active,
          #okta-sign-in.auth-container .button-primary:focus { background: #008000; }
          #okta-sign-in.auth-container .button-primary:hover { background: #008600; }
          #okta-sign-in.auth-container .button.button-primary.link-button-disabled {
            background: #008000;
            opacity: 0.5;
          }
        `;

      ColorsUtil.addStyle(colors);
      expect($(`#${Enums.WIDGET_CONFIG_COLORS_ID}`)).toBeDefined();
      expect(normalize($(`#${Enums.WIDGET_CONFIG_COLORS_ID}`).text())).toBe(normalize(expectedStyle));
    });
  });

  describe('isLoaded', function() {
    it('returns false if no okta-sign-in-config-colors style was added', function() {
      expect(ColorsUtil.isLoaded()).toBe(false);
    });
    it('returns true if okta-sign-in-config-colors style was added', function() {
      const colors = {
        brand: '#008000',
      };

      ColorsUtil.addStyle(colors);
      expect(ColorsUtil.isLoaded()).toBe(true);
    });
  });

  describe('lighten', function() {
    it('returns a lighter color if a lum parameter is passed', function() {
      expect(ColorsUtil.lighten('#008000', 0.3)).toBe('#00a600');
      expect(ColorsUtil.lighten('#C0C0C0', 0.1)).toBe('#d3d3d3');
      expect(ColorsUtil.lighten('#0000EE', 0.05)).toBe('#0000fa');
    });
    it('returns the same color if no lum parameter is passed', function() {
      expect(ColorsUtil.lighten('#008000')).toBe('#008000');
    });
  });
});
