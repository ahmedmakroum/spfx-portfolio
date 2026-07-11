import * as React from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react';

export const LoadingState: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
    <Spinner size={SpinnerSize.large} label="Loading list data…" />
  </div>
);
