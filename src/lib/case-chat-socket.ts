import { env } from '@/config/env';
import { getCookie } from '@/lib/helpers';
import { io, type Socket } from 'socket.io-client';

/**
 * Socket.IO event names — must stay aligned with
 * `nyaya/src/case-chat/case-chat.constants.ts`.
 */
export const CHAT_JOIN = 'chat.join';
export const CHAT_SEND = 'chat.send';
export const CHAT_MESSAGE = 'chat.message';
export const CHAT_NOTIFY = 'chat.notify';
export const CHAT_ERROR = 'chat.error';

export const CASE_CHAT_IO_PATH = '/api/socket.io';

/** Shared options for every case-chat Socket.IO client in the app. */
export function createCaseChatSocket(): Socket | null {
  if (!env.apiOrigin) return null;
  const activeRole = getCookie('x-active-role');
  return io(env.apiOrigin, {
    path: CASE_CHAT_IO_PATH,
    withCredentials: true,
    auth: { activeRole: activeRole || undefined },
    transports: ['websocket'],
  });
}
