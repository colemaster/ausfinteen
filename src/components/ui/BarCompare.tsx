import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCompact, formatCurrency } from '../../utils/formatters';
import { useReducedMotion, type MoneyFormat } from './chart';

interface BarCompareProps {
  data: Record<string, string | number>[];
  keys: { key: string; label: string; color: string }[];
  xKey: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  /** Axis + tooltip money formatting. Defaults to compact ($1.2M style). */
  moneyFormat?: MoneyFormat;
}

export function BarCompare({
  data,
  keys,
  xKey,
  height = 280,
  moneyFormat = 'compact',
}: BarCompareProps) {
  const reduced = useReducedMotion();
  const formatMoney = (v: number) =>
    moneyFormat === 'full' ? formatCurrency(v) : formatCompact(v);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11 }}
          className="text-slate-400"
        />
        <YAxis
          tickFormatter={v => formatMoney(v as number)}
          tick={{ fontSize: 11 }}
          className="text-slate-400"
        />
        <Tooltip
          formatter={(value, name) => [
            typeof value === 'number' ? formatMoney(value) : '',
            name,
          ]}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {keys.map(k => (
          <Bar key={k.key} dataKey={k.key} name={k.label} fill={k.color} radius={[2, 2, 0, 0]} isAnimationActive={!reduced} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}