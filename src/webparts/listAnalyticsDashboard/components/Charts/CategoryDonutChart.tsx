import * as React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { Pivot, PivotItem } from '@fluentui/react';
import { IDimensionCount, DonutDimension } from '../../models/IAggregates';
import { chromeFor } from './chartColors';
import { ChartCard } from './ChartCard';

export interface ICategoryDonutChartProps {
  data: IDimensionCount[];
  colorMap: Map<string, string>;
  dimension: DonutDimension;
  isDarkTheme: boolean;
  onDimensionChange: (dimension: DonutDimension) => void;
  onSliceClick: (label: string) => void;
}

const CustomTooltip: React.FC<TooltipProps<number, string> & { textPrimary: string; textSecondary: string; surface: string; total: number }> = props => {
  const { active, payload, textPrimary, textSecondary, surface, total } = props;
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const point = payload[0];
  const percent = total > 0 ? Math.round((Number(point.value) / total) * 100) : 0;
  return (
    <div style={{ background: surface, border: `1px solid ${textSecondary}33`, borderRadius: 4, padding: '6px 10px' }}>
      <div style={{ color: textPrimary, fontWeight: 600, fontSize: 14 }}>
        {point.value} items ({percent}%)
      </div>
      <div style={{ color: textSecondary, fontSize: 12 }}>{point.name}</div>
    </div>
  );
};

export const CategoryDonutChart: React.FC<ICategoryDonutChartProps> = ({
  data,
  colorMap,
  dimension,
  isDarkTheme,
  onDimensionChange,
  onSliceClick
}) => {
  const chrome = chromeFor(isDarkTheme);
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const tableRows = data.map(d => ({ label: d.label, value: d.count, color: colorMap.get(d.label) }));

  const headerAction = (
    <Pivot
      selectedKey={dimension}
      onLinkClick={item => item && onDimensionChange(item.props.itemKey as DonutDimension)}
      styles={{ root: { marginRight: 4 }, link: { height: 28, lineHeight: 28 }, linkIsSelected: { height: 28, lineHeight: 28 } }}
    >
      <PivotItem itemKey="category" headerText="Category" />
      <PivotItem itemKey="assignedTo" headerText="Assignee" />
    </Pivot>
  );

  return (
    <ChartCard
      title={`Items by ${dimension === 'category' ? 'category' : 'assignee'}`}
      subtitle="Click a slice to see the underlying items"
      tableRows={tableRows}
      headerAction={headerAction}
    >
      <ResponsiveContainer width="100%" height={260}>
        <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <Tooltip content={<CustomTooltip textPrimary={chrome.textPrimary} textSecondary={chrome.textSecondary} surface={chrome.surface} total={total} />} />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: 12, color: chrome.textSecondary }}
            formatter={(value: string) => <span style={{ color: chrome.textSecondary }}>{value}</span>}
          />
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            innerRadius={56}
            outerRadius={90}
            paddingAngle={2}
            stroke={chrome.surface}
            strokeWidth={2}
            onClick={entry => onSliceClick(entry.label)}
            style={{ cursor: 'pointer' }}
            label={entry => {
              const percent = total > 0 ? (entry.count / total) * 100 : 0;
              return percent >= 8 ? `${Math.round(percent)}%` : '';
            }}
          >
            {data.map(entry => (
              <Cell key={entry.label} fill={colorMap.get(entry.label) || chrome.textMuted} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
