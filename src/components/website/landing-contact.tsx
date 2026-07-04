'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Globe, Mail, Share2 } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

export function LandingContactSection() {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      toast.success('Message sent! We will get back to you soon.')
      event.currentTarget.reset()
    }, 600)
  }

  return (
    <section id="contact" className="mt-24 scroll-mt-28">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Contact</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Questions about ClipFlow? Reach out and we&apos;ll get back to you.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <div className="clipflow-card space-y-6 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-foreground">Get in touch</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-[#7C3AED]" />
              <a
                href="mailto:hello@clipflow.app"
                className="text-foreground/90 hover:text-[#7C3AED]"
              >
                hello@clipflow.app
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Share2 className="h-5 w-5 shrink-0 text-[#7C3AED]" />
              <a
                href="https://github.com/Mueez1727/clipflow-desktop-app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/90 hover:text-[#7C3AED]"
              >
                GitHub
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Globe className="h-5 w-5 shrink-0 text-[#7C3AED]" />
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/90 hover:text-[#7C3AED]"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="clipflow-card space-y-5 p-6 sm:p-8">
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-foreground">
              Name
            </label>
            <Input
              id="contact-name"
              name="name"
              required
              placeholder="Your name"
              className="rounded-xl border-border focus-visible:ring-[#7C3AED]"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="rounded-xl border-border focus-visible:ring-[#7C3AED]"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-foreground">
              Message
            </label>
            <Textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              placeholder="How can we help?"
              className="rounded-xl border-border focus-visible:ring-[#7C3AED]"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="btn-clipflow h-12 w-full text-base"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </section>
  )
}
