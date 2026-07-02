import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'FREE',
    price: '$0',
    description: 'Perfect for getting started with ClipFlow.',
    highlighted: false,
    features: [
      '5 minute recording',
      'Workspace',
      'Cloud Storage',
      'Share videos',
    ],
    cta: 'Get Started Free',
    href: '/auth/sign-up',
  },
  {
    name: 'PRO',
    price: '$99',
    period: '/month',
    description: 'Unlock AI features and unlimited recording for power users.',
    highlighted: true,
    features: [
      'Unlimited recording',
      'AI Summary',
      'AI Title Generation',
      'Priority Processing',
      'Team Collaboration',
    ],
    cta: 'Upgrade to Pro',
    href: '/auth/sign-up',
  },
]

export default function PricingPage() {
  return (
    <main className="animate-fade-in">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Simple, transparent pricing</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Choose the plan that fits your workflow. Upgrade anytime as your team grows.
        </p>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              'clipflow-card relative flex flex-col p-8',
              plan.highlighted &&
                'border-[#7C3AED]/50 shadow-lg shadow-[#7C3AED]/10 ring-1 ring-[#7C3AED]/30'
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#7C3AED] px-4 py-1 text-xs font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#7C3AED]">
                {plan.name}
              </p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="mb-2 text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/15 text-[#7C3AED]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href={plan.href}>
              <Button
                className={cn(
                  'h-12 w-full rounded-xl text-base',
                  plan.highlighted ? 'btn-clipflow' : 'btn-clipflow-outline'
                )}
              >
                {plan.cta}
              </Button>
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}
