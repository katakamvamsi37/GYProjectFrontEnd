import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';
export default function Toast({ message, onClose, tone = 'success' }) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : Info;
  if (!message) return null;
  return (
    <div className={`toast ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={21} />
      <span>{message}</span>
      <button
        type="button"
        className="icon-button"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
