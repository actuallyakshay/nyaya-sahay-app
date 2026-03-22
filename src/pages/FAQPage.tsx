import { PublicLayout } from '@/layouts/PublicLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'What is NyayaSetu?', a: 'NyayaSetu is a legal support subscription platform that connects Indian citizens with verified lawyers for affordable legal assistance across all major categories of law.' },
  { q: 'How are lawyers verified?', a: 'All lawyers on our platform are verified through their Bar Council registration number, identity documents, and a review of their professional history.' },
  { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime. Your access continues until the end of your current billing period.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use industry-standard encryption for all data. Your documents and communications are confidential and protected under Indian IT Act provisions.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, credit cards, debit cards, and net banking through our secure Razorpay integration.' },
  { q: 'What is an emergency consultation?', a: 'Premium plan subscribers can request emergency consultation for urgent legal matters. A lawyer will respond within 4 hours.' },
  { q: 'Can I choose my lawyer?', a: 'Lawyers are assigned based on case category and availability by our team to ensure the best match. You can request a change if needed.' },
];

const FAQPage = () => (
  <PublicLayout>
    <section className="py-16 md:py-24">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl text-center">Frequently Asked Questions</h1>
        <p className="mt-4 text-center text-muted-foreground">Everything you need to know about NyayaSetu.</p>

        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  </PublicLayout>
);

export default FAQPage;
