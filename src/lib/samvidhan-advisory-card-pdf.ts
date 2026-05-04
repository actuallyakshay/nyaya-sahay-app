import { formatDateEnIn } from '@/pages/user/userSubscription.helpers';
import templateSource from '@/templates/samvidhan-advisory-card.hbs?raw';
import Handlebars from 'handlebars';

export type SamvidhanAdvisoryCardTemplateData = {
  logoUrl: string;
  memberName: string;
  memNumber: string;
  planName: string;
  validFrom: string;
  validTill: string;
  issuedOn: string;
};

const compiled = Handlebars.compile(templateSource);

function defaultLogoUrl(): string {
  if (typeof window === 'undefined') return '/assets/logo.png';
  return `${window.location.origin}/assets/logo.png`;
}

/**
 * Renders `samvidhan-advisory-card.hbs` off-screen and saves a single-page PDF.
 */
export async function downloadSamvidhanAdvisoryCardPdf(
  data: SamvidhanAdvisoryCardTemplateData
): Promise<void> {
  const html = compiled(data);
  const host = document.createElement('div');
  host.setAttribute('data-samvidhan-pdf-host', '');
  host.style.cssText =
    'position:fixed;left:-15000px;top:0;width:210mm;padding:12mm;box-sizing:border-box;background:#f5f5f5;';
  host.innerHTML = html;
  document.body.appendChild(host);
  const el = host.querySelector(
    '.samvidhan-advisory-card'
  ) as HTMLElement | null;
  if (!el) {
    document.body.removeChild(host);
    throw new Error('Card template did not render');
  }

  try {
    const { default: html2pdf } = await import('html2pdf.js');
    await html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename: `${data.memberName}-${data.memNumber}-samvidhan-legal-advisory-card.pdf`,
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(el)
      .save();
  } finally {
    document.body.removeChild(host);
  }
}

export function buildSamvidhanCardDataFromSubscription(input: {
  memberName: string;
  memNumber: string;
  planName: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  logoUrl?: string;
}): SamvidhanAdvisoryCardTemplateData {
  return {
    logoUrl: input.logoUrl ?? defaultLogoUrl(),
    memberName: input.memberName,
    memNumber: input.memNumber,
    planName: input.planName,
    validFrom: formatDateEnIn(input.currentPeriodStart),
    validTill: formatDateEnIn(input.currentPeriodEnd),
    issuedOn: formatDateEnIn(new Date().toISOString()),
  };
}
