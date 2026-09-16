import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Heart,
  Users,
  ClipboardCheck,
} from 'lucide-react';
import useDashboard from '../hooks/useDashboard';
import StatCard from '../components/StatCard';
import Logo from '../components/Logo';
import CategoryChart from '../features/dashboard/CategoryChart';
import { useAuth } from '../context/AuthContext';
import { useFestival } from '../context/FestivalContext';
import { Loading, ErrorNotice, EmptyState, StatusBadge } from '../components/Feedback';
import { money, dateLabel, managementRoles } from '../utils/format';
import SpendingChart from '../features/dashboard/SpendingChart';

export default function Home() {
  const { year } = useFestival();
  const { user } = useAuth();
  const { data, error, retry } = useDashboard(year);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const management = managementRoles.includes(user.role);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            Festival overview<span className="heading-dot">.</span>
          </h1>
          <p>
            {greeting}, {user.name.split(' ')[0]}. Here’s what’s happening in your community.
          </p>
        </div>
        {management && (
          <Link className="button primary" to="/collections">
            <Plus size={16} />
            Record a collection
          </Link>
        )}
      </div>
      <section className="festival-banner">
        <div className="hero-orbits" aria-hidden="true" />
        <div className="hero-copy">
          <span className="eyebrow">GANESH YOUTH · CELEBRATING TOGETHER</span>
          <h2>
            One community.
            <br />
            <span>Countless reasons to celebrate.</span>
          </h2>
          <p>A little devotion, a shared purpose, and a celebration made possible by you.</p>
          <div className="hero-chips">
            <span className="hero-chip">
              <Heart size={12} /> Built on togetherness
            </span>
            {data && (
              <span className="hero-chip">
                <Users size={12} />
                {data.members} active members
              </span>
            )}
            <span className="hero-chip">Festival workspace · {year}</span>
          </div>
        </div>
        <div className="banner-seal">
          <Logo variant="hero" label={false} />
          <span className="hero-year">2026</span>
          <span>GANESH YOUTH</span>
        </div>
      </section>
      {error ? (
        <ErrorNotice message={error} onRetry={retry} />
      ) : !data ? (
        <Loading variant="dashboard" />
      ) : (
        <>
          <section className="metrics" aria-label="Festival financial summary">
            {[
              [
                'Confirmed collections',
                data.collected,
                'Reviewed contributions received',
                ArrowDownLeft,
                'green',
              ],
              ['Approved expenses', data.spent, 'Reviewed spending only', ArrowUpRight, 'orange'],
              [
                'Recorded fund balance',
                data.cash_balance,
                'Collections minus approved expenses',
                Wallet,
                'dark',
              ],
              [
                'Festival budget',
                data.budget,
                `${money(data.remaining_budget)} budget remaining`,
                ClipboardCheck,
                'purple',
              ],
            ].map(([label, value, note, Icon, tone]) => (
              <StatCard
                key={label}
                label={label}
                value={value}
                note={note}
                icon={Icon}
                tone={tone}
              />
            ))}
          </section>
          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Spending through the year</h2>
                  <p>Approved expenses · {year}</p>
                </div>
                <span className="chart-legend">
                  <i /> Expenses
                </span>
              </div>
              <SpendingChart data={data.monthly_spend} />
            </section>
            <section className="panel audit-health">
              <div className="panel-heading">
                <div>
                  <h2>Review desk</h2>
                  <p>A little attention, a clearer ledger.</p>
                </div>
                <ShieldCheck size={22} />
              </div>
              <div className="review-stat">
                <span>Expenses awaiting review</span>
                <b>{data.pending_expenses}</b>
              </div>
              <div className="review-stat">
                <span>Collections awaiting review</span>
                <b>{data.pending_collections}</b>
              </div>
              <div className="review-stat">
                <span>Expenses without receipt evidence</span>
                <b>{data.missing_receipts}</b>
              </div>
              <div className="review-stat">
                <span>Active committee & volunteers</span>
                <b>{data.members}</b>
              </div>
              {data.legacy_payments > 0 && (
                <p className="notice warning">
                  {data.legacy_payments} legacy demo collection(s) excluded from totals.
                </p>
              )}
              {management && (
                <Link className="button secondary full-width" to="/expenses?status=pending">
                  Review expense entries
                  <ArrowUpRight size={16} />
                </Link>
              )}
              <p className="fine-print">
                Pending entries are excluded from posted totals. Fund balance is not a bank
                reconciliation.
              </p>
            </section>
          </div>
          <div className="dashboard-grid bottom-grid">
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent expense entries</h2>
                  <p>Latest records and their review status</p>
                </div>
                {management && (
                  <Link className="text-link" to="/expenses">
                    Full ledger
                    <ArrowUpRight size={15} />
                  </Link>
                )}
              </div>
              {!management ? (
                <EmptyState
                  title="Committee-managed records"
                  description="Your role has access to festival summary totals."
                />
              ) : !data.recent_expenses.length ? (
                <EmptyState
                  title="Your ledger starts here"
                  description="Add your first festival expense to begin the audit trail."
                />
              ) : (
                <div className="recent-list">
                  {data.recent_expenses.map((item, index) => (
                    <div
                      className="recent-row"
                      key={item.id}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <span className="entry-symbol">
                        <ArrowUpRight size={18} />
                      </span>
                      <div>
                        <strong>{item.description}</strong>
                        <small>
                          {item.category} · {dateLabel(item.spent_on)}
                        </small>
                      </div>
                      <StatusBadge value={item.status} />
                      <b>{money(item.amount)}</b>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Where we’re spending</h2>
                  <p>Approved expenses by category</p>
                </div>
              </div>
              {!data.expenses_by_category.length ? (
                <EmptyState
                  title="No approved spending"
                  description="Categories appear after expense approval."
                />
              ) : (
                <>
                  <CategoryChart data={data.expenses_by_category} total={data.spent} />
                  <div className="category-list">
                    {data.expenses_by_category.map((item, i) => (
                      <div key={item.category}>
                        <div>
                          <span>
                            <i
                              style={{
                                background: ['#f97316', '#f59e0b', '#10b981', '#818cf8'][i % 4],
                              }}
                            />
                            {item.category}
                          </span>
                          <strong>{money(item.amount)}</strong>
                        </div>
                        <div className="progress-track">
                          <span
                            style={{
                              width: `${Math.min(100, (Number(item.amount) / Number(data.spent || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
