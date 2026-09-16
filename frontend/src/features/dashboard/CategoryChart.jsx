import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { money } from '../../utils/format';
const colors = ['#f97316', '#f59e0b', '#10b981', '#818cf8'];
export default function CategoryChart({ data, total }) {
  return (
    <div
      className="relative mb-4"
      role="img"
      aria-label="Approved expense breakdown. Exact amounts are listed below."
    >
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data.map((item) => ({ ...item, amount: Number(item.amount) }))}
            dataKey="amount"
            nameKey="category"
            innerRadius={60}
            outerRadius={82}
            paddingAngle={3}
            stroke="none"
            isAnimationActive={!matchMedia('(prefers-reduced-motion: reduce)').matches}
          >
            {data.map((item, index) => (
              <Cell key={item.category} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => money(value)}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              color: 'var(--ink)',
              fontSize: 12,
            }}
            itemStyle={{ color: 'var(--ink)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] text-muted">TOTAL SPENT</span>
        <strong className="mt-1 text-sm font-semibold tabular-nums">{money(total)}</strong>
      </div>
    </div>
  );
}
