import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage = () => (
  <PublicLayout>
    <section className="py-16 md:py-24">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold sm:text-4xl text-center">Contact Us</h1>
        <p className="mt-4 text-center text-muted-foreground">Have questions? We're here to help.</p>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <div className="flex gap-3 items-start">
              <Mail className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <p className="font-medium text-sm">Email</p>
                <p className="text-sm text-muted-foreground">support@nyayasetu.in</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Phone className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <p className="font-medium text-sm">Phone</p>
                <p className="text-sm text-muted-foreground">+91 11 4000 XXXX (Mon-Sat, 9am-6pm)</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <MapPin className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <p className="font-medium text-sm">Office</p>
                <p className="text-sm text-muted-foreground">Connaught Place, New Delhi, 110001</p>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="How can we help?" rows={4} />
            </div>
            <Button className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default ContactPage;
