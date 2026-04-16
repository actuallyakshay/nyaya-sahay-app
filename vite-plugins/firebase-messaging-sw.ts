import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';

const FIREBASE_JS_COMPAT = '12.12.0';

/** Browser JS — emitted to `public/` so Vite always serves `/firebase-messaging-sw.js` (any dev port; background tab flow). */
function buildSwJs(env: Record<string, string>): string | null {
  const apiKey = env.VITE_FIREBASE_API_KEY;
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = env.VITE_FIREBASE_APP_ID;
  if (!apiKey || !projectId || !messagingSenderId || !appId) return null;
  const config = {
    apiKey,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId,
    appId,
  };
  return `/* auto-generated — Firebase Cloud Messaging (from .env) */
importScripts('https://www.gstatic.com/firebasejs/${FIREBASE_JS_COMPAT}/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/${FIREBASE_JS_COMPAT}/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();
/**
 * Main flow you want: user on another tab / this tab hidden → push lands here → OS notification.
 * (When this tab is focused, the page uses onMessage instead — see use-fcm-token.ts.)
 */
messaging.setBackgroundMessageHandler(function (payload) {
  const n = payload.notification || {};
  const title = n.title || (payload.data && payload.data.title) || 'Notification';
  const body = n.body || (payload.data && payload.data.body) || '';
  const icon = n.icon || (payload.data && payload.data.icon) || undefined;
  var safeData = {};
  if (payload.data) {
    Object.keys(payload.data).forEach(function (k) {
      var v = payload.data[k];
      if (v != null && v !== '') safeData[k] = String(v);
    });
  }
  var opts = {
    body: body || undefined,
    icon: icon,
    tag: (payload.data && payload.data.tag) || String(Date.now()),
    requireInteraction: false,
  };
  if (Object.keys(safeData).length) opts.data = safeData;
  return self.registration.showNotification(title, opts).catch(function (err) {
    console.error('[FCM SW] showNotification failed', err);
  });
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var raw = (event.notification && event.notification.data && event.notification.data.url) || '/';
  var url = raw.indexOf('http') === 0 ? raw : self.location.origin + (raw.charAt(0) === '/' ? raw : '/' + raw);
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      var origin = self.location.origin;
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(origin) === 0 && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
`;
}

function writePublicSw(root: string, mode: string) {
  const env = loadEnv(mode, root, 'VITE_');
  const js = buildSwJs(env);
  const dest = path.resolve(root, 'public', 'firebase-messaging-sw.js');
  if (!js) {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, js, 'utf8');
}

export function firebaseMessagingSwPlugin(): Plugin {
  let root = process.cwd();
  let resolvedMode = 'development';

  return {
    name: 'firebase-messaging-sw',
    configResolved(config) {
      root = config.root;
      resolvedMode = config.mode;
      writePublicSw(root, resolvedMode);
    },
    configureServer(_server: ViteDevServer) {
      /* Re-write on dev start so `public/` is fresh even if .env changed after configResolved. */
      writePublicSw(root, resolvedMode);
    },
  };
}
