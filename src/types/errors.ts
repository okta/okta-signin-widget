import { HttpResponse, FieldError } from '@okta/okta-auth-js';

export interface ErrorXHR {
  status: number;
  responseType?: string;
  responseText: string;
  responseJSON?: { [propName: string]: any; };
}

export interface ErrorContextData {
  xhr: HttpResponse;
  errorSummary?: string;
}

export interface ErrorDetails {
  errorSummary?: string;
  errorCode?: string;
  errorCauses?: Array<FieldError>;
}
