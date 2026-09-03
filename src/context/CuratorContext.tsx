import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CuratorAssignment } from '../types';
import { useAuth } from './AuthContext';
import { getTodayDateString } from '../data/words';

interface TodayCuratorInfo {
  displayName: string;
  department: string;
  note?: string;
}

interface CuratorContextType {
  assignment: CuratorAssignment | null;
  todayCurator: TodayCuratorInfo;
  isUserCurator: boolean;
  loading: boolean;
  activeUsersCount: number;
  claimCuratorRole: () => Promise<void>;
  randomizeCurator: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const CuratorContext = createContext<CuratorContextType | undefined>(undefined);

export const CuratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<CuratorAssignment | null>(null);
  const [todayCurator, setTodayCurator] = useState<TodayCuratorInfo>({
    displayName: 'Tereza Novotná',
    department: 'Produktový management',
    note: 'Vybrala jsem pro vás dnešní slova z firemní praxe i mezinárodní spolupráce. Hodně štěstí při hádání!'
  });
  const [activeUsersCount, setActiveUsersCount] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(true);

  const todayStr = getTodayDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/curator/status?dateKey=${todayStr}&targetDateKey=${tomorrowStr}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.assignment) setAssignment(data.assignment);
          if (data.todayCurator) setTodayCurator(data.todayCurator);
          if (typeof data.activeUsersCount === 'number') setActiveUsersCount(data.activeUsersCount);
        }
      }
    } catch (e) {
      console.warn('Could not fetch curator status:', e);
    } finally {
      setLoading(false);
    }
  }, [todayStr, tomorrowStr]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Determine if current user is curator
  const isUserCurator = Boolean(
    user && assignment && (
      assignment.curatorUid === user.uid ||
      user.role?.toLowerCase().includes('kurátor') ||
      user.role?.toLowerCase().includes('admin')
    )
  );

  const claimCuratorRole = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/curator/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDateKey: tomorrowStr,
          curatorUid: user.uid,
          curatorDisplayName: user.displayName,
          curatorDepartment: user.department
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.assignment) {
          setAssignment(json.assignment);
        }
      }
    } catch (e) {
      console.error('Error claiming curator role:', e);
    }
  };

  const randomizeCurator = async () => {
    // Pick another colleague from team/active users (excluding current user to ensure clean transfer)
    const colleagues = [
      { uid: 'colleague_1', displayName: 'Tereza Novotná', department: 'Produktový management' },
      { uid: 'colleague_2', displayName: 'Martin Dvořák', department: 'Datová analytika & AI' },
      { uid: 'colleague_3', displayName: 'Petra Černá', department: 'UX & Product Design' },
      { uid: 'colleague_4', displayName: 'Lukáš Veselý', department: 'Backend & Cloud Infra' },
      { uid: 'colleague_5', displayName: 'Jana Králová', department: 'Marketing & Komunikace' }
    ].filter((c) => !user || c.uid !== user.uid);

    const picked = colleagues[Math.floor(Math.random() * colleagues.length)];
    try {
      const res = await fetch('/api/curator/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDateKey: tomorrowStr,
          curatorUid: picked.uid,
          curatorDisplayName: picked.displayName,
          curatorDepartment: picked.department
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.assignment) {
          setAssignment(json.assignment);
        }
      }
    } catch (e) {
      console.error('Error randomizing curator:', e);
    }
  };

  return (
    <CuratorContext.Provider
      value={{
        assignment,
        todayCurator,
        isUserCurator,
        loading,
        activeUsersCount,
        claimCuratorRole,
        randomizeCurator,
        refreshStatus
      }}
    >
      {children}
    </CuratorContext.Provider>
  );
};

export const useCurator = (): CuratorContextType => {
  const context = useContext(CuratorContext);
  if (!context) {
    throw new Error('useCurator must be used within a CuratorProvider');
  }
  return context;
};
