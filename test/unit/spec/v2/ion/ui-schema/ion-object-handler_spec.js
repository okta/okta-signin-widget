import createUiSchemaForObject from 'v2/ion/ui-schema/ion-object-handler';

const option = (label, id, key, methodType, relatesToExtra = {}) => ({
  label,
  value: { form: { value: [
    { name: 'id', value: id, required: true, mutable: false },
    { name: 'methodType', value: methodType, required: true, mutable: false },
  ] } },
  relatesTo: { id, key, ...relatesToExtra },
});

const build = (formName, options, authenticators) => createUiSchemaForObject(
  { name: 'authenticator', options },
  { name: formName },
  { authenticators: authenticators && { value: authenticators } },
);

describe('v2/ion/ui-schema/ion-object-handler phishing resistant flag', () => {
  const authenticators = [
    { id: 'pwd', methods: [{ type: 'password' }] },
    { id: 'wa', methods: [{ type: 'webauthn', phishingResistantCapable: true }] },
    { id: 'ov', methods: [{ type: 'signed_nonce', phishingResistantCapable: true }] },
  ];
  const getOptions = () => [
    option('Password', 'pwd', 'okta_password', 'password'),
    option('Key', 'wa', 'webauthn', 'webauthn'),
  ];

  it('flags only capable methods on select-authenticator-authenticate', () => {
    const { options } = build('select-authenticator-authenticate', getOptions(), authenticators);
    expect(options.map(o => !!o.phishingResistant)).toEqual([false, true]);
  });

  it('does not flag anything when the backend sends no authenticators', () => {
    const { options } = build('select-authenticator-authenticate', getOptions());
    expect(options.some(o => o.phishingResistant)).toBe(false);
  });

  it('flags capable methods on the unlock-account form too', () => {
    const { options } = build('select-authenticator-unlock-account', getOptions(), authenticators);
    expect(options.map(o => !!o.phishingResistant)).toEqual([false, true]);
  });

  it('flags FastPass regardless of deviceKnown', () => {
    [true, false].forEach((deviceKnown) => {
      const ovOptions = [option('OV', 'ov', 'okta_verify', 'signed_nonce', { deviceKnown })];
      expect(build('select-authenticator-authenticate', ovOptions, authenticators)
        .options[0].phishingResistant).toBe(true);
    });
  });
});
