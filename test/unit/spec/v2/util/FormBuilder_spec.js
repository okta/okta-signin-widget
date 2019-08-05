import FormBuilder from 'v2/util/FormBuilder';
import AppState from 'v2/models/AppState';
import transform from 'v2/ion/responseTransformer';
import XHRIntrospect from '../../../helpers/xhr/v2/INTROSPECT';

describe('v2/util/FormBuilder', function () {
  let FormBuilderForm = null;
  beforeEach(function () {
    const appState = new AppState();
    const xhrResponse = XHRIntrospect;
    const ionResponse = transform(xhrResponse.response);
    appState.set(ionResponse);
    FormBuilderForm = FormBuilder.createInputOptions(ionResponse.currentState.remediation[0]);
    spyOn(FormBuilderForm.prototype, 'addInput');
  });

  it('returns correct form for identify step', () => {
    FormBuilderForm.prototype.initialize();
    expect(FormBuilderForm.prototype.addInput).toHaveBeenCalledWith(
      { type: 'text',
        name: 'identifier',
        label: 'identifier',
        'label-top': true
      }
    );
    expect(FormBuilderForm.prototype.layout).toBe('o-form-theme');
    expect(FormBuilderForm.prototype.className).toBe('ion-form');
    expect(FormBuilderForm.prototype.autoSave).toBe(false);
    expect(FormBuilderForm.prototype.noCancelButton).toBe(true);
    expect(FormBuilderForm.prototype.title).toBe('Sign In');
    expect(FormBuilderForm.prototype.save).toBe('Next');
  });
});
