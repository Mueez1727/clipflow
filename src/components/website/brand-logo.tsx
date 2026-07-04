import Link from 'next/link'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  textClassName?: string
}

export function BrandLogo({ className, textClassName }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center transition-all duration-300 ease-in-out',
        'hover:scale-[1.04] hover:translate-y-[-1px]',
        className
      )}
    >
      <span
        className={cn(
          'text-xl font-bold tracking-tight clipflow-gradient-text sm:text-2xl',
          'transition-all duration-300 ease-in-out',
          'group-hover:drop-shadow-[0_0_14px_rgba(124,58,237,0.45)]',
          textClassName
        )}
      >
        ClipFlow
      </span>
    </Link>
  )
}

/** @deprecated Use text-only BrandLogo. Kept for legacy imports. */
export const CLIPFLOW_LOGO = '/Clipflow-Icon.png'
