import logoAssetUrl from '@/assets/logo.png';
import signAssetUrl from '@/assets/sign.png';
import { proxyAsset } from '@/api-client';
import { SamvidhanCardPdfDocument } from '@/components/pdf/SamvidhanCardPdfTemplate';
import templateSource from '@/templates/samvidhan-advisory-card.hbs?raw';
import { pdf } from '@react-pdf/renderer';
import Handlebars from 'handlebars';
import { createElement } from 'react';

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
  return signAssetUrl;
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
 * Generates a vector PDF using @react-pdf/renderer and triggers download.
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
    return url;
  }
}


export async function downloadSamvidhanAdvisoryCardPdf(
  data: SamvidhanAdvisoryCardTemplateData
): Promise<void> {
  // For @react-pdf/renderer, pass absolute URLs directly.
  // The library handles image fetching internally.
  const toAbsoluteUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${window.location.origin}${url}`;
    return `${window.location.origin}/${url}`;
  };

  const resolvedData: SamvidhanAdvisoryCardTemplateData = {
    ...data,
    logoUrl: toAbsoluteUrl(data.logoUrl) ?? data.logoUrl,
    signatureUrl: toAbsoluteUrl(data.signatureUrl) ?? data.signatureUrl,
    photoUrl: toAbsoluteUrl(data.photoUrl),
  };

  console.log('[PDF] Resolved URLs:', {
    logo: resolvedData.logoUrl?.substring(0, 60),
    signature: resolvedData.signatureUrl?.substring(0, 60),
    photo: resolvedData.photoUrl?.substring(0, 60),
  });

  const doc = createElement(SamvidhanCardPdfDocument, { data: resolvedData });
  const blob = await pdf(doc).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.title}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Loads an image via <img> element with crossOrigin and draws to canvas
 * to extract as data URI. This works for GCS/S3 URLs that support
 * crossorigin attribute on img tags but block fetch CORS.
 */
function loadImageViaCanvas(url: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        // Canvas tainted — can't extract
        resolve(undefined);
      }
    };
    img.onerror = () => resolve(undefined);
    img.src = url;
  });
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

  // Convert photo URL to base64 via backend proxy to bypass CORS
  let resolvedPhotoUrl: string | undefined = undefined;
  if (input.photoUrl) {
    if (input.photoUrl.startsWith('data:')) {
      resolvedPhotoUrl = input.photoUrl;
    } else {
      try {
        const response = await proxyAsset(input.photoUrl);
        const arrayBuffer = response.data;
        const uint8 = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);
        const ext = input.photoUrl.split('.').pop()?.split('?')[0]?.toLowerCase();
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        resolvedPhotoUrl = `data:${mime};base64,${base64}`;
      } catch (e) {
        console.warn('[PDF] Proxy failed, trying direct fetch:', e);
        const fetched = await urlToDataUrl(input.photoUrl);
        resolvedPhotoUrl = fetched.startsWith('data:') ? fetched : undefined;
      }
    }
  }

  return {
    title,
    logoUrl: defaultLogoUrl(),
    signatureUrl: defaultSignatureUrl(),
    name: input.memberName,
    role: 'Member',
    memberNo: input.memNumber,
    mobileNo: input.userMobileNo,
    phone: input.userMobileNo,
    address: DEFAULT_ADDRESS,
    photoUrl: resolvedPhotoUrl,
    memStartDate: input.memStartDate,
    memEndDate: input.memEndDate,
    userMobileNo: input.userMobileNo,
  };
}
