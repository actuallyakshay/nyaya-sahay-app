import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LEGAL_CATEGORIES, type Lawyer, type LegalCategory } from '@/types';
import { useEffect, useState } from 'react';

interface LawyerFormModalProps {
  open: boolean;
  onClose: () => void;
  lawyer?: Lawyer | null;
  onSave: (data: Partial<Lawyer>) => void;
}

const allCategories = Object.entries(LEGAL_CATEGORIES) as [
  LegalCategory,
  string,
][];

export const LawyerFormModal = ({
  open,
  onClose,
  lawyer,
  onSave,
}: LawyerFormModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [barCouncilId, setBarCouncilId] = useState('');
  const [degree, setDegree] = useState('');
  const [experience, setExperience] = useState(0);
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState<LegalCategory[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (lawyer) {
      setName(lawyer.name);
      setEmail(lawyer.email);
      setPhone(lawyer.phone);
      setBarCouncilId(lawyer.barCouncilId);
      setDegree(lawyer.degree);
      setExperience(lawyer.experience);
      setBio(lawyer.bio);
      setSpecializations(lawyer.specializations);
      setIsVerified(lawyer.isVerified);
      setIsAvailable(lawyer.isAvailable);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setBarCouncilId('');
      setDegree('');
      setExperience(0);
      setBio('');
      setSpecializations([]);
      setIsVerified(false);
      setIsAvailable(true);
    }
  }, [lawyer, open]);

  const toggleSpec = (cat: LegalCategory) => {
    setSpecializations((prev) =>
      prev.includes(cat) ? prev.filter((s) => s !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim()) return;
    onSave({
      name,
      email,
      phone,
      barCouncilId,
      degree,
      experience,
      bio,
      specializations,
      isVerified,
      isAvailable,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lawyer ? 'Edit Lawyer' : 'Add Lawyer'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adv. Name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Bar Council ID</Label>
              <Input
                value={barCouncilId}
                onChange={(e) => setBarCouncilId(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Degree</Label>
              <Input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Experience (years)</Label>
              <Input
                type="number"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Specializations</Label>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSpec(key)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    specializations.includes(key)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Verified</Label>
            <Switch checked={isVerified} onCheckedChange={setIsVerified} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Available</Label>
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {lawyer ? 'Save Changes' : 'Add Lawyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
