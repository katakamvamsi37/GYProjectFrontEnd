import { Pencil, ArrowUpRight, History } from 'lucide-react';
import Avatar from '../../components/Avatar';
import { StatusBadge } from '../../components/Feedback';

export default function RecordList({
  resource,
  config,
  records,
  year,
  canWrite,
  onEdit,
  onSelect,
}) {
  const cell = (record, [key, , render]) => {
    if (key === 'status') return <StatusBadge value={record[key]} />;
    if (key === 'active') return <StatusBadge value={record[key] ? 'Active' : 'Inactive'} />;
    if (['name', 'donor_name'].includes(key))
      return (
        <span className="person-cell">
          <Avatar user={{ name: record[key] || 'Member' }} />
          <span>
            <strong>{record[key]}</strong>
            {resource === 'payments' && <small>Community contribution</small>}
          </span>
        </span>
      );
    if (['amount', 'budget', 'spent'].includes(key))
      return <span className="amount-cell">{render(record[key])}</span>;
    return render ? render(record[key]) : record[key] || '—';
  };
  const actions = (record) =>
    config.review ? (
      <button className="table-action" onClick={() => onSelect(record)}>
        View / review
        <ArrowUpRight size={13} />
      </button>
    ) : resource === 'audit' ? (
      <button className="table-action" onClick={() => onSelect(record)}>
        <History size={13} />
        Changes
      </button>
    ) : canWrite ? (
      <button className="table-action" onClick={() => onEdit(record)}>
        <Pencil size={13} />
        Edit
      </button>
    ) : (
      <span className="text-xs text-muted">View only</span>
    );
  return (
    <>
      <div className="table-scroll records-table">
        <table>
          <caption className="sr-only">
            {config.title} for festival year {year}
          </caption>
          <thead>
            <tr>
              {config.columns.map(([key, title]) => (
                <th scope="col" key={key}>
                  {title}
                </th>
              ))}
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                {config.columns.map((column) => (
                  <td key={column[0]}>{cell(record, column)}</td>
                ))}
                <td>{actions(record)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-records">
        {records.map((record) => {
          const first = config.columns[0];
          const statusColumn = config.columns.find(([key]) => ['status', 'active'].includes(key));
          return (
            <article className="record-card" key={record.id}>
              <div className="record-card-header">
                <h3>{cell(record, first)}</h3>
                {statusColumn && cell(record, statusColumn)}
              </div>
              <dl>
                {config.columns
                  .slice(1)
                  .filter(([key]) => !['status', 'active'].includes(key))
                  .map((column) => (
                    <div key={column[0]}>
                      <dt>{column[1]}</dt>
                      <dd>{cell(record, column)}</dd>
                    </div>
                  ))}
              </dl>
              <div className="record-card-footer">
                <span className="text-[10px] text-muted">
                  {resource === 'members' ? 'Community directory' : `Festival year ${year}`}
                </span>
                {actions(record)}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
