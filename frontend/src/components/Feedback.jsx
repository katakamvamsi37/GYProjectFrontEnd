import { AlertCircle, Inbox, RotateCw } from 'lucide-react';
export function Loading({ label = 'Loading records…', variant = 'table' }) {
  return (
    <div className={`skeleton-layout skeleton-${variant}`} role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="skeleton-content">
        {variant === 'dashboard' && (
          <div className="metrics">
            {Array.from({ length: 4 }, (_, i) => (
              <div className="skeleton h-36 rounded-2xl" key={i} />
            ))}
          </div>
        )}
        {Array.from({ length: variant === 'dashboard' ? 3 : 5 }, (_, i) => (
          <div className="skeleton-row" key={i}>
            <span className="skeleton h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-2/3 rounded" />
              <div className="skeleton h-2.5 w-1/3 rounded" />
            </div>
            <span className="skeleton h-6 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
export function ErrorNotice({ message, onRetry }) {
  return (
    <div className="notice error" role="alert">
      <AlertCircle size={20} className="shrink-0" />
      <div className="flex-1">
        {onRetry && <strong className="mb-1 block">We couldn’t load this information</strong>}
        <span>{message}</span>
      </div>
      {onRetry && (
        <button className="button secondary" onClick={onRetry}>
          <RotateCw size={15} />
          Try again
        </button>
      )}
    </div>
  );
}
export function EmptyState({
  title = 'No records yet',
  description = 'Entries will appear here once they are added.',
  action,
  icon: Icon = Inbox,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={27} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function StatusBadge({ value }) {
  const label = value === 'Dummy verified' ? 'Legacy demo' : value?.replaceAll('_', ' ');
  return (
    <span className={`badge ${String(value).toLowerCase().replaceAll(' ', '-')}`}>
      <i aria-hidden="true" />
      {label}
    </span>
  );
}
