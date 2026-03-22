import { Link } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { mockPlans } from '@/lib/mock-data';
import { Scale, Shield, Clock, Users, FileText, Phone, ArrowRight, CheckCircle2, Star } from 'lucide-react';

const features = [
  { icon: Scale, title: 'Expert Advocates', desc: 'Verified lawyers from High Courts and District Courts across India.' },
  { icon: Shield, title: 'Confidential & Secure', desc: 'Your documents and communications are fully encrypted and private.' },
  { icon: Clock, title: 'Quick Response', desc: 'Get legal assistance within 24–48 hours based on your plan.' },
  { icon: Users, title: 'All Legal Categories', desc: 'Civil, criminal, family, corporate, property, consumer — all covered.' },
];

const steps = [
  { num: '01', title: 'Subscribe', desc: 'Choose a plan that fits your legal needs and budget.' },
  { num: '02', title: 'Raise a Query', desc: 'Describe your legal issue and upload relevant documents.' },
  { num: '03', title: 'Get Assigned', desc: 'A qualified lawyer is assigned to handle your case.' },
  { num: '04', title: 'Resolve', desc: 'Receive consultation, advice, and resolution support.' },
];

const Homepage = () => {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(43_55%_52%_/_0.08),_transparent_60%)]" />
        <div className="container relative py-20 md:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold animate-fade-in">
              <Star className="h-3.5 w-3.5" /> Trusted by 1,200+ users across India
            </div>
            <h1 className="text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in" style={{ animationDelay: '100ms', lineHeight: '1.1' }}>
              Legal Support,{' '}
              <span className="text-gold">Simplified</span>{' '}
              for Every Indian
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-primary-foreground/70 sm:text-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
              Subscribe to affordable legal assistance. Get expert advice from verified advocates — from property disputes to consumer complaints.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Button size="lg" className="bg-gold text-accent-foreground hover:bg-gold/90 w-full sm:w-auto" asChild>
                <Link to="/plans">View Plans <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto" asChild>
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Why Choose NyayaSetu?</h2>
            <p className="mt-3 text-muted-foreground">A modern approach to legal aid — accessible, affordable, and reliable.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={f.title} className="group rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="mb-4 inline-flex rounded-lg bg-gold/10 p-2.5 text-gold">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Four simple steps to get legal support.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.num} className="relative rounded-xl border bg-card p-6 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="font-serif text-4xl font-bold text-gold/20">{s.num}</span>
                <h3 className="mt-2 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans preview */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Subscription Plans</h2>
            <p className="mt-3 text-muted-foreground">Affordable legal protection for every Indian family.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {mockPlans.map((plan, i) => (
              <div key={plan.id} className={`relative rounded-xl border p-6 md:p-8 animate-fade-in ${plan.isPopular ? 'border-gold shadow-lg ring-1 ring-gold/20' : 'bg-card shadow-sm'}`} style={{ animationDelay: `${i * 100}ms` }}>
                {plan.badge && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-accent-foreground">{plan.badge}</span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className={`mt-8 w-full ${plan.isPopular ? 'bg-gold text-accent-foreground hover:bg-gold/90' : ''}`} variant={plan.isPopular ? 'default' : 'outline'} asChild>
                  <Link to="/register">Subscribe Now</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16 md:py-20">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl animate-fade-in">
            Start Your Legal Journey Today
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/70 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Join thousands of Indians who trust NyayaSetu for reliable, affordable legal assistance.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button size="lg" className="bg-gold text-accent-foreground hover:bg-gold/90" asChild>
              <Link to="/register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/contact">Talk to Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Homepage;
