import { HttpResponse, OktaAuth } from '@okta/okta-auth-js';

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
