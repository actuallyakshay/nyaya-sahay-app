import Cookies from 'js-cookie';
import {
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Presentation,
} from 'lucide-react';

export const setCookie = (name: string, value: string) => {
  Cookies.set(name, value);
};

export const getCookie = (name: string) => {
  return Cookies.get(name);
};

export const deleteCookie = (name: string) => {
  Cookies.remove(name);
};

const APP_SESSION_COOKIES = [
  'user',
  'x-active-role',
  'access-token',
  'refresh-token',
  'auth-user',
] as const;

export const resetCookies = () => {
  for (const name of APP_SESSION_COOKIES) {
    Cookies.remove(name, { path: '/' });
  }
};

export const removeCookie = (
  name: string,
  options: Cookies.CookieAttributes = {}
) => {
  Cookies.remove(name, options);
};

export const getFileType = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext!))
    return 'image';
  if (['pdf'].includes(ext!)) return 'pdf';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext!))
    return 'office';
  return 'unknown';
};

export const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext!))
    return <FileImage className="h-4 w-4 shrink-0 text-blue-500" />;

  if (['pdf'].includes(ext!))
    return <FileText className="h-4 w-4 shrink-0 text-red-500" />;

  if (['doc', 'docx'].includes(ext!))
    return <FileText className="h-4 w-4 shrink-0 text-blue-600" />;

  if (['xls', 'xlsx'].includes(ext!))
    return <FileSpreadsheet className="h-4 w-4 shrink-0 text-green-600" />;

  if (['ppt', 'pptx'].includes(ext!))
    return <Presentation className="h-4 w-4 shrink-0 text-orange-500" />;

  return <File className="h-4 w-4 shrink-0 text-muted-foreground" />;
};
