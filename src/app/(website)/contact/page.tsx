'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Globe, Mail, MapPin, Phone, Share2 } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

export default function ContactPage() {
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
    <main className="animate-fade-in">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Contact Us</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Have a question about ClipFlow? We&apos;d love to hear from you. Reach out and our team
          will respond as soon as possible.
        </p>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="clipflow-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Get in touch</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#7C3AED]" />
                <a href="mailto:hello@clipflow.app" className="hover:text-[#7C3AED]">
                  hello@clipflow.app
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#7C3AED]" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#7C3AED]" />
                <span>123 Innovation Drive, Tech Campus, CA 94000</span>
              </li>
            </ul>
          </div>

          <div className="clipflow-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Follow us</h3>
            <div className="flex gap-3">
              {[Globe, Share2, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background transition-all hover:scale-105 hover:border-[#7C3AED]/40 hover:text-[#7C3AED]"
                  aria-label="Social link"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="clipflow-card space-y-5 p-6 sm:p-8">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Your name"
              className="rounded-xl border-border focus-visible:ring-[#7C3AED]"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="rounded-xl border-border focus-visible:ring-[#7C3AED]"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
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
            {submitting ? 'Sending...' : 'Submit'}
          </Button>
        </form>
      </div>
    </main>
  )
}
