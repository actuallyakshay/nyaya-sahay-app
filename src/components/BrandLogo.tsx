import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

import logoUrl from '@/assets/logo.png';

const sizePx = {
  sm: 32,
  md: 36,
  lg: 40,
  xl: 48,
} as const;

const textStyles = {
  header: 'font-serif text-xl font-bold text-navy',
  headerCompact: 'font-serif text-lg font-bold text-navy',
  sidebar: 'font-serif text-lg font-bold text-primary-foreground',
  footer: 'font-serif text-lg font-bold text-primary-foreground',
} as const;

export type BrandLogoProps = {
  to?: string;
  /** Use `div` for decorative marks (no navigation). */
  as?: 'link' | 'div';
  size?: keyof typeof sizePx | number;
  showText?: boolean;
  textVariant?: keyof typeof textStyles;
  className?: string;
  imgClassName?: string;
};

export function BrandLogo({
  to = ROUTES.home,
  as = 'link',
  size = 'md',
  showText = true,
  textVariant = 'header',
  className,
  imgClassName,
}: BrandLogoProps) {
  const dim = typeof size === 'number' ? size : sizePx[size];

  const inner = (
    <>
      <img
        src={logoUrl}
        alt=""
        width={dim}
        height={dim}
        className={cn('shrink-0 rounded-full object-cover', imgClassName)}
        decoding="async"
      />
      {showText && <span className={textStyles[textVariant]}>NyayaSetu</span>}
    </>
  );

  if (as === 'div') {
    return (
      <div className={cn('flex items-center gap-2.5', className)}>{inner}</div>
    );
  }

  return (
    <Link
      to={to}
      className={cn('flex items-center gap-2.5', className)}
      aria-label="NyayaSetu home"
    >
      {inner}
    </Link>
  );
}
