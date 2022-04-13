
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
