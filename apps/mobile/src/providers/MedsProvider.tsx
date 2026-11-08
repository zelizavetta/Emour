import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Med, apiGetAllMeds, apiCreateMed, apiDeleteMed, apiToggleMed } from '@emour/core';
import {
  scheduleMedNotifications,
  scheduleFollowUpNotifications,
  cancelMedNotifications,
  setupMedCategory,
  MED_TAKEN_ACTION,
} from '@/services/notifications';
import {
  getNotifIds,
  saveNotifIds,
  removeNotifIds,
  getFollowUpIds,
  saveFollowUpIds,
  removeFollowUpIds,
  markMedTakenToday,
  isMedTakenToday,
  loadAllTakenTodayIds,
} from '@/services/medsStorage';

interface MedsContextType {
  meds: Med[];
  isLoading: boolean;
  takenToday: Set<number>;
  addMed: (name: string, dosage: string, times: string[], days: number[]) => Promise<void>;
  removeMed: (id: number) => Promise<void>;
  toggleMed: (id: number) => Promise<void>;
  confirmTaken: (medId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const MedsContext = createContext<MedsContextType | undefined>(undefined);

// Returns true if any scheduled time for this med is within the past 60 minutes today.
function hasOverdueTime(med: Med): boolean {
  const now = new Date();
  const todayWeekday = now.getDay() === 0 ? 7 : now.getDay();
  const days = med.days ?? [1, 2, 3, 4, 5, 6, 7];
  if (!days.includes(todayWeekday)) return false;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  for (const time of med.times) {
    const [h, m] = time.split(':').map(Number);
    const minutesScheduled = h * 60 + m;
    const diff = minutesNow - minutesScheduled;
    if (diff >= 0 && diff <= 60) return true;
  }
  return false;
}

export function MedsProvider({ children }: { children: React.ReactNode }) {
  const [meds, setMeds] = useState<Med[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [takenToday, setTakenToday] = useState<Set<number>>(new Set());

  const medsRef = useRef<Med[]>([]);
  const takenRef = useRef<Set<number>>(new Set());
  medsRef.current = meds;
  takenRef.current = takenToday;

  // Cancel old follow-ups, then schedule new ones for every overdue med not yet taken.
  const checkAndScheduleFollowUps = useCallback(async (
    currentMeds: Med[],
    currentTaken: Set<number>,
  ) => {
    for (const med of currentMeds) {
      if (!med.enabled) continue;
      if (currentTaken.has(med.id)) continue;
      if (!hasOverdueTime(med)) continue;

      const existingIds = await getFollowUpIds(med.id);
      if (existingIds.length > 0) {
        await cancelMedNotifications(existingIds);
      }
      const followUpIds = await scheduleFollowUpNotifications(med.id, med.name, med.dosage);
      await saveFollowUpIds(med.id, followUpIds);
    }
  }, []);

  const loadMeds = useCallback(async () => {
    try {
      const data = await apiGetAllMeds();

      const takenIds = await loadAllTakenTodayIds();
      const takenSet = new Set(takenIds);
      setTakenToday(takenSet);

      setMeds(data);

      for (const med of data) {
        if (!med.enabled) continue;
        const existing = await getNotifIds(med.id);
        if (existing.length === 0) {
          const ids = await scheduleMedNotifications(med.id, med.name, med.dosage, med.times, med.days ?? [1, 2, 3, 4, 5, 6, 7]);
          await saveNotifIds(med.id, ids);
        }
      }

      await checkAndScheduleFollowUps(data, takenSet);
    } catch (err) {
      console.warn('meds load error', err);
    } finally {
      setIsLoading(false);
    }
  }, [checkAndScheduleFollowUps]);

  useEffect(() => {
    setupMedCategory().catch(() => {});
    loadMeds();
  }, []);

  // Re-check for overdue meds when app comes to the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkAndScheduleFollowUps(medsRef.current, takenRef.current).catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [checkAndScheduleFollowUps]);

  // Handle "Принял" action from the notification tray.
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      if (response.actionIdentifier !== MED_TAKEN_ACTION) return;
      const data = response.notification.request.content.data as { medId?: number };
      if (data?.medId !== undefined) {
        confirmTaken(data.medId).catch(() => {});
      }
    });
    return () => subscription.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    await loadMeds();
  }, [loadMeds]);

  const confirmTaken = useCallback(async (medId: number) => {
    await markMedTakenToday(medId);
    setTakenToday(prev => new Set([...prev, medId]));
    const ids = await getFollowUpIds(medId);
    if (ids.length > 0) {
      await cancelMedNotifications(ids);
      await removeFollowUpIds(medId);
    }
  }, []);

  const addMed = useCallback(async (name: string, dosage: string, times: string[], days: number[]) => {
    const localTime = new Date().toISOString();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const med = await apiCreateMed(name, dosage, times, days, localTime, timezone);
    setMeds(prev => [med, ...prev]);
    try {
      const notifIds = await scheduleMedNotifications(med.id, med.name, med.dosage, med.times, med.days);
      await saveNotifIds(med.id, notifIds);
    } catch (err) {
      console.warn('notifications schedule error', err);
    }
  }, []);

  const removeMed = useCallback(async (id: number) => {
    const notifIds = await getNotifIds(id);
    await cancelMedNotifications(notifIds);
    await removeNotifIds(id);
    const followUpIds = await getFollowUpIds(id);
    if (followUpIds.length > 0) {
      await cancelMedNotifications(followUpIds);
      await removeFollowUpIds(id);
    }
    await apiDeleteMed(id);
    setMeds(prev => prev.filter(m => m.id !== id));
  }, []);

  const toggleMed = useCallback(async (id: number) => {
    const med = meds.find(m => m.id === id);
    if (!med) return;

    if (med.enabled) {
      const notifIds = await getNotifIds(id);
      await cancelMedNotifications(notifIds);
      await removeNotifIds(id);
      const followUpIds = await getFollowUpIds(id);
      if (followUpIds.length > 0) {
        await cancelMedNotifications(followUpIds);
        await removeFollowUpIds(id);
      }
    } else {
      const notifIds = await scheduleMedNotifications(med.id, med.name, med.dosage, med.times, med.days ?? [1, 2, 3, 4, 5, 6, 7]);
      await saveNotifIds(id, notifIds);
    }

    await apiToggleMed(id, !med.enabled);
    setMeds(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  }, [meds]);

  return (
    <MedsContext.Provider value={{ meds, isLoading, takenToday, addMed, removeMed, toggleMed, confirmTaken, refresh }}>
      {children}
    </MedsContext.Provider>
  );
}

export function useMeds() {
  const ctx = useContext(MedsContext);
  if (!ctx) throw new Error('useMeds must be used within MedsProvider');
  return ctx;
}
