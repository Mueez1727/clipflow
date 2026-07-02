import { BrandLogo } from '@/components/website/brand-logo'
import Link from 'next/link'
import { Globe, Mail, Share2 } from 'lucide-react'

export function WebsiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/50">
      <div className="container mx-auto grid gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          <BrandLogo />
          <p className="max-w-md text-sm text-muted-foreground">
            ClipFlow is a modern desktop and web platform for effortless screen recording,
            cloud storage, AI-powered video summaries, and workspace collaboration.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Product</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="transition-colors hover:text-[#7C3AED]">
                Home
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="transition-colors hover:text-[#7C3AED]">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-[#7C3AED]">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Connect</h3>
          <div className="flex gap-3">
            <a
              href="mailto:hello@clipflow.app"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-all hover:scale-105 hover:border-[#7C3AED]/40 hover:text-[#7C3AED]"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-all hover:scale-105 hover:border-[#7C3AED]/40 hover:text-[#7C3AED]"
              aria-label="Website"
            >
              <Globe className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-all hover:scale-105 hover:border-[#7C3AED]/40 hover:text-[#7C3AED]"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ClipFlow. All rights reserved.
      </div>
    </footer>
  )
}
