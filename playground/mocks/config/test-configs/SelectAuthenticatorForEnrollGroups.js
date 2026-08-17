// N-of-M authenticator groups: required-phase, single group (1-of-3, nothing enrolled).
const mockEnrollAuthenticatorGroupsSingle = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator-groups'
  ],
};

// N-of-M authenticator groups: required-phase, two groups with Okta Verify in both.
const mockEnrollAuthenticatorGroupsTwo = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator-groups-two'
  ],
};

// N-of-M authenticator groups: optional-phase after satisfying arg-recovery
// (remaining=0). Ungrouped Password + unenrolled group members + skip form.
const mockEnrollAuthenticatorGroupsOptionalPhase = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator-groups-optional-phase'
  ],
};

// N-of-M authenticator groups: single group with BY_DATE_TIME group-level grace period.
const mockEnrollAuthenticatorGroupsGracePeriod = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator-groups-grace-period'
  ],
};

// N-of-M authenticator groups: single group with BY_SKIP_COUNT group-level grace period.
const mockEnrollAuthenticatorGroupsGracePeriodSkip = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator-groups-grace-period-skip'
  ],
};

// N-of-M authenticator groups: mixed required-now + required-soon. Standalone
// Password + arg-strong group (no grace period) in Required now; standalone NFC
// (BY_SKIP_COUNT) + standalone WebAuthn (BY_DATE_TIME) + arg-deadline group
// (BY_DATE_TIME grace period) in Required soon.
const mockEnrollAuthenticatorGroupsMixed = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator-groups-mixed'
  ],
};

module.exports = {
  mockEnrollAuthenticatorGroupsSingle,
  mockEnrollAuthenticatorGroupsTwo,
  mockEnrollAuthenticatorGroupsOptionalPhase,
  mockEnrollAuthenticatorGroupsGracePeriod,
  mockEnrollAuthenticatorGroupsGracePeriodSkip,
  mockEnrollAuthenticatorGroupsMixed,
};
