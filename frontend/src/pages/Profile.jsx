import { useEffect, useRef, useState } from 'react';
import { Save, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/profile';
import { changePassword } from '../api/auth';
import { saveSession, errorMessage } from '../api/client';
import { ErrorNotice } from '../components/Feedback';
import Avatar from '../components/Avatar';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState('');
  const fileInput = useRef(null);
  useEffect(() => {
    if (!avatar) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(avatar);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [busy, setBusy] = useState(false);
  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setMessage('');
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError('Choose a JPEG, PNG or WebP image no larger than 5 MB.');
      event.target.value = '';
      setAvatar(null);
      return;
    }
    setAvatar(file);
  };
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { data } = await updateProfile(user.id, form, avatar);
      updateUser(data.user);
      setForm({ name: data.user.name, email: data.user.email, phone: data.user.phone });
      setAvatar(null);
      if (fileInput.current) fileInput.current.value = '';
      setMessage('Profile updated.');
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  const change = async (event) => {
    event.preventDefault();
    setBusy(true);
    setPasswordError('');
    try {
      await changePassword(passwords);
      saveSession(null);
      window.dispatchEvent(new Event('gy:session-expired'));
    } catch (error) {
      setPasswordError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            My profile<span className="heading-dot">.</span>
          </h1>
          <p>Your identity and responsibilities in the festival committee.</p>
        </div>
      </div>
      <div className="profile-grid">
        <section className="panel">
          <div className="profile-summary">
            <Avatar user={user} src={preview || user.avatar_url} large />
            <div>
              <h2>{user.name}</h2>
              <p>{user.authority}</p>
            </div>
            <ShieldCheck />
          </div>
          <form className="record-form" onSubmit={save}>
            <label className="profile-photo-picker">
              Profile photo
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={choosePhoto}
              />
              <small>Choose a photo from your device. JPEG, PNG or WebP, up to 5 MB.</small>
              {avatar && <small>Preview selected. Save profile to upload this photo.</small>}
            </label>
            <div className="form-grid">
              {[
                ['name', 'Full name', 'text'],
                ['email', 'Email address', 'email'],
                ['phone', 'Mobile number', 'tel'],
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    type={type}
                    disabled={busy}
                    required={key === 'name' || key === 'email'}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                  {key === 'phone' && <small>Use this number with your password to sign in.</small>}
                </label>
              ))}
            </div>
            {error && <ErrorNotice message={error} />}
            {message && (
              <p className="notice success" role="status">
                {message}
              </p>
            )}
            <button className="button primary" disabled={busy}>
              <Save size={16} />
              Save profile
            </button>
          </form>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Change password</h2>
              <p>You’ll sign in again after changing it.</p>
            </div>
            <KeyRound size={20} />
          </div>
          <form className="record-form" onSubmit={change}>
            <label>
              Current password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={passwords.current_password}
                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
              />
            </label>
            <label>
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={10}
                required
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              />
            </label>
            {passwordError && <ErrorNotice message={passwordError} />}
            <button className="button secondary" disabled={busy}>
              Update password
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
