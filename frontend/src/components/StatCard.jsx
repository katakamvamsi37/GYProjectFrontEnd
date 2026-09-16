import { useEffect, useState } from 'react';
import { money } from '../utils/format';
export default function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = 'orange',
  currency = true,
}) {
  const number = Number(value || 0);
  const [display, setDisplay] = useState(number);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(number);
      return;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 650);
      setDisplay(number * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [number]);
  return (
    <article
      className={`metric ${tone}`}
      style={{ '--value-length': (currency ? money(number) : String(number)).length }}
    >
      <div className="metric-label">
        <span>{label}</span>
        <span className="metric-icon">
          <Icon size={19} />
        </span>
      </div>
      <strong aria-label={currency ? money(number) : String(number)}>
        <span aria-hidden="true">
          {currency ? money(display) : Math.round(display).toLocaleString('en-IN')}
        </span>
      </strong>
      <small>{note}</small>
    </article>
  );
}
