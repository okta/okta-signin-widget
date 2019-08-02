import FormBuilder from 'v2/util/FormBuilder';
import AppState from 'v2/models/AppState';
import transform from 'v2/ion/responseTransformer';
import SchemaData from 'v2/ion/uiSchema/SchemaData';
import XHRIntrospect from '../../../helpers/xhr/v2/INTROSPECT';

describe('v2/util/FormBuilder', function () {
  let form = {};
  beforeEach(function () {
    const appState = new AppState();
    const xhrResponse = XHRIntrospect;
    const ionResponse = transform(xhrResponse.response);
    appState.set(ionResponse);
    const uiSchema = SchemaData.getSchema('identify');
    appState.set('uiSchema', uiSchema);
    form = FormBuilder.createInputOptions(appState);
    spyOn(form.prototype, 'addInput');
  });

  it('returns correct form for identify step', () => {
    form.prototype.initialize();
    expect(form.prototype.addInput).toHaveBeenCalledWith(
      { type: 'text',
        rel: 'identifier',
        name: 'identifier',
        label: 'identifier',
        'label-top': true 
      }
    );
    expect(form.prototype.layout).toBe('o-form-theme');
    expect(form.prototype.className).toBe('ion-form');
    expect(form.prototype.autoSave).toBe(true);
    expect(form.prototype.noCancelButton).toBe(true);
    expect(form.prototype.title).toBe('Sign In');
    expect(form.prototype.save).toBe('Next');
  });
});
