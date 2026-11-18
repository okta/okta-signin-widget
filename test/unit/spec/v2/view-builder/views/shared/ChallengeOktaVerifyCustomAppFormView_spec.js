import { BaseForm } from 'v2/view-builder/internals';
import Body from 'v2/view-builder/views/shared/ChallengeOktaVerifyCustomAppFormView';

describe('v2/view-builder/views/shared/ChallengeOktaVerifyCustomAppFormView', function() {
  const AUTHENTICATOR_ID = 'aut13qrZReYpIib7R0g4';
  const methodsSchema = () => ({
    name: 'authenticator.methodType',
    options: [
      { label: 'push notification', value: 'push' },
      { label: 'totp', value: 'totp' },
      { label: 'FastPass', value: 'signed_nonce' },
    ],
  });

  // Builds the view without rendering: getUISchema only reads this.options.
  const getViewOptions = ({ authenticators, deviceKnown = true, authenticatorId = AUTHENTICATOR_ID }) => {
    jest.spyOn(BaseForm.prototype.getUISchema, 'apply').mockReturnValue([methodsSchema()]);
    const view = Object.create(Body.prototype);
    view.options = {
      appState: {
        get: (key) => key === 'idx' ? { rawIdxState: { authenticators: { value: authenticators } } } : 'okta_verify',
      },
      currentViewState: {
        relatesTo: { value: { deviceKnown } },
        value: [{ name: 'authenticator', form: { value: [{ name: 'id', value: authenticatorId }] } }],
      },
    };
    return view.getUISchema()[0].options;
  };
  const flagged = (id = AUTHENTICATOR_ID) => [{
    id,
    methods: [{ type: 'push' }, { type: 'totp' }, { type: 'signed_nonce', phishingResistantCapable: true }],
  }];

  afterEach(() => jest.restoreAllMocks());

  it('lists FastPass first and collapses push and totp under "More options"', () => {
    const options = getViewOptions({ authenticators: flagged() });
    expect(options.collection.pluck('value')).toEqual(['signed_nonce']);
    expect(options.moreCollection.pluck('value')).toEqual(['push', 'totp']);
  });

  it('keeps a flat list when the backend sends no flag', () => {
    const options = getViewOptions({ authenticators: [{ id: AUTHENTICATOR_ID, methods: [{ type: 'push' }] }] });
    expect(options.collection.length).toBe(3);
    expect(options.moreCollection).toBeUndefined();
  });

  it('keeps a flat list when authenticators are missing', () => {
    const options = getViewOptions({ authenticators: undefined });
    expect(options.collection.length).toBe(3);
    expect(options.moreCollection).toBeUndefined();
  });

  it('still lists FastPass first when deviceKnown is false', () => {
    const options = getViewOptions({ authenticators: flagged(), deviceKnown: false });
    expect(options.collection.pluck('value')).toEqual(['signed_nonce']);
    expect(options.moreCollection.pluck('value')).toEqual(['push', 'totp']);
  });

  it('does not flag methods when the authenticator ids do not match', () => {
    const options = getViewOptions({ authenticators: flagged('other_id') });
    expect(options.collection.length).toBe(3);
    expect(options.moreCollection).toBeUndefined();
  });
});
