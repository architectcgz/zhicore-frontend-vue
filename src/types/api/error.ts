export interface ApiErrorDetail {
  code?: string;
  field?: string;
  message?: string;
  messageKey?: string;
  path?: string;
  reason?: string;
}

export interface ApiErrorData {
  details?: ApiErrorDetail[];
  fields?: ApiErrorDetail[];
}

export interface ApiErrorEnvelope {
  code?: number;
  message?: string;
  traceId?: string;
  data?: ApiErrorData | null;
  details?: ApiErrorDetail[];
  timestamp?: number;
}
