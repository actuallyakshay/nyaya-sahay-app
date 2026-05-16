import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Purpose of this notice',
    body: `Samvidhan Legal Advisory (“we”, “us”, “the Platform”) processes personal data when you sign in, create or manage legal cases, upload documents, communicate with advocates, and use subscription or payment features. This notice explains how we handle your data under India’s Digital Personal Data Protection Act, 2023 (DPDP Act) and related rules.`,
  },
  {
    title: '2. Personal data we collect',
    body: `Depending on how you use the Platform, we may process: identity and contact details (name, email, phone); account and authentication data (including Google sign-in identifiers); case information (titles, descriptions, practice area, status, messages); documents and files you upload; lawyer assignment and session details; subscription and payment metadata; device and usage logs needed for security and support.`,
  },
  {
    title: '3. Why we process your data',
    body: `We process personal data to: provide legal advisory and case-management services; verify users and advocates; assign lawyers to your cases; enable secure messaging and document sharing; send service-related notifications; process subscriptions and payments; prevent fraud and abuse; comply with law; and improve the Platform. Case-related data is processed only to deliver the legal services you request through us.`,
  },
  {
    title: '4. Who we share data with',
    body: `We may share relevant case and profile data with: advocates assigned to your matter; platform administrators for verification, support, and dispute handling; infrastructure and payment providers under contract; and authorities when required by law. We do not sell your personal data.`,
  },
  {
    title: '5. Retention',
    body: `We retain personal data for as long as your account is active and as needed to fulfil cases, legal obligations, and legitimate business purposes (including records required for Bar Council or court-related workflows). You may request erasure subject to legal and contractual limits (for example, ongoing cases or statutory retention).`,
  },
  {
    title: '6. Your rights',
    body: `Under the DPDP Act you may, subject to applicable law: access and obtain a summary of your personal data; correct inaccurate data; withdraw consent where processing is consent-based; nominate another person to exercise rights in the event of death or incapacity; and raise grievances with us. You may also approach the Data Protection Board of India as provided under law.`,
  },
  {
    title: '7. Security',
    body: `We use technical and organisational measures—including encryption in transit, access controls, and verified advocate onboarding—to protect personal data. No method of transmission over the internet is completely secure; please use strong credentials and report suspected misuse promptly.`,
  },
  {
    title: '8. Consent and withdrawal',
    body: `By checking the consent box at login, you confirm that you have read this notice and consent to our processing of your personal data as described for Platform services, including case and document handling. You may withdraw consent by contacting us; withdrawal may limit or end your ability to use case-related features.`,
  },
  {
    title: '9. Grievance officer',
    body: `For questions, access requests, corrections, or complaints regarding personal data, contact our grievance officer at the support email published in Platform settings or the website footer. We will respond within timelines prescribed under applicable law.`,
  },
  {
    title: '10. Updates',
    body: `We may update this notice from time to time. Material changes will be reflected on this page with a revised “last updated” date. Continued use after changes may require renewed consent where the law requires it.`,
  },
] as const;

const DpdpConsentPage = () => (
  <PublicLayout>
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10">
          <Shield className="h-6 w-6 text-gold" aria-hidden />
        </div>

        <h1 className="mt-6 text-center text-3xl font-bold sm:text-4xl">DPDP consent notice</h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Digital Personal Data Protection Act, 2023 — Samvidhan Legal Advisory
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">Last updated: May 2026</p>

        <div className="mt-12 space-y-8 text-sm leading-relaxed">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-base font-semibold">{s.title}</h2>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline">
            <Link to={ROUTES.login}>Back to sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default DpdpConsentPage;
