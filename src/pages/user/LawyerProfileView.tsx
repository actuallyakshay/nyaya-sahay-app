import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockLawyers } from '@/lib/mock-data';
import { LEGAL_CATEGORIES } from '@/types';
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Mail,
  Phone,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const LawyerProfileView = () => {
  const { id } = useParams();
  const lawyer = mockLawyers.find((l) => l.id === id);
  const { toast } = useToast();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [sessionType, setSessionType] = useState('video');

  if (!lawyer) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center">
          <p className="text-muted-foreground">Lawyer not found.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/app/lawyers">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Lawyers
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleBookSession = () => {
    toast({
      title: 'Session Booked',
      description: `Your ${sessionType} consultation with ${lawyer.name} has been scheduled.`,
    });
    setBookingOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/app/lawyers">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Lawyers
          </Link>
        </Button>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xl font-bold text-gold">
              {lawyer.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{lawyer.name}</h1>
                {lawyer.isVerified && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {lawyer.degree}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lawyer.specializations.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold"
                  >
                    {LEGAL_CATEGORIES[s]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-bold">{lawyer.casesHandled}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Cases</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="font-bold">{lawyer.experience} yrs</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Experience</p>
            </div>
          </div>

          {lawyer.bio && (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                About
              </h3>
              <p className="text-sm leading-relaxed">{lawyer.bio}</p>
            </div>
          )}

          <div className="mt-5 grid gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> {lawyer.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> {lawyer.phone}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => setBookingOpen(true)}>
              <Calendar className="mr-2 h-4 w-4" /> Book Consultation
            </Button>
          </div>
        </div>
      </div>

      {/* Booking dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Consultation</DialogTitle>
            <DialogDescription>
              Schedule a session with {lawyer.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Session Type</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-3.5 w-3.5" /> Video Call
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> Phone Call
                    </div>
                  </SelectItem>
                  <SelectItem value="chat">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> Chat Session
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Input type="time" />
            </div>
            <div className="space-y-2">
              <Label>Brief Description</Label>
              <Input placeholder="What would you like to discuss?" />
            </div>
            <Button className="w-full" onClick={handleBookSession}>
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LawyerProfileView;
