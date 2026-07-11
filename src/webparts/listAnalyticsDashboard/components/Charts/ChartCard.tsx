import * as React from 'react';
import { IconButton, TooltipHost } from '@fluentui/react';
import styles from './ChartCard.module.scss';

export interface IChartCardTableRow {
  label: string;
  value: number;
  color?: string;
}

export interface IChartCardProps {
  title: string;
  subtitle?: string;
  tableRows: IChartCardTableRow[];
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Common chrome for every chart: title/subtitle, an optional header action
 * (e.g. the category/assignee dimension toggle), and a table-view fallback so
 * every value stays reachable without hovering the chart.
 */
export const ChartCard: React.FC<IChartCardProps> = ({ title, subtitle, tableRows, headerAction, children }) => {
  const [showTable, setShowTable] = React.useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {headerAction}
          <TooltipHost content={showTable ? 'Show chart' : 'View data as table'}>
            <IconButton
              iconProps={{ iconName: showTable ? 'BarChartVertical' : 'Table' }}
              ariaLabel={showTable ? 'Show chart' : 'View data as table'}
              onClick={() => setShowTable(prev => !prev)}
            />
          </TooltipHost>
        </div>
      </div>
      <div className={styles.body}>
        {showTable ? (
          <div className={styles.tableWrap}>
            <table role="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Label</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(row => (
                  <tr key={row.label}>
                    <td style={{ padding: '4px 8px' }}>
                      {row.color && (
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background: row.color,
                            marginRight: 6
                          }}
                        />
                      )}
                      {row.label}
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
