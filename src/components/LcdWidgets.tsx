import { useEffect, useState, type ReactNode } from 'react';
import { clockStr, formatMdyDateDigits, toMdyDate } from '../lib/util';

export function LcdChrome({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const [clock, setClock] = useState(clockStr);

  useEffect(() => {
    const id = window.setInterval(() => setClock(clockStr()), 10000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="lcd-screen">
      <div className="lcd-bar">
        <span>{title}</span>
        <span>{right ?? clock}</span>
      </div>
      <div className="lcd-body">{children}</div>
    </div>
  );
}

export function LcdBtn({
  children,
  onClick,
  danger,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`lcd-btn${danger ? ' danger' : ''}${active ? ' active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function LcdEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="lcd-empty">
      <div>
        <div>{title}</div>
        {hint ? <div className="lcd-empty-sub">{hint}</div> : null}
      </div>
    </div>
  );
}

export function LcdField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="lcd-field">
      <label>
        {label}
        {children}
      </label>
    </div>
  );
}

/** Text date so the PDA keypad can type it — native date pickers steal focus. */
export function LcdDateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      className="lcd-input"
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="MM-DD-YYYY"
      maxLength={10}
      data-date="mdy"
      value={toMdyDate(value)}
      onChange={(e) => onChange(formatMdyDateDigits(e.target.value))}
      onKeyDown={(e) => {
        if (e.key !== 'Backspace') return;
        e.preventDefault();
        onChange(formatMdyDateDigits(toMdyDate(value).replace(/\D/g, '').slice(0, -1)));
      }}
    />
  );
}
