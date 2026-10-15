import { useEffect, useState, type ReactNode } from 'react';
import { clockStr } from '../lib/util';

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
