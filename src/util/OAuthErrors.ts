import { loc } from './loc';

import { AuthSdkError, OAuthError as SdkOAuthError} from '@okta/okta-auth-js';
import { OAuthError } from './Errors';
import { ErrorDetails } from '../types/errors';

type ErrorTraits = 'inline' | 'terminal';

type ErrorType = {
  [key in ErrorTraits]?: boolean;
};

class InlineErrorType implements ErrorType {
  inline = true;
}

class TerminalErrorType implements ErrorType {
  terminal = true;
}

class TypedOAuthError<T extends ErrorType> extends OAuthError {
  errorType: T;
  orginalError: AuthSdkError | SdkOAuthError;
  errorDetails: ErrorDetails

  constructor(originalError: AuthSdkError | SdkOAuthError, errorTypeCtor: new () => T) {
    super(originalError.message);
    this.errorType = new errorTypeCtor();
    this.orginalError = originalError;

    this.errorDetails = {
      errorSummary: this.getErrorSummary(),
      errorCode: originalError.errorCode,
      errorCauses: 'errorCauses' in originalError ? originalError.errorCauses : undefined,
    }
  }

  protected getErrorSummary() {
    return this.orginalError.errorSummary;
  }

  public is(errorTrait: ErrorTraits) {
    return Boolean(Object.getOwnPropertyDescriptor(this.errorType, errorTrait as PropertyKey)?.value);
  }
}

class RecoverableError<T extends ErrorType> extends TypedOAuthError<T> {

}

class NonRecoverableError<T extends ErrorType> extends TypedOAuthError<T> {

}

class ClockDriftError extends RecoverableError<TerminalErrorType> {
  constructor(error: AuthSdkError | SdkOAuthError) {
    super(error, TerminalErrorType);
  }

  getErrorSummary(): string {
    return loc('error.unsynced.clock', 'login');
  }
}

class UserNotAssignedError extends RecoverableError<InlineErrorType> {
  constructor(error: AuthSdkError | SdkOAuthError) {
    super(error, InlineErrorType);
  }
}

class JITProfileProvisioningError extends RecoverableError<InlineErrorType> {
  constructor(error: AuthSdkError | SdkOAuthError) {
    super(error, InlineErrorType);
  }
  getErrorSummary(): string {
    return loc('error.jit_failure', 'login');
  }
}

class MfaRequiredError extends NonRecoverableError<InlineErrorType> {
  constructor(error: AuthSdkError | SdkOAuthError) {
    super(error, InlineErrorType);
  }

  getErrorSummary(): string {
    return loc('error.mfa.required', 'login');
  }
}

function getTypedOAuthError(error: AuthSdkError | SdkOAuthError) {
  switch(error.errorCode) {
    case 'access_denied':
      return new UserNotAssignedError(error);

    case 'jit_failure_missing_fields':
    case 'jit_failure_invalid_login_format':
    case 'jit_failure_values_not_match_pattern':
    case 'jit_failure_values_too_long':
    case 'jit_failure_invalid_locale':
      return new JITProfileProvisioningError(error);

    case 'login_required':
      const mfaRequiredMsg = 'The client specified not to prompt, but the client app requires re-authentication or MFA.';
      if (error.message === mfaRequiredMsg) {
        return new MfaRequiredError(error);
      }

    case 'INTERNAL':
      const clockDriftMsg = 'The JWT was issued in the future';
      if (error.message === clockDriftMsg) {
        return new ClockDriftError(error);
      }

    default:
      return new RecoverableError(error, Object);
  }
}

export {
  RecoverableError,
  NonRecoverableError,
  JITProfileProvisioningError,
  ClockDriftError,
  UserNotAssignedError,
  MfaRequiredError,
  TypedOAuthError,
  getTypedOAuthError
}
