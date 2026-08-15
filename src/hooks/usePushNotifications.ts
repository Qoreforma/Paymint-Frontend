import { useState, useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "../lib/firebase";
import { updateProfile } from "../lib/api/authApi";
import { useAuth } from "../context/AuthContext";

export const isNotificationSupported = (): boolean => {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    typeof Notification !== "undefined"
  );
};

const getInitialNotificationPermission = (): NotificationPermission => {
  if (isNotificationSupported()) {
    try {
      return Notification.permission;
    } catch {
      return "denied";
    }
  }
  return "denied";
};

export const usePushNotifications = () => {
  const [isSupported] = useState<boolean>(isNotificationSupported);
  const [permission, setPermission] = useState<NotificationPermission>(
    getInitialNotificationPermission
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isNotificationSupported()) {
      try {
        setPermission(Notification.permission);
      } catch {
        setPermission("denied");
      }
    }
  }, []);

  const requestPermissionAndGetToken = async () => {
    if (!isNotificationSupported()) {
      console.warn("Notification API is not supported in this browser environment.");
      return null;
    }

    try {
      setLoading(true);
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        if (!messaging) {
          console.warn("Firebase messaging is not supported in this browser.");
          setLoading(false);
          return null;
        }
        
        // Generate FCM token
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });

        if (token) {
          setFcmToken(token);
          // Sync with backend if user is logged in
          if (user) {
            await updateProfile({ fcmToken: token });
          }
        } else {
          console.log("No registration token available. Request permission to generate one.");
        }
        setLoading(false);
        return token;
      } else {
        console.log("Unable to get permission to notify.");
      }
    } catch (error) {
      console.error("An error occurred while retrieving token. ", error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  return { isSupported, permission, fcmToken, requestPermissionAndGetToken, loading };
};
