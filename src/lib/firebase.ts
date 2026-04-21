import { env } from '@/config/env';
import { getApps, initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const getApp = () => getApps()[0] ?? initializeApp(env.firebase);

/** Returns a Messaging instance, or null when FCM is not supported / not configured. */
export async function getMessagingInstance() {
  if (!env.firebase?.apiKey || !(await isSupported())) return null;
  return getMessaging(getApp());
}
