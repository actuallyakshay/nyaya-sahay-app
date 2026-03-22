import { PublicLayout } from '@/layouts/PublicLayout';
import { Scale, Shield, BookOpen, Users } from 'lucide-react';

const AboutPage = () => (
  <PublicLayout>
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold sm:text-4xl text-center">About NyayaSetu</h1>
        <p className="mt-4 text-center text-muted-foreground">Bridging the gap between Indian citizens and accessible, affordable legal aid.</p>

        <div className="mt-12 space-y-8 text-sm leading-relaxed">
          <div className="flex gap-4">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center"><Scale className="h-5 w-5 text-gold" /></div>
            <div>
              <h3 className="font-semibold text-base">Our Mission</h3>
              <p className="mt-1 text-muted-foreground">NyayaSetu was founded to make quality legal services accessible to every Indian — regardless of geography, language, or financial background. We connect citizens with verified advocates through a simple subscription model.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center"><Shield className="h-5 w-5 text-gold" /></div>
            <div>
              <h3 className="font-semibold text-base">Trust & Security</h3>
              <p className="mt-1 text-muted-foreground">All lawyers on our platform are Bar Council verified. Your documents and communications are encrypted. We follow strict data protection practices aligned with Indian IT Act provisions.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center"><Users className="h-5 w-5 text-gold" /></div>
            <div>
              <h3 className="font-semibold text-base">Our Network</h3>
              <p className="mt-1 text-muted-foreground">We have a growing network of 80+ verified advocates specializing in civil, criminal, family, corporate, and consumer law across major Indian cities.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default AboutPage;
