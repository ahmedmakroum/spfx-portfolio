import * as React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { ITimelinePoint } from '../../models/IAggregates';
import { ChartAccent, chromeFor, getAccentColor } from './chartColors';
import { ChartCard } from './ChartCard';

export interface ITimelineAreaChartProps {
  data: ITimelinePoint[];
  accent: ChartAccent;
  isDarkTheme: boolean;
  onPointClick: (point: ITimelinePoint) => void;
}

interface IDotRenderProps {
  cx?: number;
  cy?: number;
  payload?: ITimelinePoint;
  key?: string;
}

const CustomTooltip: React.FC<TooltipProps<number, string> & { textPrimary: string; textSecondary: string; surface: string }> = props => {
  const { active, payload, textPrimary, textSecondary, surface } = props;
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const point = payload[0];
  return (
    <div style={{ background: surface, border: `1px solid ${textSecondary}33`, borderRadius: 4, padding: '6px 10px' }}>
      <div style={{ color: textPrimary, fontWeight: 600, fontSize: 14 }}>{point.value} items created</div>
      <div style={{ color: textSecondary, fontSize: 12 }}>{point.payload.periodLabel}</div>
    </div>
  );
};

export const TimelineAreaChart: React.FC<ITimelineAreaChartProps> = ({ data, accent, isDarkTheme, onPointClick }) => {
  const chrome = chromeFor(isDarkTheme);
  const accentColor = getAccentColor(accent, isDarkTheme);
  const tableRows = data.map(d => ({ label: d.periodLabel, value: d.count }));

  const makeDotRenderer = (radius: number): ((dotProps: IDotRenderProps) => React.ReactElement) => dotProps => {
    const { cx, cy, payload, key } = dotProps;
    if (cx === undefined || cy === undefined || !payload) {
      return <React.Fragment key={key} />;
    }
    return (
      <circle
        key={key}
        cx={cx}
        cy={cy}
        r={radius}
        fill={accentColor}
        stroke={chrome.surface}
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
        onClick={() => onPointClick(payload)}
      />
    );
  };
  const renderDot = makeDotRenderer(5);
  const renderActiveDot = makeDotRenderer(7);

  return (
    <ChartCard title="Items created over time" subtitle="Click a point to see items from that month" tableRows={tableRows}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="timelineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={chrome.grid} />
          <XAxis
            dataKey="periodLabel"
            tick={{ fill: chrome.textMuted, fontSize: 12 }}
            axisLine={{ stroke: chrome.baseline }}
            tickLine={false}
            minTickGap={16}
          />
          <YAxis allowDecimals={false} tick={{ fill: chrome.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            cursor={{ stroke: chrome.baseline, strokeWidth: 1 }}
            content={<CustomTooltip textPrimary={chrome.textPrimary} textSecondary={chrome.textSecondary} surface={chrome.surface} />}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={accentColor}
            strokeWidth={2}
            fill="url(#timelineFill)"
            dot={renderDot}
            activeDot={renderActiveDot}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
