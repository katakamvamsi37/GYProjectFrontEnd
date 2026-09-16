import { useEffect, useId, useRef, useState } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
const options = [
  ['light', 'Light', Sun],
  ['dark', 'Dark', Moon],
  ['system', 'System', Monitor],
];
export default function ThemeSwitcher({ expanded = false }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const id = useId();
  const Icon = options.find(([value]) => value === theme)[2];
  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    ref.current?.querySelector('[aria-pressed="true"]')?.focus();
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const select = (value) => {
    setTheme(value);
    setOpen(false);
    if (!expanded) ref.current?.querySelector('.theme-trigger')?.focus();
  };
  return (
    <div
      className={`theme-switcher ${expanded ? 'expanded' : ''}`}
      ref={ref}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false);
          ref.current?.querySelector('.theme-trigger')?.focus();
        }
        if (
          ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) &&
          (open || expanded)
        ) {
          event.preventDefault();
          const buttons = [...ref.current.querySelectorAll('[aria-pressed]')];
          const current = buttons.indexOf(document.activeElement);
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? 2
                : (current + (['ArrowUp', 'ArrowLeft'].includes(event.key) ? 2 : 1)) % 3;
          buttons[next]?.focus();
        }
      }}
    >
      {!expanded && (
        <button
          type="button"
          className="icon-button theme-trigger"
          aria-label="Choose appearance"
          title="Choose appearance"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          <Icon size={19} />
        </button>
      )}
      {(expanded || open) && (
        <div
          id={id}
          className={expanded ? 'theme-options' : 'theme-popover'}
          role="group"
          aria-label="Appearance"
        >
          {!expanded && <p className="nav-caption">APPEARANCE</p>}
          {options.map(([value, label, OptionIcon]) => (
            <button
              type="button"
              key={value}
              className={`theme-option ${theme === value ? 'selected' : ''}`}
              aria-pressed={theme === value}
              onClick={() => select(value)}
            >
              {expanded && (
                <span className={`theme-preview preview-${value}`} aria-hidden="true">
                  <i />
                  <span>
                    <b />
                    <b />
                    <b />
                  </span>
                </span>
              )}
              <span className="flex items-center gap-2.5">
                <OptionIcon size={17} />
                {label}
              </span>
              {theme === value && <Check size={16} className="theme-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
