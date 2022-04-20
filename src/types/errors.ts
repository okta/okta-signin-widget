export interface ErrorXHR {
  status: number;
  responseType?: string;
  responseText: string;
  responseJSON?: { [propName: string]: any; };
}
