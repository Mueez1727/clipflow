'use client'

import { BrandLogo } from '@/components/website/brand-logo'
import { ThemeToggle } from '@/components/website/theme-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#contact', label: 'Contact' },
]

export default function LandingPageNavBar() {
  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'nav-link text-sm font-medium text-foreground/80',
            mobile && 'block py-3 text-base'
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  )

  return (
    <header className="sticky top-0 z-50 -mx-4 mb-6 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <nav className="glass-nav mx-auto flex h-[70px] max-w-7xl items-center justify-between rounded-2xl px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-background">
              <div className="mb-8 mt-2">
                <BrandLogo />
              </div>
              <div className="flex flex-col gap-1">
                <NavLinks mobile />
              </div>
              <div className="mt-8 flex items-center gap-3">
                <ThemeToggle />
                <Link href="/auth/sign-in" className="flex-1">
                  <Button className="btn-clipflow w-full gap-2">
                    <User className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <BrandLogo />
        </div>

        <div className="hidden items-center gap-8 lg:flex">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link href="/auth/sign-in">
            <Button className="btn-clipflow gap-2 px-4 sm:px-6">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
