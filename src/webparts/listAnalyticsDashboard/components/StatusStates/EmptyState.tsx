import * as React from 'react';
import { DefaultButton, Icon, Stack, Text } from '@fluentui/react';

export interface IEmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<IEmptyStateProps> = ({ title, message, actionText, onAction }) => (
  <Stack horizontalAlign="center" tokens={{ childrenGap: 8 }} style={{ padding: '48px 16px', textAlign: 'center' }}>
    <Icon iconName="BarChart4" style={{ fontSize: 32, opacity: 0.5 }} />
    <Text variant="large">{title}</Text>
    <Text variant="medium" style={{ opacity: 0.75, maxWidth: 420 }}>
      {message}
    </Text>
    {actionText && onAction && <DefaultButton text={actionText} onClick={onAction} style={{ marginTop: 8 }} />}
  </Stack>
);
