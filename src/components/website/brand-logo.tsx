import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const CLIPFLOW_LOGO = '/Clipflow-Icon.png'

type BrandLogoProps = {
  className?: string
  showText?: boolean
  textClassName?: string
  size?: number
}

export function BrandLogo({
  className,
  showText = true,
  textClassName,
  size = 36,
}: BrandLogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5 group', className)}>
      <Image
        src={CLIPFLOW_LOGO}
        alt="ClipFlow logo"
        width={size}
        height={size}
        className="h-9 w-9 shrink-0 object-contain transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10"
        style={{ width: size, height: size }}
        priority
      />
      {showText && (
        <span
          className={cn(
            'text-xl font-bold tracking-tight clipflow-gradient-text sm:text-2xl',
            textClassName
          )}
        >
          ClipFlow
        </span>
      )}
    </Link>
  )
}
