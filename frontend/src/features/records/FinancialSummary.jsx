import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardCheck,
  Clock3,
  Users,
  FileCheck2,
} from 'lucide-react';
import useDashboard from '../../hooks/useDashboard';
import StatCard from '../../components/StatCard';
import { ErrorNotice } from '../../components/Feedback';

export default function FinancialSummary({ resource, year, revision }) {
  const { data, error, retry } = useDashboard(year, revision);
  if (error) return <ErrorNotice message={error} onRetry={retry} />;
  if (!data)
    return (
      <div className="metrics" role="status" aria-label="Loading financial summary">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="skeleton h-36 rounded-2xl" />
        ))}
      </div>
    );
  const summaries = {
    expenses: [
      ['Approved expenses', data.spent, 'Reviewed spending for this year', ArrowUpRight, 'orange'],
      [
        'Recorded fund balance',
        data.cash_balance,
        'Collections less approved expenses',
        Wallet,
        'green',
      ],
      ['Festival budget', data.budget, 'Planned community spending', ClipboardCheck, 'purple'],
      [
        'Awaiting review',
        data.pending_expenses,
        'Expense entries to be checked',
        Clock3,
        'orange',
        false,
      ],
    ],
    payments: [
      [
        'Confirmed collections',
        data.collected,
        'Contributions reviewed and received',
        ArrowDownLeft,
        'green',
      ],
      [
        'Recorded fund balance',
        data.cash_balance,
        'Collections less approved expenses',
        Wallet,
        'orange',
      ],
      [
        'Awaiting confirmation',
        data.pending_collections,
        'Contributions pending review',
        Clock3,
        'purple',
        false,
      ],
      ['Active members', data.members, 'Our committee and volunteers', Users, 'orange', false],
    ],
    plans: [
      ['Festival budget', data.budget, 'Total planned spending', ClipboardCheck, 'purple'],
      ['Approved spending', data.spent, 'All approved festival expenses', ArrowUpRight, 'orange'],
      ['Budget remaining', data.remaining_budget, 'Budget less approved expenses', Wallet, 'green'],
      [
        'Awaiting review',
        data.pending_expenses,
        'Expenses excluded from posted totals',
        FileCheck2,
        'orange',
        false,
      ],
    ],
  };
  return (
    <section className="metrics" aria-label={`${year} financial summary`}>
      {summaries[resource].map(([label, value, note, Icon, tone, currency = true]) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          note={note}
          icon={Icon}
          tone={tone}
          currency={currency}
        />
      ))}
    </section>
  );
}
