import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { mockCases, mockSubscription } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Briefcase, CreditCard, ArrowRight, Plus, Clock, Crown, CalendarCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LEGAL_CATEGORIES } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ProfileCompletionModal from '@/components/ProfileCompletionModal';

const UserDashboard = () => {
  const { user } = useAuth();
  const activeCases = mockCases.filter((c) => !['resolved', 'closed'].includes(c.status));
  const hasSubscription = mockSubscription.status === 'active';
  const isProfileComplete = localStorage.getItem('profile_completed') === 'true';
  const [profileModalOpen, setProfileModalOpen] = useState(!isProfileComplete);
  const [paywallOpen, setPaywallOpen] = useState(!hasSubscription && isProfileComplete);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Welcome, {user?.name?.split(' ')[0]}</h1>
            <p className="mt-1 text-muted-foreground">Here's an overview of your legal support account.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="lg" className="gap-2">
              <Link to="/app/new-case"><Plus className="h-4 w-4" /> Raise New Query</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/cases">View All Cases</Link>
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Active Cases', value: activeCases.length, icon: Briefcase, color: 'text-info' },
            { label: 'Plan', value: mockSubscription.planName, icon: CreditCard, color: 'text-gold' },
            { label: 'Sessions', value: '2 upcoming', icon: CalendarCheck, color: 'text-warning' },
            { label: 'Days Remaining', value: Math.max(0, Math.ceil((new Date(mockSubscription.endDate).getTime() - Date.now()) / 86400000)), icon: Clock, color: 'text-success' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Active cases */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Active Cases</h2>
          {activeCases.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <p className="text-muted-foreground">No active cases. Raise a query to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCases.map((c) => (
                <Link key={c.id} to={`/app/cases/${c.id}`} className="block rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{c.caseNumber}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="mt-1 font-medium truncate">{c.title}</p>
                      <p className="text-sm text-muted-foreground">{LEGAL_CATEGORIES[c.category]}</p>
                    </div>
                    <ArrowRight className="hidden sm:block h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Paywall Modal */}
      <Dialog open={paywallOpen} onOpenChange={setPaywallOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
              <Crown className="h-7 w-7 text-gold" />
            </div>
            <DialogTitle className="text-xl">Subscribe to Get Started</DialogTitle>
            <DialogDescription className="text-base">
              An active subscription is required to raise legal queries and connect with advocates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
              <p className="text-sm font-medium">What you get with a plan:</p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">✓ Unlimited legal queries</li>
                <li className="flex items-center gap-2">✓ Expert lawyer matching</li>
                <li className="flex items-center gap-2">✓ Video & phone consultations</li>
                <li className="flex items-center gap-2">✓ Document review & drafting</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gap-2" asChild>
                <Link to="/app/subscription"><CreditCard className="h-4 w-4" /> View Plans</Link>
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setPaywallOpen(false)}>
                Browse First
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        open={profileModalOpen}
        onComplete={() => {
          setProfileModalOpen(false);
          if (!hasSubscription) setPaywallOpen(true);
        }}
      />
    </DashboardLayout>
  );
};

export default UserDashboard;
