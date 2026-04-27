import clsx from 'clsx';
import type { MeasurementMode } from '@/lib/firebase';

interface ModeBadgeProps {
  mode: MeasurementMode;
  size?: 'sm' | 'md';
}

export default function ModeBadge({ mode, size = 'md' }: ModeBadgeProps) {
  const isSingle = mode === 'single';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide uppercase',
        isSingle
          ? 'bg-brand-yellow1/20 text-amber-700 border border-brand-yellow1/40'
          : 'bg-brand-navy/10 text-brand-navy border border-brand-navy/20',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'
      )}
    >
      <span
        className={clsx(
          'block rounded-full',
          isSingle ? 'bg-brand-yellow2' : 'bg-brand-navy',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
        )}
      />
      {isSingle ? 'Single' : 'ROT'}
    </span>
  );
}
