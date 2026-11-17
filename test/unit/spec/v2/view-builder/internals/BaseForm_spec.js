import { Model } from '@okta/courage';
import { BaseForm } from 'v2/view-builder/internals';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';

describe('v2/view-builder/internals/BaseForm', function() {
  let form;

  const uiSchema = [
    { name: 'identifier', label: 'Username', type: 'text' },
    { name: 'rememberMe', label: 'Keep me signed in', type: 'checkbox' },
    { name: 'locked', label: 'Locked', type: 'text', disabled: true },
  ];

  const renderForm = (Form = BaseForm) => {
    form = new Form({
      appState: new AppState({}, {}),
      settings: new Settings({ baseUrl: 'http://localhost:3000' }),
      model: new Model(),
      currentViewState: { uiSchema },
    });
    form.render();
    document.body.appendChild(form.el);
    return form;
  };

  const isDisabled = (name) => form.$(`[name="${name}"]`).prop('disabled');

  afterEach(() => {
    form.remove();
  });

  describe('saving state', () => {
    beforeEach(() => {
      renderForm();
    });

    it('disables inputs when saving starts, so a focused input stops taking keystrokes', () => {
      form.$('[name="identifier"]').trigger('focus');

      form.model.trigger('request');

      expect(form.$el.hasClass('o-form-saving')).toBe(true);
      expect(isDisabled('identifier')).toBe(true);
      expect(isDisabled('rememberMe')).toBe(true);
    });

    ['error', 'sync'].forEach((event) => {
      it(`re-enables inputs when saving stops on "${event}"`, () => {
        form.model.trigger('request');
        form.model.trigger(event, form.model, {});

        expect(form.$el.hasClass('o-form-saving')).toBe(false);
        expect(isDisabled('identifier')).toBe(false);
        expect(isDisabled('rememberMe')).toBe(false);
      });
    });

    it('keeps intentionally disabled inputs disabled after saving stops', () => {
      expect(isDisabled('locked')).toBe(true);

      form.model.trigger('request');
      form.model.trigger('error', form.model, {});

      expect(isDisabled('locked')).toBe(true);
    });

    it('restores focus to the input that had it before saving', () => {
      const identifier = form.$('[name="identifier"]')[0];
      identifier.focus();

      form.model.trigger('request');
      // Browsers drop focus to <body> when the focused input is disabled; jsdom does not,
      // and ignores blur() on disabled elements, so emulate it.
      identifier.disabled = false;
      identifier.blur();
      identifier.disabled = true;
      expect(document.activeElement).toBe(document.body);

      form.model.trigger('error', form.model, {});

      expect(document.activeElement).toBe(identifier);
    });

    it('does not steal focus if the user moved it elsewhere', () => {
      const other = document.createElement('button');
      document.body.appendChild(other);
      form.$('[name="identifier"]')[0].focus();

      form.model.trigger('request');
      other.focus();
      form.model.trigger('error', form.model, {});

      expect(document.activeElement).toBe(other);
      other.remove();
    });

    it('keeps the first snapshot when saving state is set more than once', () => {
      form.model.trigger('request');
      form.model.trigger('request');
      form.model.trigger('error', form.model, {});

      expect(isDisabled('identifier')).toBe(false);
      expect(isDisabled('rememberMe')).toBe(false);
      expect(isDisabled('locked')).toBe(true);
    });

    it('can be restored early and is a no-op when the saving state then clears', () => {
      form.model.trigger('request');
      form.restoreInputsAfterSaving();
      expect(isDisabled('identifier')).toBe(false);

      form.model.trigger('error', form.model, {});
      expect(isDisabled('identifier')).toBe(false);
      expect(isDisabled('locked')).toBe(true);
    });
  });

  it('applies to subclasses that override modelEvents and initialize', () => {
    const SubForm = BaseForm.extend({
      modelEvents: { error: 'onError' },
      onError() {},
      initialize() {
        BaseForm.prototype.initialize.apply(this, arguments);
      },
    });
    renderForm(SubForm);

    form.model.trigger('request');
    expect(isDisabled('identifier')).toBe(true);

    form.model.trigger('error', form.model, {});
    expect(isDisabled('identifier')).toBe(false);
  });

  it('leaves inputs alone when the form has no saving state', () => {
    renderForm(BaseForm.extend({ hasSavingState: false }));

    form.model.trigger('request');

    expect(form.$el.hasClass('o-form-saving')).toBe(false);
    expect(isDisabled('identifier')).toBe(false);
  });
});
