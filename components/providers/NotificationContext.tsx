"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  playNotificationChime,
  sendSystemNotification,
  getSoundAlertsEnabled,
  setSoundAlertsEnabled,
  NotificationPermissionState,
} from "@/lib/notifications/engine";

export interface AppNotification {
  id: string;
  type: "ORDER" | "PAYMENT" | "STOCK" | "WARNING" | "SUCCESS" | "ALERT" | "INFO";
  title: string;
  message: string;
  time: string;
  timestamp: number;
  isRead: boolean;
  link?: string;
}

interface NotificationContextType {
  permission: NotificationPermissionState;
  soundEnabled: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  requestPermission: () => Promise<NotificationPermissionState>;
  toggleSound: () => void;
  triggerTestNotification: () => void;
  sendNotification: (params: {
    title: string;
    message: string;
    type?: AppNotification["type"];
    link?: string;
  }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    type: "ORDER",
    title: "New Store Order Received #RS-1049",
    message: "Customer paid ₹2,499 via Razorpay UPI. Ready for verified supplier dispatch.",
    time: "5 minutes ago",
    timestamp: Date.now() - 5 * 60 * 1000,
    isRead: false,
    link: "/app/orders",
  },
  {
    id: "notif-2",
    type: "SUCCESS",
    title: "Batch Fulfillment Auto-Dispatched",
    message: "14 customer parcels routed to CJ Dropshipping YunExpress express line with tracking.",
    time: "25 minutes ago",
    timestamp: Date.now() - 25 * 60 * 1000,
    isRead: false,
    link: "/app/shipping",
  },
  {
    id: "notif-3",
    type: "ALERT",
    title: "Supplier Inventory Alert",
    message: "Primary stock for 'Pet Steam Grooming Brush' low (34 units remaining). Alternate factory active.",
    time: "2 hours ago",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    isRead: false,
    link: "/app/suppliers",
  },
  {
    id: "notif-4",
    type: "INFO",
    title: "Security Session Verified",
    message: "Owner authenticated with encrypted 256-bit credentials from active terminal.",
    time: "Yesterday",
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    isRead: true,
    link: "/app/security",
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermissionState>("default");
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Initialize permission, sound preference, and register service worker on mount
  useEffect(() => {
    setPermission(getNotificationPermission());
    setSoundEnabledState(getSoundAlertsEnabled());

    // Register service worker for background web push
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("RAVAN SHIPPING Service Worker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.warn("Service Worker registration skipped:", err);
        });
    }

    // Load saved notifications if any
    try {
      const saved = localStorage.getItem("ravan_notifications_cache");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed);
        }
      }
    } catch {}
  }, []);

  // Save notifications to localStorage when updated
  const saveNotifications = useCallback((updated: AppNotification[]) => {
    setNotifications(updated);
    try {
      localStorage.setItem("ravan_notifications_cache", JSON.stringify(updated.slice(0, 30)));
    } catch {}
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleSound = useCallback(() => {
    setSoundEnabledState((prev) => {
      const next = !prev;
      setSoundAlertsEnabled(next);
      if (next) {
        playNotificationChime();
      }
      return next;
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === "granted") {
      if (soundEnabled) {
        playNotificationChime();
      }
      sendSystemNotification("Notifications Enabled! 🔔", {
        body: "RAVAN SHIPPING will now alert you for new orders, customer payments, and fulfillment updates.",
        data: { url: "/app/notifications" },
      });
    }
    return result;
  }, [soundEnabled]);

  const sendNotification = useCallback(
    ({
      title,
      message,
      type = "INFO",
      link = "/app/notifications",
    }: {
      title: string;
      message: string;
      type?: AppNotification["type"];
      link?: string;
    }) => {
      // Play audio chime if sound is enabled
      if (soundEnabled) {
        playNotificationChime();
      }

      // Trigger native OS push notification
      sendSystemNotification(title, {
        body: message,
        data: { url: link },
      });

      // Add to in-app notification list
      const newItem: AppNotification = {
        id: `notif-${Date.now()}`,
        type,
        title,
        message,
        time: "Just now",
        timestamp: Date.now(),
        isRead: false,
        link,
      };

      saveNotifications([newItem, ...notifications]);
    },
    [soundEnabled, notifications, saveNotifications]
  );

  const triggerTestNotification = useCallback(() => {
    // Play chime immediately
    playNotificationChime();

    // Fire native desktop/mobile notification
    const dispatched = sendSystemNotification("🔔 RAVAN SHIPPING Alert: Test Notification", {
      body: "Real push notifications and audio chimes are fully functional on your device!",
      data: { url: "/app/notifications" },
    });

    // Add to in-app list
    const testItem: AppNotification = {
      id: `test-${Date.now()}`,
      type: "SUCCESS",
      title: "Test Alert Dispatched Successfully",
      message: dispatched
        ? "Desktop/Mobile push notification was triggered with audio chime."
        : "In-app audio chime played. Allow browser notifications above for system pop-ups.",
      time: "Just now",
      timestamp: Date.now(),
      isRead: false,
      link: "/app/notifications",
    };

    saveNotifications([testItem, ...notifications]);
  }, [notifications, saveNotifications]);

  const markAsRead = useCallback(
    (id: string) => {
      saveNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    },
    [notifications, saveNotifications]
  );

  const markAllAsRead = useCallback(() => {
    saveNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  }, [notifications, saveNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        soundEnabled,
        notifications,
        unreadCount,
        requestPermission,
        toggleSound,
        triggerTestNotification,
        sendNotification,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
