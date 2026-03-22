import { PublicLayout } from '@/layouts/PublicLayout';
import { mockPlans } from '@/lib/mock-data';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PlansPage = () => (
  <PublicLayout>
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="text-3xl font-bold sm:text-4xl">Choose Your Legal Protection Plan</h1>
          <p className="mt-3 text-muted-foreground">Transparent pricing. No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {mockPlans.map((plan) => (
            <div key={plan.id} className={`relative rounded-xl border p-6 md:p-8 ${plan.isPopular ? 'border-gold shadow-lg ring-1 ring-gold/20' : 'bg-card shadow-sm'}`}>
              {plan.badge && <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-accent-foreground">{plan.badge}</span>}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                <span className="text-sm text-muted-foreground">/{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />{f}</li>
                ))}
              </ul>
              <Button className={`mt-8 w-full ${plan.isPopular ? 'bg-gold text-accent-foreground hover:bg-gold/90' : ''}`} variant={plan.isPopular ? 'default' : 'outline'} asChild>
                <Link to="/register">Subscribe Now</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 mx-auto max-w-2xl text-center">
          <h3 className="text-lg font-semibold mb-2">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">We support UPI, Credit/Debit Cards, and Net Banking through Razorpay secure payment gateway.</p>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default PlansPage;
