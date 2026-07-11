export type DataErrorReason = 'not-found' | 'forbidden' | 'no-lists-configured' | 'unknown';

export interface IDataError {
  reason: DataErrorReason;
  listIdentifier?: string;
  message: string;
}

export type LoadStatus = 'loading' | 'loaded' | 'error';
