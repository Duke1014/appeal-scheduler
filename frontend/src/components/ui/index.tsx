import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// ── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', loading, children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-body font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400';
  const variants = {
    primary:   'bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/15',
    ghost:     'text-slate-400 hover:text-white hover:bg-white/10',
    danger:    'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/40',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>}
      <input
        id={id}
        className={cn(
          'px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          'transition-colors duration-150',
          error && 'border-red-500/60',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>}
      <select
        id={id}
        className={cn(
          'px-3 py-2 rounded-lg text-sm bg-slate-900 border border-white/10 text-white',
          'focus:outline-none focus:ring-2 focus:ring-brand-500',
          error && 'border-red-500/60',
          className
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl glass p-5', className)}>
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  const colors: Record<BadgeVariant, string> = {
    default: 'bg-white/10 text-slate-300',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    danger:  'bg-red-500/15 text-red-400',
    info:    'bg-brand-500/15 text-brand-300',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors[variant])}>
      {children}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

export function Avatar({ src, name, size = 'md' }: { src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' };
  const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover ring-2 ring-white/10', sizes[size])} />;
  }
  return (
    <div className={cn('rounded-full bg-brand-700 text-white font-semibold flex items-center justify-center ring-2 ring-white/10', sizes[size])}>
      {initials}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

export function EventStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    scheduled: 'info', active: 'success', cancelled: 'danger', completed: 'default', postponed: 'warning',
  };
  return <Badge variant={map[status] ?? 'default'}>{status}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, BadgeVariant> = { admin: 'danger', employee: 'warning', volunteer: 'info' };
  return <Badge variant={map[role] ?? 'default'}>{role}</Badge>;
}