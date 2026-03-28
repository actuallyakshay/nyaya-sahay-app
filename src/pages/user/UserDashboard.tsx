import { DashboardLayout } from "@/layouts/DashboardLayout";
import {
  mockCases,
  mockSubscription,
  mockNotifications,
} from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CreditCard,
  Bell,
  AlertTriangle,
  ArrowRight,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEGAL_CATEGORIES } from "@/types";

const UserDashboard = () => {
  const { user } = useAuth();
  const activeCases = mockCases.filter(
    (c) => !["resolved", "closed"].includes(c.status),
  );
  const unreadNotifs = mockNotifications.filter((n) => !n.isRead);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's an overview of your legal support account.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Active Cases",
              value: activeCases.length,
              icon: Briefcase,
              color: "text-info",
            },
            {
              label: "Plan",
              value: mockSubscription.planName,
              icon: CreditCard,
              color: "text-gold",
            },
            {
              label: "Unread Alerts",
              value: unreadNotifs.length,
              icon: Bell,
              color: "text-warning",
            },
            {
              label: "Days Remaining",
              value: Math.max(
                0,
                Math.ceil(
                  (new Date(mockSubscription.endDate).getTime() - Date.now()) /
                    86400000,
                ),
              ),
              icon: Clock,
              color: "text-success",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/app/new-case">
              <FileText className="mr-2 h-4 w-4" /> Raise New Query
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app/cases">View All Cases</Link>
          </Button>
        </div>

        {/* Active cases */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Active Cases</h2>
          {activeCases.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No active cases. Raise a query to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCases.map((c) => (
                <Link
                  key={c.id}
                  to={`/app/cases/${c.id}`}
                  className="block rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">
                          {c.caseNumber}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="mt-1 font-medium truncate">{c.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {LEGAL_CATEGORIES[c.category]}
                      </p>
                    </div>
                    <ArrowRight className="hidden sm:block h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
