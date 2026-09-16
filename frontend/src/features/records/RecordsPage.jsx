import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Download,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  ShieldCheck,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useFestival } from '../../context/FestivalContext';
import { useAuth } from '../../context/AuthContext';
import useRecords from '../../hooks/useRecords';
import { recordConfig } from './config';
import RecordForm from './RecordForm';
import ReviewDialog from './ReviewDialog';
import Modal from '../../components/Modal';
import { ErrorNotice, Loading, EmptyState } from '../../components/Feedback';
import Toast from '../../components/Toast';
import FinancialSummary from './FinancialSummary';
import RecordList from './RecordList';
import BudgetCards from './BudgetCards';
import { exportRecords } from '../../api/records';
import { errorMessage } from '../../api/client';
import { categories } from '../../utils/format';

export default function RecordsPage({ resource }) {
  const config = recordConfig[resource];
  const { year } = useFestival();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [editing, setEditing] = useState(undefined);
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [summaryRevision, setSummaryRevision] = useState(0);
  const [view, setView] = useState('cards');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('page');
        return next;
      },
      { replace: true },
    );
    setEditing(undefined);
    setSelected(null);
  }, [year, setSearchParams]);
  const params = {
    year,
    search: debouncedSearch,
    page,
    ...(config.review || resource === 'plans' ? { status } : {}),
    ...(['expenses', 'plans'].includes(resource) ? { category } : {}),
  };
  const records = useRecords(resource, params);
  const changeFilter = (key, value) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        return next;
      },
      { replace: true },
    );
  };
  const download = async (format) => {
    setExporting(true);
    setActionError('');
    try {
      await exportRecords(resource, { ...params, page: undefined }, format);
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setExporting(false);
    }
  };
  const saved = () => {
    setEditing(undefined);
    setSelected(null);
    setNotice('Record saved successfully.');
    setSummaryRevision((value) => value + 1);
    records.reload();
  };
  const canWrite = config.writeRoles.includes(user.role);
  const statuses =
    resource === 'payments'
      ? ['pending', 'confirmed', 'rejected', 'void', 'Dummy verified']
      : resource === 'plans'
        ? ['Planning', 'In progress', 'Completed', 'Cancelled']
        : ['pending', 'approved', 'rejected', 'void'];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            {config.title}
            <span className="heading-dot">.</span>
          </h1>
          <p>{config.description}</p>
        </div>
        {canWrite && (
          <button
            className="button primary"
            onClick={() => {
              setNotice('');
              setEditing(null);
            }}
          >
            <Plus size={17} />
            Add {config.singular}
          </button>
        )}
      </div>
      <Toast message={notice} onClose={() => setNotice('')} />
      {actionError && <ErrorNotice message={actionError} />}
      {['expenses', 'payments', 'plans'].includes(resource) && (
        <FinancialSummary resource={resource} year={year} revision={summaryRevision} />
      )}
      {resource === 'members' && (
        <div className="record-context">
          <Users size={19} />
          <span>
            <strong>A community made by its people.</strong> Manage responsibilities, contact
            details, and active volunteers.
          </span>
        </div>
      )}
      {resource === 'audit' && (
        <div className="record-context">
          <ShieldCheck size={19} />
          <span>
            <strong>Clarity in every change.</strong> Review who changed a record, when it happened,
            and the before-and-after details.
          </span>
        </div>
      )}
      <section className="panel records-panel">
        <div className="records-heading">
          <h2>
            {resource === 'members'
              ? 'Member directory'
              : resource === 'audit'
                ? 'Activity history'
                : resource === 'plans'
                  ? 'Festival plans'
                  : 'All entries'}
            {!records.loading && !records.error && (
              <span className="count-pill">{records.count}</span>
            )}
          </h2>
          {resource === 'plans' && (
            <div className="segmented-control" role="group" aria-label="Budget view">
              <button aria-pressed={view === 'cards'} onClick={() => setView('cards')}>
                <LayoutGrid size={13} />
                Cards
              </button>
              <button aria-pressed={view === 'table'} onClick={() => setView('table')}>
                <List size={13} />
                Table
              </button>
            </div>
          )}
        </div>
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label={`Search ${config.title}`}
              placeholder={
                resource === 'members'
                  ? 'Search members…'
                  : resource === 'payments'
                    ? 'Search contributions…'
                    : 'Search records…'
              }
              value={search}
              onChange={(e) => changeFilter('search', e.target.value)}
            />
          </label>
          <div className="table-filters">
            {(config.review || resource === 'plans') && (
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(e) => changeFilter('status', e.target.value)}
              >
                <option value="">All statuses</option>
                {statuses.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            )}
            {['expenses', 'plans'].includes(resource) && (
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(e) => changeFilter('category', e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            )}
            {
              <>
                <button
                  className="button secondary compact"
                  disabled={exporting}
                  onClick={() => download('csv')}
                >
                  <Download size={15} />
                  CSV
                </button>
                <button
                  className="button secondary compact"
                  disabled={exporting}
                  onClick={() => download('xlsx')}
                >
                  <FileText size={15} />
                  XLSX
                </button>
              </>
            }
          </div>
        </div>
        {records.error ? (
          <ErrorNotice message={records.error} onRetry={records.reload} />
        ) : records.loading ? (
          <Loading />
        ) : !records.results.length ? (
          <EmptyState
            title="No matching records"
            description="Try a different filter or add a record for this festival year."
            action={
              canWrite ? (
                <button className="button primary" onClick={() => setEditing(null)}>
                  <Plus size={16} />
                  Add {config.singular}
                </button>
              ) : null
            }
          />
        ) : resource === 'plans' && view === 'cards' ? (
          <BudgetCards records={records.results} canWrite={canWrite} onEdit={setEditing} />
        ) : (
          <RecordList
            resource={resource}
            config={config}
            records={records.results}
            year={year}
            canWrite={canWrite}
            onEdit={setEditing}
            onSelect={setSelected}
          />
        )}
        <div className="table-footer">
          <span>
            {records.count} record{records.count === 1 ? '' : 's'}
            {resource === 'members' ? ' · Complete directory' : ` · Festival year ${year}`}
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Previous page"
              disabled={records.loading || page <= 1}
              onClick={() => changeFilter('page', String(page - 1))}
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              Page {page} of {Math.max(1, Math.ceil(records.count / 25))}
            </span>
            <button
              className="icon-button"
              aria-label="Next page"
              disabled={records.loading || !records.next}
              onClick={() => changeFilter('page', String(page + 1))}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
      {config.review && (
        <p className="fine-print">
          Financial entries are retained for audit. To correct a posted entry, have another reviewer
          void it with a reason, then submit a replacement referencing the original.
        </p>
      )}
      {editing !== undefined && (
        <RecordForm
          resource={resource}
          config={config}
          year={year}
          record={editing}
          onClose={() => setEditing(undefined)}
          onSaved={saved}
        />
      )}
      {selected && config.review && (
        <ReviewDialog
          resource={resource}
          record={selected}
          year={year}
          onClose={() => setSelected(null)}
          onSaved={saved}
        />
      )}
      {selected && resource === 'audit' && (
        <Modal title="Recorded changes" onClose={() => setSelected(null)}>
          <p>{selected.summary}</p>
          <div className="snapshot-grid">
            <section>
              <h3>Before</h3>
              <pre>{JSON.stringify(selected.before, null, 2)}</pre>
            </section>
            <section>
              <h3>After</h3>
              <pre>{JSON.stringify(selected.after, null, 2)}</pre>
            </section>
          </div>
        </Modal>
      )}
    </>
  );
}
