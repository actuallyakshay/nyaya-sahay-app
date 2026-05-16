import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants';
import { Link } from 'react-router-dom';

interface LoginDpdpConsentProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const DPDP_CONSENT_REQUIRED_TOAST = {
  title: 'Consent required',
  description:
    'Please accept the DPDP consent notice before signing in. We need your consent to process personal data for legal case services.',
} as const;

export function LoginDpdpConsent({ checked, onCheckedChange }: LoginDpdpConsentProps) {
  const id = 'login-dpdp-consent';

  return (
    <div className="mt-6 flex items-start gap-3 rounded-lg border border-border/80 bg-muted/30 p-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal leading-snug text-muted-foreground">
        I have read and agree to the{' '}
        <Link
          to={ROUTES.dpdpConsent}
          className="font-medium text-foreground underline underline-offset-2 hover:text-gold"
          target="_blank"
          rel="noopener noreferrer"
        >
          DPDP consent notice
        </Link>
        , including processing of my personal data and case-related information on this platform.
      </Label>
    </div>
  );
}
