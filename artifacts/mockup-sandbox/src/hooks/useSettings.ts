import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../lib/api";

interface Settings {
  notifications: Record<string, any>;
  privacy: Record<string, any>;
  appearance: Record<string, any>;
  language: Record<string, any>;
  data: Record<string, any>;
}

const DEFAULT_SETTINGS: Settings = {
  notifications: {
    privateChats: true,
    privateSound: true,
    privatePreview: true,
    privateBadge: true,
    groups: true,
    groupSound: false,
    groupPreview: true,
    groupBadge: true,
    channels: true,
    channelSound: false,
    channelPreview: false,
    channelBadge: true,
    countUnread: true,
    includeArchived: false,
  },
  privacy: {
    lastSeen: "Everyone",
    profilePhoto: "Everyone",
    forwardedFrom: "Everyone",
    phoneNumber: "My Contacts",
    calls: "Everyone",
    groupAdd: "My Contacts",
  },
  appearance: {
    theme: "day",
    chatBg: "default",
    fontSize: 15,
    bigEmoji: true,
    bubbles: true,
    animateEmoji: true,
    reduceMotion: false,
    increaseContrast: false,
  },
  language: {
    lang: "English",
    translateMessages: false,
    showTranslateButton: true,
  },
  data: {
    dlPhotoPrivate: true,
    dlVideoPrivate: false,
    dlFilePrivate: false,
    dlPhotoGroup: true,
    dlVideoGroup: false,
    dlFileGroup: false,
    proxyOn: false,
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setSettings({
        notifications: { ...DEFAULT_SETTINGS.notifications, ...data.notifications },
        privacy: { ...DEFAULT_SETTINGS.privacy, ...data.privacy },
        appearance: { ...DEFAULT_SETTINGS.appearance, ...data.appearance },
        language: { ...DEFAULT_SETTINGS.language, ...data.language },
        data: { ...DEFAULT_SETTINGS.data, ...data.data },
      });
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback((category: keyof Settings, values: Record<string, any>) => {
    setSettings((prev) => {
      const updated = { ...prev, [category]: { ...prev[category], ...values } };

      // Debounced save to server
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        api.updateSettings({ [category]: updated[category] }).catch((err) => {
          console.error("Failed to save settings:", err);
        });
      }, 500);

      return updated;
    });
  }, []);

  return { settings, loading, updateSettings, reload: loadSettings };
}
