import { useMemo } from 'react';
import { Pie, PieChart, Label } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

// Monochrome to match Zana's black-and-white visual language.
const taskChartConfig: ChartConfig = {
  value: { label: 'Tasks' },
  open: { label: 'Open', color: '#111111' },
  completed: { label: 'Completed', color: '#d4d4d4' },
};

export function TaskStatusChart({ open, completed }: { open: number; completed: number }) {
  const total = open + completed;

  const data = useMemo(
    () => [
      { status: 'open', label: 'Open', value: open, fill: 'var(--color-open)' },
      { status: 'completed', label: 'Completed', value: completed, fill: 'var(--color-completed)' },
    ],
    [open, completed],
  );

  if (total === 0) {
    return (
      <div className="empty" style={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3>No tasks yet.</h3>
        <p>Task status will show up here once you add some.</p>
      </div>
    );
  }

  const completionRate = Math.round((completed / total) * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
      <ChartContainer config={taskChartConfig} className="aspect-square max-h-[200px]" style={{ width: 200 }}>
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="label" />} />
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={62} outerRadius={90} strokeWidth={3} stroke="#fff">
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground" style={{ fontSize: 26, fontWeight: 800 }}>
                        {completionRate}%
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground" style={{ fontSize: 11 }}>
                        Completed
                      </tspan>
                    </text>
                  );
                }
                return null;
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#111111', display: 'inline-block' }} />
          <span>Open — {open}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#d4d4d4', display: 'inline-block' }} />
          <span>Completed — {completed}</span>
        </div>
      </div>
    </div>
  );
}
