function partyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] ?? '?').toUpperCase();
}

const sizeClasses = {
  md: 'w-10 h-10 text-[13px] rounded-full',
  lg: 'w-11 h-11 text-[14px] rounded-xl',
} as const;

interface ChatAvatarProps {
  src?: string | null;
  name: string;
  size?: keyof typeof sizeClasses;
  unread?: boolean;
  className?: string;
}

export default function ChatAvatar({
  src,
  name,
  size = 'md',
  unread = false,
  className = '',
}: ChatAvatarProps) {
  const initials = partyInitials(name);
  const ring = unread
    ? 'ring-2 ring-primary-400/40'
    : size === 'lg'
      ? 'ring-2 ring-white dark:ring-zinc-900 shadow-sm'
      : '';

  const base = `flex-shrink-0 ${sizeClasses[size]} overflow-hidden flex items-center justify-center font-semibold ${ring} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${base} object-cover bg-surface-100`}
      />
    );
  }

  const fallback =
    size === 'lg'
      ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
      : unread
        ? 'bg-primary-100 text-primary-700'
        : 'bg-surface-100 text-ink-600';

  return (
    <div className={`${base} ${fallback}`} aria-hidden>
      {initials}
    </div>
  );
}
