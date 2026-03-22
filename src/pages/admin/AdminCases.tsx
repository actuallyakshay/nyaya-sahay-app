import { AdminLayout } from '@/layouts/AdminLayout';
import { mockCases, mockLawyers } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { LEGAL_CATEGORIES } from '@/types';
import { Link } from 'react-router-dom';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminCases = () => {
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const filtered = mockCases.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.userName.toLowerCase().includes(search.toLowerCase())
  );
  const { paginated, page, totalPages, next, prev } = usePagination(filtered, 10);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Case Management</h1>
          <p className="mt-1 text-muted-foreground">View and manage all cases on the platform.</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search cases..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Case #</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Lawyer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{c.caseNumber}</td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                    <Link to={`/admin/cases/${c.id}`} className="hover:text-gold hover:underline">{c.title}</Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Link to={`/admin/users/${c.userId}`} className="hover:text-gold hover:underline">{c.userName}</Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{LEGAL_CATEGORIES[c.category]}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell">{c.lawyerName || '—'}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/cases/${c.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
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

export default AdminCases;
