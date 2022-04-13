
export interface FieldError {
  errorSummary: string;
  reason?: string;
  location?: string;
  locationType?: string;
  domain?: string;
}

export interface ApiError {
  errorSummary: string;
  errorCode?: string;
  errorId?: string;
  errorLink?: string;
  errorCauses?: Array<FieldError>;
}

export interface ErrorXHR {
  status: number;
  responseType?: string;
  responseText: string;
  responseJSON?: { [propName: string]: any; };
}
