import { AuthSdkError, FieldError, OAuthError as SdkOAuthError} from '@okta/okta-auth-js';
import { OAuthError } from './Errors';
import { loc } from 'okta';

type ErrorTraits = 'visible' | 'terminal';

type ErrorType = {
  [key in ErrorTraits]?: boolean;
};

class UserFacingErrorType implements ErrorType {
  visible = true;
}

class TerminalErrorType extends UserFacingErrorType {
  terminal = true;
}

interface ErrorDetails {
  errorSummary?: string;
  errorCode?: string;
  errorCauses?: Array<FieldError>;
}

class TypedOAuthError<T extends ErrorType> extends OAuthError {
  errorType: T;
  orginalError: AuthSdkError | SdkOAuthError;
  errorDetails: ErrorDetails

  constructor(originalError, errorTypeCtor: new () => T) {
    super(originalError.message);
    this.errorType = new errorTypeCtor();
    this.orginalError = originalError;

    this.errorDetails = {
      errorSummary: this.getErrorSummary(),
      errorCode: originalError.errorCode,
      errorCauses: originalError.errorCauses,
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
  constructor(error) {
    super(error, TerminalErrorType);
  }

  getErrorSummary(): string {
    return 'Check your system clock';
  }
}

class UserNotAssignedError extends RecoverableError<UserFacingErrorType> {
  constructor(error) {
    super(error, UserFacingErrorType);
  }
}

class JITProfileProvisioningError extends RecoverableError<UserFacingErrorType> {
  constructor(error) {
    super(error, UserFacingErrorType);
  }
  getErrorSummary(): string {
    return loc('error.jit_failure', 'login');
  }
}

class MfaRequiredError extends NonRecoverableError<UserFacingErrorType> {
  constructor(error) {
    super(error, UserFacingErrorType);
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
      break;

    case 'INTERNAL':
      const clockDriftMsg = 'The JWT was issued in the future';
      if (error.message === clockDriftMsg) {
        return new ClockDriftError(error);
      }
      break;

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
  getTypedOAuthError
}