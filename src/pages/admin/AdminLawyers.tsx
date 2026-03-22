import { AdminLayout } from '@/layouts/AdminLayout';
import { mockLawyers } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { LEGAL_CATEGORIES } from '@/types';
import { Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';

const AdminLawyers = () => {
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [lawyerStates, setLawyerStates] = useState<Record<string, boolean>>(
    Object.fromEntries(mockLawyers.map(l => [l.id, l.isAvailable]))
  );

  const filtered = mockLawyers.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase())
  );
  const { paginated, page, totalPages, next, prev } = usePagination(filtered, 10);

  const toggleLawyer = (id: string) => {
    setLawyerStates(prev => {
      const newState = !prev[id];
      toast({ title: newState ? 'Lawyer Enabled' : 'Lawyer Disabled', description: `Lawyer has been ${newState ? 'enabled' : 'disabled'}.` });
      return { ...prev, [id]: newState };
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lawyer Management</h1>
            <p className="mt-1 text-muted-foreground">Verify, onboard, and manage lawyers.</p>
          </div>
          <Button><UserPlus className="mr-2 h-4 w-4" />Add Lawyer</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search lawyers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Specialization</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Bar Council ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Verified</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Active</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Rating</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(l => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <Link to={`/admin/lawyers/${l.id}`} className="font-medium hover:text-gold hover:underline">{l.name}</Link>
                      <p className="text-xs text-muted-foreground">{l.experience} yrs exp</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                    {l.specializations.map(s => LEGAL_CATEGORIES[s]).join(', ')}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-muted-foreground">{l.barCouncilId}</td>
                  <td className="px-4 py-3">
                    {l.isVerified
                      ? <CheckCircle className="h-4 w-4 text-green-600" />
                      : <XCircle className="h-4 w-4 text-red-500" />
                    }
                  </td>
                  <td className="px-4 py-3">
                    <Switch checked={lawyerStates[l.id]} onCheckedChange={() => toggleLawyer(l.id)} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">{l.rating}/5</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/lawyers/${l.id}`}><Button variant="ghost" size="sm">View</Button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls page={page} totalPages={totalPages} onNext={next} onPrev={prev} />
      </div>
    </AdminLayout>
  );
};

export default AdminLawyers;
