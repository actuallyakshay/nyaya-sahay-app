import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const steps = [
  { num: '01', title: 'Create an Account', desc: 'Sign up with your email and phone number. It takes less than 2 minutes.' },
  { num: '02', title: 'Choose a Plan', desc: 'Select from Basic, Professional, or Premium subscriptions based on your needs.' },
  { num: '03', title: 'Raise a Legal Query', desc: 'Describe your issue, select the relevant legal category, and upload documents.' },
  { num: '04', title: 'Get a Lawyer Assigned', desc: 'Our team reviews your query and assigns a qualified advocate from our network.' },
  { num: '05', title: 'Consultation & Resolution', desc: 'Communicate securely with your lawyer. Track progress until your case is resolved.' },
];

const HowItWorksPage = () => (
  <PublicLayout>
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold sm:text-4xl text-center">How NyayaSetu Works</h1>
        <p className="mt-4 text-center text-muted-foreground">Five simple steps to get legal support from verified advocates.</p>

        <div className="mt-12 space-y-0">
          {steps.map((s, i) => (
            <div key={s.num} className="relative flex gap-5 pb-10 last:pb-0">
              {i < steps.length - 1 && <div className="absolute left-[19px] top-10 h-full w-px bg-border" />}
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-primary-foreground">
                {s.num}
              </div>
              <div>
                <h3 className="font-semibold text-base">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" asChild><Link to="/register">Get Started Now</Link></Button>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default HowItWorksPage;
