import FormBuilder from 'v2/util/FormBuilder';
import AppState from 'v2/models/AppState';
import transform from 'v2/ion/transformer';
import SchemaData from 'v2/ion/uiSchema/SchemaData';
import XHRIntrospect from '../../../helpers/xhr/v2/INTROSPECT';

describe('v2/util/FormBuilder', function () {
  it('returns correct form for identify step', () => {
    const appState = new AppState();
    const xhrResponse = XHRIntrospect;
    const ionResponse = transform(xhrResponse.response);
    appState.set(ionResponse);
    const uiSchema = SchemaData.getSchema('identify');
    appState.set('uiSchema', uiSchema);
    FormBuilder.createInputOptions(appState);
    expect(FormBuilder.__getFormObj().inputOptions).toEqual(
      [
        {
          name: 'identifier',
          label: 'identifier',
          type: 'text',
          'label-top': true
        }
      ]
    );
    expect(FormBuilder.__getFormObj().layout).toBe('o-form-theme');
    expect(FormBuilder.__getFormObj().className).toBe('ion-form');
    expect(FormBuilder.__getFormObj().autoSave).toBe(true);
    expect(FormBuilder.__getFormObj().noCancelButton).toBe(true);
    expect(FormBuilder.__getFormObj().title).toBe('Sign In');
    expect(FormBuilder.__getFormObj().save).toBe('Next');

  });
});
