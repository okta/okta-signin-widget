import { Collection, Model } from '@okta/courage';
import AuthenticatorVerifyOptions from 'v2/view-builder/components/AuthenticatorVerifyOptions';

describe('v2/view-builder/components/AuthenticatorVerifyOptions', function() {
  const createView = (moreCollection) => new AuthenticatorVerifyOptions({
    model: new Model(),
    name: 'authenticator',
    appState: { trigger: jest.fn() },
    collection: new Collection([{ label: 'Security Key', value: {} }]),
    ...(moreCollection ? { moreCollection } : {}),
  });

  it('renders a flat list without a toggle when there is no moreCollection', () => {
    const view = createView();
    view.render();
    expect(view.el.querySelector('.authenticator-more-options-toggle')).toBeNull();
  });

  it('renders a collapsed "More options" toggle that expands on click', () => {
    const view = createView(new Collection([{ label: 'Phone', value: {} }]));
    view.render();
    const toggle = view.el.querySelector('[data-se="authenticator-more-options-toggle"]');
    const container = view.el.querySelector('.authenticator-more-options');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(container.hidden).toBe(true);
    expect(toggle.getAttribute('aria-controls')).toBe(container.id);
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(container.hidden).toBe(false);
    toggle.click();
    expect(container.hidden).toBe(true);
  });

  it('uses a unique container id per list and renders the nested list inside the container', () => {
    const a = createView(new Collection([{ label: 'Phone', value: {} }]));
    const b = createView(new Collection([{ label: 'Phone', value: {} }]));
    a.render();
    b.render();
    expect(a.el.querySelector('.authenticator-more-options').id)
      .not.toBe(b.el.querySelector('.authenticator-more-options').id);
    expect(a.el.querySelectorAll('.authenticator-more-options .authenticator-row').length).toBe(1);
    expect(a.el.querySelectorAll('.authenticator-more-options-toggle').length).toBe(1);
  });

  describe('grouped list', () => {
    const createGrouped = (moreItems) => {
      const model = new Model();
      const view = new AuthenticatorVerifyOptions({
        model,
        name: 'authenticator',
        appState: { trigger: jest.fn() },
        collection: new Collection([{ label: 'Security Key', value: {} }]),
        moreCollection: new Collection(moreItems),
      });
      return { model, view };
    };

    it('does not duplicate the "More options" group or rows when rendered again', () => {
      const { view } = createGrouped([{ label: 'Phone', value: {} }, { label: 'Email', value: {} }]);
      view.render();
      view.render();
      expect(view.el.querySelectorAll('.authenticator-more-options-group').length).toBe(1);
      expect(view.el.querySelectorAll('.authenticator-more-options-toggle').length).toBe(1);
      expect(view.el.querySelectorAll('.authenticator-row').length).toBe(3);
    });

    it('shows a single "required" error that counts methods in both lists', () => {
      const { model, view } = createGrouped([{ label: 'Phone', value: {} }]);
      view.render();
      const errors = [];
      model.on('error', (m, resp) => errors.push(resp.responseJSON.errorSummary));
      model.trigger('invalid', model, { authenticator: 'required' });
      expect(errors).toEqual(['To unlock your account, select one of the following authenticators.']);
    });
  });
});
