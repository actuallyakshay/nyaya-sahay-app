import logoAssetUrl from '@/assets/logo.png';
import templateSource from '@/templates/samvidhan-advisory-card.hbs?raw';
import Handlebars from 'handlebars';

export type SamvidhanAdvisoryCardTemplateData = {
  title: string;
  logoUrl: string;
  signatureUrl: string;
  name: string;
  role: string;
  memberNo: string;
  mobileNo: string;
  phone: string;
  address: string;
  photoUrl?: string;
  memStartDate?: string;
  memEndDate?: string;
  userMobileNo?: string;
};

const compiled = Handlebars.compile(templateSource);

const DEFAULT_ADDRESS =
  'Office No. 12, Shiv Surbhi Apartment, Thakur Village, Kandivali East, Mumbai - 400101';

function assetUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

function defaultLogoUrl(): string {
  return logoAssetUrl;
}

function defaultSignatureUrl(): string {
  return assetUrl('/assets/sign.png');
}

async function waitForImages(doc: Document): Promise<void> {
  const imgs = Array.from(doc.images);
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        })
    )
  );
}

async function waitForTailwind(doc: Document): Promise<void> {
  const script = doc.querySelector<HTMLScriptElement>(
    'script[src*="tailwindcss"]'
  );
  if (!script) return;

  if (script.getAttribute('data-loaded') !== 'true') {
    await new Promise<void>((resolve) => {
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => resolve(), { once: true });
    });
  }

  // Let Tailwind CDN scan the DOM and inject utility styles.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
}

/**
 * Renders the full HTML advisory card template and opens the native print dialog.
 */
export async function printSamvidhanAdvisoryCard(
  data: SamvidhanAdvisoryCardTemplateData
): Promise<void> {
  const html = compiled(data);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('title', 'samvidhan-advisory-card-print');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;';
  iframe.srcdoc = html;
  document.body.appendChild(iframe);

  const cleanup = () => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  await new Promise<void>((resolve) => {
    iframe.addEventListener('load', () => resolve(), { once: true });
  });

  const win = iframe.contentWindow;
  const innerDoc = iframe.contentDocument;
  if (!win || !innerDoc) {
    cleanup();
    throw new Error('Print frame failed to initialise');
  }

  await waitForTailwind(innerDoc);
  await waitForImages(innerDoc);

  win.addEventListener('afterprint', cleanup, { once: true });
  setTimeout(cleanup, 60_000);

  win.focus();
  win.print();
}

/** Returns the raw HTML string for the card — use for preview. */
export function renderSamvidhanAdvisoryCardHtml(
  data: SamvidhanAdvisoryCardTemplateData
): string {
  return compiled(data);
}

/**
 * Renders the card into a hidden iframe, captures it with html2canvas,
 * and triggers a direct PDF download — no print dialog.
 * Card dimensions match the @page size: 250mm × 170mm.
 */
export async function urlToDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url; // fall back to original URL if CORS fails
  }
}

export async function downloadSamvidhanAdvisoryCardPdf(
  data: SamvidhanAdvisoryCardTemplateData
): Promise<void> {
  // Convert remote photoUrl to a data URL so html2canvas can draw it
  // without being blocked by CORS / tainted-canvas restrictions.
  const resolvedData =
    data.photoUrl && data.photoUrl.startsWith('http')
      ? { ...data, photoUrl: await urlToDataUrl(data.photoUrl) }
      : data;

  const html = compiled(resolvedData);

  // 1. Mount a visible-sized hidden iframe so html2canvas can measure it
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:900px;height:560px;border:0;pointer-events:none;';
  iframe.srcdoc = html;
  document.body.appendChild(iframe);

  const cleanup = () => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  try {
    await new Promise<void>((resolve) => {
      iframe.addEventListener('load', () => resolve(), { once: true });
    });

    const innerDoc = iframe.contentDocument;
    if (!innerDoc) throw new Error('Card frame failed to initialise');

    await waitForImages(innerDoc);

    // 2. Find the card element and capture it
    const cardEl = innerDoc.querySelector<HTMLElement>('.rounded-2xl');
    if (!cardEl) throw new Error('Card element not found');

    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(cardEl, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      width: 900,
      height: 560,
      windowWidth: 900,
      windowHeight: 560,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff',
    });

    // 3. Derive PDF height from canvas ratio so image is never stretched
    const { jsPDF } = await import('jspdf');
    const pdfW = 250; // mm
    const pdfH = (canvas.height / canvas.width) * pdfW;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [pdfW, pdfH] });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(`${data.title}.pdf`);
  } finally {
    cleanup();
  }
}

export async function buildSamvidhanCardDataFromSubscription(input: {
  memberName: string;
  memNumber: string;
  photoUrl?: string;
  memEndDate?: string;
  userMobileNo: string;
  memStartDate: string;
}) {
  const title = `${input.memberName}-${input.memNumber}-samvidhan-legal-advisory-card`;
  console.log('photoUrl', input.photoUrl);

  return {
    title,
    logoUrl: defaultLogoUrl(),
    signatureUrl:  defaultSignatureUrl(),
    name: input.memberName,
    memberNo: input.memNumber,
    address: DEFAULT_ADDRESS,
    photoUrl: input.photoUrl,
    memStartDate: input.memStartDate,
    memEndDate: input.memEndDate,
    userMobileNo: input.userMobileNo,
  };
}
