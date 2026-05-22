import logoUrl from '@/assets/logo.png';
import signUrl from '@/assets/sign.png';
import { proxyAsset } from '@/api-client';
import { SamvidhanCardPdfDocument } from '@/components/pdf/SamvidhanCardPdfTemplate';
import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';

export type SamvidhanCardPdfData = {
  title: string;
  logoUrl: string;
  signatureUrl: string;
  name: string;
  memberNo: string;
  userMobileNo: string;
  photoUrl?: string;
  memStartDate?: string;
  memEndDate?: string;
};

type BuildCardInput = {
  memberName: string;
  memNumber: string;
  photoUrl?: string;
  userMobileNo: string;
  memStartDate: string;
  memEndDate?: string;
};

async function resolvePhotoDataUri(photoUrl?: string): Promise<string | undefined> {
  if (!photoUrl) return undefined;
  if (photoUrl.startsWith('data:')) return photoUrl;
  const { data } = await proxyAsset(photoUrl);
  return data.dataUri;
}

async function buildCardData(input: BuildCardInput): Promise<SamvidhanCardPdfData> {
  return {
    title: `${input.memberName}-${input.memNumber}-samvidhan-legal-advisory-card`,
    logoUrl,
    signatureUrl: signUrl,
    name: input.memberName,
    memberNo: input.memNumber,
    userMobileNo: input.userMobileNo,
    photoUrl: await resolvePhotoDataUri(input.photoUrl),
    memStartDate: input.memStartDate,
    memEndDate: input.memEndDate,
  };
}

export async function downloadSamvidhanAdvisoryCardPdf(
  input: BuildCardInput
): Promise<void> {
  const data = await buildCardData(input);
  const doc = createElement(SamvidhanCardPdfDocument, { data });
  const blob = await pdf(doc).toBlob();

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${data.title}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
