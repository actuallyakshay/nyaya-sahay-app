import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { PublicLayout } from '@/layouts/PublicLayout';
import { mockPlans } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  MessageSquare,
  Scale,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
};

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified Advocates',
    desc: 'Every lawyer is bar-verified with High Court and District Court credentials.',
  },
  {
    icon: Shield,
    title: 'Fully Encrypted',
    desc: 'Your documents, chats, and consultations are end-to-end encrypted.',
  },
  {
    icon: Clock,
    title: '24-Hour Response',
    desc: 'Get matched with a lawyer and receive initial advice within 24 hours.',
  },
  {
    icon: MessageSquare,
    title: 'Chat, Call & Video',
    desc: 'Consult your lawyer via text, phone call, or video — whatever works for you.',
  },
  {
    icon: FileText,
    title: 'Document Drafting',
    desc: 'Get legal notices, agreements, and petitions drafted by experts.',
  },
  {
    icon: Users,
    title: 'All Categories',
    desc: 'Civil, criminal, family, corporate, property, consumer law — all covered.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Choose a Plan',
    desc: 'Pick from affordable monthly or yearly subscriptions that fit your needs.',
    icon: Scale,
  },
  {
    num: '02',
    title: 'Describe Your Issue',
    desc: 'Tell us about your legal matter and upload relevant documents securely.',
    icon: FileText,
  },
  {
    num: '03',
    title: 'Get Expert Help',
    desc: 'A qualified advocate is assigned and reaches out within 24 hours.',
    icon: Gavel,
  },
  {
    num: '04',
    title: 'Resolve with Confidence',
    desc: 'Receive advice, drafts, and representation support to resolve your case.',
    icon: CheckCircle2,
  },
];

const stats = [
  { value: '1,200+', label: 'Active Users' },
  { value: '500+', label: 'Verified Lawyers' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24 hrs', label: 'Avg. Response Time' },
];

const testimonials = [
  {
    name: 'Ananya M.',
    location: 'Mumbai',
    text: 'NyayaSetu helped me resolve a property dispute that had been going on for 2 years. The lawyer was incredibly knowledgeable and responsive.',
    rating: 5,
  },
  {
    name: 'Rajesh K.',
    location: 'Delhi',
    text: 'Got expert consumer court guidance within hours. The subscription model makes legal help so affordable. Highly recommend to every family.',
    rating: 5,
  },
  {
    name: 'Priya S.',
    location: 'Bangalore',
    text: "The video consultation feature is amazing. I didn't have to travel anywhere and still got proper legal advice for my employment issue.",
    rating: 5,
  },
];

const Homepage = () => {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(43_55%_52%_/_0.12),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(220_40%_30%_/_0.5),_transparent_60%)]" />
        <div className="container relative py-20 md:py-28 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold"
              >
                <Star className="h-3.5 w-3.5 fill-current" /> Trusted by 1,200+
                users across India
              </motion.div>
              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-3xl font-bold leading-[1.1] text-primary-foreground sm:text-4xl md:text-5xl lg:text-[3.5rem]"
              >
                Affordable Legal Help,{' '}
                <span className="text-gold">Now Accessible</span> to Every
                Indian
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="max-w-lg text-base text-primary-foreground/70 sm:text-lg"
              >
                Subscribe to expert legal assistance. Get matched with verified
                advocates for property disputes, consumer complaints, family
                law, and more.
              </motion.p>
              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-col gap-3 pt-2 sm:flex-row"
              >
                <Button
                  size="lg"
                  className="bg-gold text-accent-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
                  asChild
                >
                  <Link to={ROUTES.plans}>
                    View Plans & Pricing <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 text-black hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link to={ROUTES.howItWorks}>See How It Works</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Hero right — stat cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="hidden grid-cols-2 gap-4 lg:grid"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  custom={i + 2}
                  className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 text-center backdrop-blur"
                >
                  <p className="text-3xl font-bold text-gold">{s.value}</p>
                  <p className="mt-1 text-sm text-primary-foreground/60">
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mobile stats row */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:hidden">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-4 text-center"
              >
                <p className="text-xl font-bold text-gold">{s.value}</p>
                <p className="mt-0.5 text-xs text-primary-foreground/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              Why Families Trust NyayaSetu
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Modern legal assistance that's accessible, affordable, and
              reliable.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                custom={i}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-gold/10 p-2.5 text-gold transition-colors group-hover:bg-gold/20">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Four simple steps from sign-up to resolution.
            </p>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-border lg:block" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  custom={i}
                  className="relative rounded-xl border bg-card p-6 text-center"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-gold">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Step {s.num}
                  </span>
                  <h3 className="mt-2 text-base font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real stories from real people who found legal support through
              NyayaSetu.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                custom={i}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  "{t.text}"
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-gold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans preview */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-3 text-muted-foreground">
              Affordable legal protection for every Indian family. No hidden
              fees.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {mockPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                custom={i}
                className={`relative rounded-xl border p-6 transition-all hover:shadow-lg md:p-8 ${plan.isPopular ? 'scale-[1.02] border-gold shadow-lg ring-1 ring-gold/20' : 'bg-card shadow-sm'}`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{plan.period}
                  </span>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-8 w-full ${plan.isPopular ? 'bg-gold text-accent-foreground hover:bg-gold/90' : ''}`}
                  variant={plan.isPopular ? 'default' : 'outline'}
                  asChild
                >
                  <Link to={ROUTES.register}>Subscribe Now</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 text-center shadow-sm md:p-12">
            <h2 className="text-xl font-bold sm:text-2xl">Have Questions?</h2>
            <p className="mt-2 text-muted-foreground">
              Check out our frequently asked questions or reach out to our
              support team.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button variant="outline" asChild>
                <Link to={ROUTES.faq}>Read FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16 md:py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl font-bold text-primary-foreground sm:text-3xl lg:text-4xl"
            >
              Start Your Legal Journey Today
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-lg text-base text-primary-foreground/70 sm:text-lg"
            >
              Join thousands of Indians who trust NyayaSetu for reliable,
              affordable legal assistance.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Button
                size="lg"
                className="bg-gold text-accent-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
                asChild
              >
                <Link to={ROUTES.register}>
                  Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Homepage;
