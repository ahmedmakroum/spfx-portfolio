import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { IStatusCount } from '../../models/IAggregates';
import { ChartAccent, chromeFor, getStatusColor } from './chartColors';
import { ChartCard } from './ChartCard';

export interface IStatusBarChartProps {
  data: IStatusCount[];
  accent: ChartAccent;
  isDarkTheme: boolean;
  onSegmentClick: (status: string) => void;
}

const CustomTooltip: React.FC<TooltipProps<number, string> & { textPrimary: string; textSecondary: string; surface: string }> = props => {
  const { active, payload, textPrimary, textSecondary, surface } = props;
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const point = payload[0];
  return (
    <div style={{ background: surface, border: `1px solid ${textSecondary}33`, borderRadius: 4, padding: '6px 10px' }}>
      <div style={{ color: textPrimary, fontWeight: 600, fontSize: 14 }}>{point.value} items</div>
      <div style={{ color: textSecondary, fontSize: 12 }}>{point.payload.status}</div>
    </div>
  );
};

export const StatusBarChart: React.FC<IStatusBarChartProps> = ({ data, accent, isDarkTheme, onSegmentClick }) => {
  const chrome = chromeFor(isDarkTheme);
  const tableRows = data.map((d, i) => ({ label: d.status, value: d.count, color: getStatusColor(d.status, i, accent, isDarkTheme) }));

  return (
    <ChartCard title="Items by status" subtitle="Click a bar to see the underlying items" tableRows={tableRows}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid vertical={false} stroke={chrome.grid} strokeDasharray="0" />
          <XAxis
            dataKey="status"
            tick={{ fill: chrome.textMuted, fontSize: 12 }}
            axisLine={{ stroke: chrome.baseline }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: chrome.textMuted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ fill: chrome.grid, opacity: 0.4 }}
            content={<CustomTooltip textPrimary={chrome.textPrimary} textSecondary={chrome.textSecondary} surface={chrome.surface} />}
          />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            onClick={payload => onSegmentClick(payload.status)}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => (
              <Cell key={entry.status} fill={getStatusColor(entry.status, index, accent, isDarkTheme)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
