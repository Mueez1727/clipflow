import Image from 'next/image'
import Link from 'next/link'
import {
  Brain,
  Cloud,
  MonitorPlay,
  Share2,
  Shield,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: MonitorPlay,
    title: 'Screen Recording',
    description:
      'Capture your screen and microphone with a lightweight desktop app built for creators and teams.',
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description:
      'Upload recordings securely to the cloud and access them from anywhere in your workspace.',
  },
  {
    icon: Brain,
    title: 'AI Video Summary',
    description:
      'Generate intelligent summaries and titles automatically so your videos are easier to discover.',
  },
  {
    icon: Users,
    title: 'Workspace Collaboration',
    description:
      'Organize videos into workspaces, invite teammates, and collaborate in one shared library.',
  },
  {
    icon: Shield,
    title: 'Secure Authentication',
    description:
      'Enterprise-grade sign-in powered by Clerk keeps your account and content protected.',
  },
  {
    icon: Share2,
    title: 'Video Sharing',
    description:
      'Share polished preview links instantly and keep your audience engaged with rich playback.',
  },
]

export default function Home() {
  return (
    <main className="overflow-hidden">
      <section className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="animate-slide-up space-y-8">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Record.
            <br />
            Upload.
            <br />
            Share.
            <br />
            <span className="clipflow-gradient-text">Collaborate.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            ClipFlow is a modern desktop and web platform for effortless screen recording,
            cloud storage, AI-powered video summaries, and workspace collaboration.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="btn-clipflow h-12 px-8 text-base">
                Get Started
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="btn-clipflow-outline h-12 px-8 text-base">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        <div className="animate-fade-in relative flex justify-center lg:justify-end">
          <div className="absolute inset-0 text-radial" />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border/50 transition-transform duration-300 hover:scale-[1.02]">
            <Image
              src="/Hero-img.png"
              alt="ClipFlow screen recording and collaboration platform"
              width={640}
              height={520}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mt-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to create and share</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From recording on desktop to sharing with your team, ClipFlow keeps your workflow fast,
            secure, and beautifully simple.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="clipflow-card group p-6"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] transition-colors group-hover:bg-[#7C3AED] group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
