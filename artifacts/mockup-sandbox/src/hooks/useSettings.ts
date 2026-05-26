import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../lib/api";
import { useUIStore } from "../store/uiStore";
import { useI18n } from "../lib/i18n";

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
    dlPhotoChannel: true,
    dlVideoChannel: false,
    dlFileChannel: false,
    proxyOn: false,
    proxyHost: '',
    proxyPort: '',
    proxyUser: '',
    proxyPass: '',
    roaming: false,
    maxFileSize: 10,
    useLessData: false,
    bytesSent: 0,
    bytesReceived: 0,
  },
};

// Sync appearance settings with UI store
function getSystemDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function syncAppearanceWithUI(appearance: Settings['appearance']) {
  const { setFontSize, setChatBgId, setDarkMode } = useUIStore.getState();
  if (appearance.fontSize !== undefined) setFontSize(appearance.fontSize);
  if (appearance.chatBg !== undefined) setChatBgId(appearance.chatBg);

  // Theme: night = dark, day = light, system = OS preference
  let isDark = false;
  if (appearance.theme === 'night') isDark = true;
  else if (appearance.theme === 'system') isDark = getSystemDark();

  setDarkMode(isDark);
}

function mapLangToLocale(lang: string): "ru" | "en" {
  const map: Record<string, "ru" | "en"> = {
    Russian: "ru",
    English: "en",
    German: "en",
    French: "en",
    Spanish: "en",
    Italian: "en",
    Portuguese: "en",
    "Chinese (Simplified)": "en",
    Japanese: "en",
    Korean: "en",
    Arabic: "en",
    Turkish: "en",
  };
  return map[lang] || "en";
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setLocale } = useI18n();

  const loadSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      const merged = {
        notifications: { ...DEFAULT_SETTINGS.notifications, ...data.notifications },
        privacy: { ...DEFAULT_SETTINGS.privacy, ...data.privacy },
        appearance: { ...DEFAULT_SETTINGS.appearance, ...data.appearance },
        language: { ...DEFAULT_SETTINGS.language, ...data.language },
        data: { ...DEFAULT_SETTINGS.data, ...data.data },
      };
      setSettings(merged);
      syncAppearanceWithUI(merged.appearance);
      setLocale(mapLangToLocale(merged.language.lang));
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, [setLocale]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Listen for system theme changes when theme is set to "system"
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (settings.appearance.theme === 'system') {
        syncAppearanceWithUI(settings.appearance);
      }
    };
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, [settings.appearance]);

  const updateSettings = useCallback((category: keyof Settings, values: Record<string, any>) => {
    setSettings((prev) => {
      const updated = { ...prev, [category]: { ...prev[category], ...values } };

      // Sync appearance changes to UI store immediately
      if (category === 'appearance') {
        syncAppearanceWithUI(updated.appearance);
      }

      // Sync language changes to i18n immediately
      if (category === 'language' && values.lang !== undefined) {
        setLocale(mapLangToLocale(values.lang));
      }

      // Debounced save to server
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        api.updateSettings({ [category]: updated[category] }).catch((err) => {
          console.error("Failed to save settings:", err);
        });
      }, 500);

      return updated;
    });
  }, [setLocale]);

  return { settings, loading, updateSettings, reload: loadSettings };
}
