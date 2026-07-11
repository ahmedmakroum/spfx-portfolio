import * as React from 'react';
import { DefaultButton, MessageBar, MessageBarType, Stack } from '@fluentui/react';
import { IDataError } from '../../models/IDataLoadState';

export interface IErrorStateProps {
  error: IDataError;
  onRetry: () => void;
}

const REASON_TITLES: Record<IDataError['reason'], string> = {
  'not-found': 'List not found',
  forbidden: 'Access denied',
  'no-lists-configured': 'No lists configured',
  unknown: 'Could not load data'
};

export const ErrorState: React.FC<IErrorStateProps> = ({ error, onRetry }) => (
  <Stack tokens={{ childrenGap: 12 }} style={{ padding: 16 }}>
    <MessageBar messageBarType={MessageBarType.error}>
      <strong>{REASON_TITLES[error.reason]}.</strong> {error.message}
    </MessageBar>
    <Stack.Item>
      <DefaultButton text="Retry" iconProps={{ iconName: 'Refresh' }} onClick={onRetry} />
    </Stack.Item>
  </Stack>
);
