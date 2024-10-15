import { IDX_STEP } from './idxConstants';

export const ABORT_REASON_CLEANUP = 'WebAuthNAutofill component cleanup';
export const ABORT_REASON_WEBAUTHN_AUTOFILLUI_STEP_NOT_FOUND
  = `${IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR} not found in available steps`;
