import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isOnline: boolean | null;
  lastSeenAt: string | null;
  twoFAEnabled: boolean | null;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getMe();
      setProfile(data.user || data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      // Convert nulls to undefined for API compatibility
      const cleaned: Record<string, any> = {};
      for (const [key, value] of Object.entries(updates)) {
        cleaned[key] = value === null ? undefined : value;
      }
      const data = await api.updateProfile(cleaned);
      setProfile((prev) => (prev ? { ...prev, ...data } : data));
      return data;
    } catch (err: any) {
      throw new Error(err.message || "Failed to update profile");
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    const result = await api.uploadFile(file);
    await updateProfile({ avatarUrl: result.url });
    return result.url;
  }, [updateProfile]);

  return { profile, loading, reload: loadProfile, updateProfile, uploadAvatar };
}
