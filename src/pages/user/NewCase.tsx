import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LEGAL_CATEGORIES, type LegalCategory } from '@/types';
import { mockSubscription } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const NewCase = () => {
  const [category, setCategory] = useState<LegalCategory | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check subscription — mock: if status is not 'active', show gate
  const hasSubscription = mockSubscription.status === 'active';
  const [subGateOpen, setSubGateOpen] = useState(!hasSubscription);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSubscription) {
      setSubGateOpen(true);
      return;
    }
    toast({ title: 'Case submitted', description: `Your legal query has been filed with ${files.length} document(s). We will assign a lawyer shortly.` });
    navigate('/app/cases');
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Raise a Legal Query</h1>
          <p className="mt-1 text-muted-foreground">Describe your legal issue and we'll connect you with the right advocate.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(LEGAL_CATEGORIES) as [LegalCategory, string][]).map(([key, label]) => (
                <button type="button" key={key} onClick={() => setCategory(key)}
                  className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${category === key ? 'border-gold bg-gold/10 text-foreground' : 'bg-card hover:bg-muted'}`}
                >{label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Brief Title</Label>
            <Input id="title" placeholder="e.g. Property ownership dispute" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea id="description" placeholder="Describe your legal issue in detail..." rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Upload Documents (optional)</Label>
            <FileUpload onFilesChange={setFiles} maxFiles={10} />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
            <div>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} className="rounded" />
                Mark as Emergency
              </label>
              <p className="mt-1 text-xs text-muted-foreground">Only for Premium plan subscribers. Emergency cases get priority handling.</p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!category || !title || !description}>Submit Query</Button>
        </form>
      </div>

      {/* Subscription Gate Modal */}
      <Dialog open={subGateOpen} onOpenChange={setSubGateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-gold" /> Subscription Required</DialogTitle>
            <DialogDescription>You need an active subscription to raise legal queries. Subscribe to a plan to get started.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">Choose a plan that suits your legal needs and get unlimited access to our lawyer network.</p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" asChild>
                <Link to="/app/subscription">View Plans</Link>
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setSubGateOpen(false)}>
                Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NewCase;
