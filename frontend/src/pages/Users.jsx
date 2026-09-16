import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import useRecords from '../hooks/useRecords';
import { signup, updateAccess } from '../api/auth';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ResetPasswordDialog from '../components/ResetPasswordDialog';
import Avatar from '../components/Avatar';
import Toast from '../components/Toast';
import { ErrorNotice, Loading, EmptyState } from '../components/Feedback';

const roles = ['admin', 'treasurer', 'secretary', 'coordinator', 'member'];
export default function Users() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const records = useRecords('users', { page });
  const [selected, setSelected] = useState(undefined);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [passwordAccount, setPasswordAccount] = useState(null);
  const [message, setMessage] = useState('');
  const open = (account) => {
    setError('');
    setSelected(account);
    setForm(
      account
        ? { role: account.role, is_active: account.is_active }
        : { name: '', email: '', phone: '', password: '', role: 'member' },
    );
  };
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (selected) await updateAccess(selected.id, form);
      else await signup(form);
      setMessage(selected ? 'Account access updated.' : 'Account created successfully.');
      setSelected(undefined);
      records.reload();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            Access management<span className="heading-dot">.</span>
          </h1>
          <p>Grant the right responsibilities to the right people.</p>
        </div>
        <button className="button primary" onClick={() => open(null)}>
          <Plus size={17} />
          Create account
        </button>
      </div>
      <div className="notice info">
        Accounts created here are immediately active. Share initial credentials privately, and ask
        the member to change their password in My profile.
      </div>
      <Toast message={message} onClose={() => setMessage('')} />
      <section className="panel records-panel">
        <div className="records-heading pb-5">
          <h2>
            Community accounts{' '}
            {!records.loading && !records.error && (
              <span className="count-pill">{records.count}</span>
            )}
          </h2>
        </div>
        {records.error ? (
          <ErrorNotice message={records.error} onRetry={records.reload} />
        ) : records.loading ? (
          <Loading />
        ) : !records.results.length ? (
          <EmptyState />
        ) : (
          <div className="table-scroll responsive-account-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email / username</th>
                  <th>Mobile number</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.results.map((account) => (
                  <tr key={account.id}>
                    <td data-label="Account">
                      <span className="person-cell">
                        <Avatar user={account} />
                        <strong>{account.name}</strong>
                      </span>
                    </td>
                    <td data-label="Email / username">{account.email || account.username}</td>
                    <td data-label="Mobile number">{account.phone || 'Not added'}</td>
                    <td data-label="Role">{account.authority}</td>
                    <td data-label="Status">
                      <span className={`badge ${account.is_active ? 'approved' : 'void'}`}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      {account.id !== user.id && (
                        <div className="account-actions">
                          <button className="table-action" onClick={() => open(account)}>
                            Manage access
                          </button>
                          <button
                            className="table-action"
                            onClick={() => {
                              setMessage('');
                              setPasswordAccount(account);
                            }}
                          >
                            Reset password
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>{records.count} registered accounts</span>
          <div>
            <button
              className="icon-button"
              aria-label="Previous page"
              disabled={page <= 1 || records.loading}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <span>Page {page}</span>
            <button
              className="icon-button"
              aria-label="Next page"
              disabled={!records.next || records.loading}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
      {selected !== undefined && (
        <Modal
          title={selected ? `Manage ${selected.name}` : 'Create committee account'}
          onClose={() => setSelected(undefined)}
          busy={busy}
        >
          <form className="record-form" onSubmit={save}>
            <fieldset className="form-grid" disabled={busy}>
              {!selected && (
                <>
                  <label>
                    Full name
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </label>
                  <label className="span-two">
                    Mobile number (optional)
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="10-digit Indian number or +country code"
                    />
                    <small>This number can be used to sign in with the account password.</small>
                  </label>
                  <label className="span-two">
                    Initial password
                    <input
                      type="password"
                      required
                      minLength={10}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <small>
                      At least 10 characters; common and entirely numeric passwords are rejected.
                    </small>
                  </label>
                </>
              )}
              <label>
                Role
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {roles.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </label>
              {selected && (
                <label>
                  Account active
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                </label>
              )}
            </fieldset>
            {error && <ErrorNotice message={error} />}
            <div className="form-actions">
              <button
                className="button secondary"
                type="button"
                disabled={busy}
                onClick={() => setSelected(undefined)}
              >
                Cancel
              </button>
              <button className="button primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {passwordAccount && (
        <ResetPasswordDialog
          account={passwordAccount}
          onClose={() => setPasswordAccount(null)}
          onSuccess={(message) => {
            setMessage(message);
            setPasswordAccount(null);
          }}
        />
      )}
    </>
  );
}
