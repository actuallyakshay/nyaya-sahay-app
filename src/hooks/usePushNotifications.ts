import { syncFcmToken } from '@/hooks/use-fcm-token';
import { useCallback, useEffect, useState } from 'react';

type PermissionStatus = NotificationPermission | 'unsupported';

function readPermission(): PermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function usePushNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(readPermission);

  // Sync token automatically when permission is already granted (e.g. returning user).
  useEffect(() => {
    if (permissionStatus === 'granted') {
      void syncFcmToken();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermissionStatus('unsupported');
      return;
    }

    let result: NotificationPermission = Notification.permission;
    if (result === 'default') {
      result = await Notification.requestPermission();
      setPermissionStatus(result);
    }

    if (result === 'granted') {
      await syncFcmToken();
    }
  }, []);

  return { permissionStatus, requestPermission };
}
