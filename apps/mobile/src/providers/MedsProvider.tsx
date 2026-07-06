import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Med, apiGetAllMeds, apiCreateMed, apiDeleteMed, apiToggleMed } from '@emour/core';
import { scheduleMedNotifications, cancelMedNotifications } from '@/services/notifications';
import { getNotifIds, saveNotifIds, removeNotifIds } from '@/services/medsStorage';

interface MedsContextType {
  meds: Med[];
  isLoading: boolean;
  addMed: (name: string, dosage: string, times: string[]) => Promise<void>;
  removeMed: (id: number) => Promise<void>;
  toggleMed: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const MedsContext = createContext<MedsContextType | undefined>(undefined);

export function MedsProvider({ children }: { children: React.ReactNode }) {
  const [meds, setMeds] = useState<Med[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMeds = useCallback(async () => {
    try {
      const data = await apiGetAllMeds();
      setMeds(data);

      // Ensure notifications are scheduled for all enabled meds.
      // Reschedules if the app was reinstalled or notifications were cleared.
      for (const med of data) {
        if (!med.enabled) continue;
        const existing = await getNotifIds(med.id);
        if (existing.length === 0) {
          const ids = await scheduleMedNotifications(med.name, med.dosage, med.times);
          await saveNotifIds(med.id, ids);
        }
      }
    } catch (err) {
      console.warn('meds load error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeds();
  }, []);

  const refresh = useCallback(async () => {
      await loadMeds()
  }, [loadMeds]);

  const addMed = useCallback(async (name: string, dosage: string, times: string[]) => {
    const localTime = new Date().toISOString();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const med = await apiCreateMed(name, dosage, times, localTime, timezone);
    setMeds(prev => [med, ...prev]);
    try {
      const notifIds = await scheduleMedNotifications(med.name, med.dosage, med.times);
      console.log('scheduled notif ids:', notifIds);
      await saveNotifIds(med.id, notifIds);
    } catch (err) {
      console.warn('notifications schedule error', err);
    }
  }, []);

  const removeMed = useCallback(async (id: number) => {
    const notifIds = await getNotifIds(id);
    await cancelMedNotifications(notifIds);
    await removeNotifIds(id);
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
    } else {
      const notifIds = await scheduleMedNotifications(med.name, med.dosage, med.times);
      await saveNotifIds(id, notifIds);
    }

    await apiToggleMed(id, !med.enabled);
    setMeds(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  }, [meds]);

  return (
    <MedsContext.Provider value={{ meds, isLoading, addMed, removeMed, toggleMed, refresh }}>
      {children}
    </MedsContext.Provider>
  );
}

export function useMeds() {
  const ctx = useContext(MedsContext);
  if (!ctx) throw new Error('useMeds must be used within MedsProvider');
  return ctx;
}
