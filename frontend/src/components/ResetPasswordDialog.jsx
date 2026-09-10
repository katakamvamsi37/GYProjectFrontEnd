import { useState } from 'react';
import { resetUserPassword } from '../api/auth';
import { errorMessage } from '../api/client';
import Modal from './Modal';
import { ErrorNotice } from './Feedback';

export default function ResetPasswordDialog({ account, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await resetUserPassword(account.id, password);
      onSuccess(`Password updated for ${account.name}. They must sign in again.`);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title={`Reset password for ${account.name}`} onClose={onClose} busy={busy}>
      <form className="record-form" onSubmit={submit}>
        <p className="notice info">
          This signs the account out of existing sessions. Share the new password privately.
        </p>
        <label>
          New password
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            disabled={busy}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <small>Use at least 10 characters. Avoid common or entirely numeric passwords.</small>
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            disabled={busy}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        {error && <ErrorNotice message={error} />}
        <div className="form-actions">
          <button className="button secondary" type="button" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={busy}>
            {busy ? 'Updating password…' : 'Update password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
