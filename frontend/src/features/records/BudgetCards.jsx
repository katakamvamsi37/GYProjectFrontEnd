import { CalendarDays, Pencil, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '../../components/Feedback';
import { money, dateLabel } from '../../utils/format';
export default function BudgetCards({ records, canWrite, onEdit }) {
  return (
    <div className="budget-grid">
      {records.map((record) => {
        const percent =
          Number(record.budget) > 0 ? (Number(record.spent) / Number(record.budget)) * 100 : 0;
        return (
          <article className="budget-card" key={record.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="entry-symbol">
                <CalendarDays size={18} />
              </span>
              <StatusBadge value={record.status} />
            </div>
            <h3>{record.title}</h3>
            <p className="text-xs text-muted">{record.category}</p>
            <div className="budget-date">
              <CalendarDays size={14} />
              {dateLabel(record.target_date)}
            </div>
            <div className="budget-amounts">
              <span>Approved spending</span>
              <strong>{money(record.spent)}</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={`${record.title} budget used`}
              aria-valuenow={Math.round(Math.min(100, Math.max(0, percent)))}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span
                style={{
                  width: `${Math.min(100, Math.max(0, percent))}%`,
                  background: percent > 100 ? 'var(--danger)' : undefined,
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px] text-muted">
              <span>
                {Math.round(percent)}% of {money(record.budget)}
              </span>
              {canWrite ? (
                <button
                  className="table-action"
                  onClick={() => onEdit(record)}
                  aria-label={`Edit ${record.title}`}
                >
                  <Pencil size={13} />
                  Edit
                </button>
              ) : (
                <ArrowUpRight size={14} />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
