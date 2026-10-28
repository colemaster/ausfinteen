import { createContext, useContext, useState, useEffect, useSyncExternalStore } from 'react';
import { AGE_PRESETS } from '@/data/teen-age-presets';

export interface TeenProfile {
  name: string;
  age: number; // 14, 15, 16, 17, 18, 19
  location: string; // e.g. "Brisbane, QLD"
  jobType: 'casual_retail' | 'casual_fast_food' | 'casual_hospitality' | 'part_time' | 'apprentice' | 'none';
  hourlyRate: number; // effective junior rate: $13.90 for 15yo casual (40% x $27.81 adult base x 1.25)
  hoursPerWeek: number; // e.g. 8 for 15yo, 12 for 16yo
  claimsTaxFreeThreshold: boolean; // default true
  hasSuperFund: boolean;
  superFundName: string;
  savingsGoalName: string;
  savingsGoalTarget: number;
  currentSavings: number;
  weeklyBoardPaid: number;
  phoneContractMonthly: number;
  hasPartTimeJob: boolean;
  weeklyHours: number;
}

export const DEFAULT_LOCATION = 'Brisbane, QLD';

export const AU_LOCATIONS: string[] = [
  'Brisbane, QLD',
  'Sydney, NSW',
  'Melbourne, VIC',
  'Gold Coast, QLD',
  'Sunshine Coast, QLD',
  'Adelaide, SA',
  'Perth, WA',
  'Hobart, TAS',
  'Canberra, ACT',
  'Darwin, NT',
  'Townsville, QLD',
  'Toowoomba, QLD',
];

const DEFAULT_PROFILE: TeenProfile = {
  name: 'Issy',
  age: 15,
  location: DEFAULT_LOCATION,
  jobType: 'casual_retail',
  hourlyRate: 13.90, // 15yo 2026-27 junior casual rate
  hoursPerWeek: 8,
  claimsTaxFreeThreshold: true,
  hasSuperFund: true,
  superFundName: 'AustralianSuper (Default MySuper)',
  savingsGoalName: 'First Phone & Savings',
  savingsGoalTarget: 1200,
  currentSavings: 350,
  weeklyBoardPaid: 0,
  phoneContractMonthly: 35,
  hasPartTimeJob: true,
  weeklyHours: 8,
};

interface TeenProfileContextType {
  profile: TeenProfile;
  updateProfile: (updates: Partial<TeenProfile>) => void;
  applyAgePreset: (age: number) => void;
  resetProfile: () => void;
  weeklyGrossIncome: number;
  annualGrossIncome: number;
  estimatedTaxWithheldWeekly: number;
  weeklyNetPay: number;
  superEligible: boolean; // under 18 must work >30 hrs/week
  weeklySuperContribution: number;
}

/* ------------------------------------------------------------------ Cross-Island Store */

let memoryProfile: TeenProfile = DEFAULT_PROFILE;

function getStoredProfile(): TeenProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const saved = localStorage.getItem('aus_teen_profile');
    if (saved) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_PROFILE;
}

// Initialise memoryProfile on module load in the browser
if (typeof window !== 'undefined') {
  memoryProfile = getStoredProfile();
}

const subscribers = new Set<() => void>();

function subscribe(callback: () => void) {
  subscribers.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'aus_teen_profile') {
      memoryProfile = getStoredProfile();
      callback();
    }
  };
  const handleCustom = () => {
    memoryProfile = getStoredProfile();
    callback();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    window.addEventListener('aus:profile-change', handleCustom);
  }
  return () => {
    subscribers.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('aus:profile-change', handleCustom);
    }
  };
}

function notifySubscribers() {
  for (const sub of subscribers) {
    try {
      sub();
    } catch {
      // ignore
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aus:profile-change', { detail: memoryProfile }));
  }
}

export function updateStoredProfile(updates: Partial<TeenProfile>): TeenProfile {
  memoryProfile = { ...memoryProfile, ...updates };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('aus_teen_profile', JSON.stringify(memoryProfile));
    } catch {
      // ignore
    }
    notifySubscribers();
  }
  return memoryProfile;
}

export function resetStoredProfile(): TeenProfile {
  memoryProfile = { ...DEFAULT_PROFILE };
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('aus_teen_profile');
    } catch {
      // ignore
    }
    notifySubscribers();
  }
  return memoryProfile;
}

export function applyStoredAgePreset(targetAge: number): TeenProfile {
  const preset = AGE_PRESETS[targetAge] || AGE_PRESETS[15];
  return updateStoredProfile({
    age: preset.age,
    hourlyRate: preset.hourlyRate,
    hoursPerWeek: preset.hoursPerWeek,
    claimsTaxFreeThreshold: preset.claimsTaxFreeThreshold,
    savingsGoalName: preset.savingsGoalName,
    savingsGoalTarget: preset.savingsGoalTarget,
    currentSavings: preset.currentSavings,
    hasPartTimeJob: true,
    weeklyHours: preset.hoursPerWeek,
  });
}

const TeenProfileContext = createContext<TeenProfileContextType | undefined>(undefined);

export function TeenProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<TeenProfile>(() => memoryProfile);

  useEffect(() => {
    return subscribe(() => {
      setProfile(memoryProfile);
    });
  }, []);

  const updateProfile = (updates: Partial<TeenProfile>) => {
    updateStoredProfile(updates);
  };

  const applyAgePreset = (targetAge: number) => {
    applyStoredAgePreset(targetAge);
  };

  const resetProfile = () => {
    resetStoredProfile();
  };

  const weeklyGrossIncome = profile.hourlyRate * profile.hoursPerWeek;
  const annualGrossIncome = weeklyGrossIncome * 52;

  let estimatedTaxWithheldWeekly = 0;
  if (!profile.claimsTaxFreeThreshold) {
    estimatedTaxWithheldWeekly = weeklyGrossIncome * 0.15;
  } else if (weeklyGrossIncome > 350) {
    const taxableWeeklyExcess = weeklyGrossIncome - 350;
    estimatedTaxWithheldWeekly = taxableWeeklyExcess * 0.15;
  }

  const weeklyNetPay = Math.max(0, weeklyGrossIncome - estimatedTaxWithheldWeekly);
  const superEligible = profile.age >= 18 || profile.hoursPerWeek > 30;
  const superRate = 0.12; // 12.0% statutory SG FY26-27
  const weeklySuperContribution = superEligible ? weeklyGrossIncome * superRate : 0;

  return (
    <TeenProfileContext.Provider
      value={{
        profile,
        updateProfile,
        applyAgePreset,
        resetProfile,
        weeklyGrossIncome,
        annualGrossIncome,
        estimatedTaxWithheldWeekly,
        weeklyNetPay,
        superEligible,
        weeklySuperContribution,
      }}
    >
      {children}
    </TeenProfileContext.Provider>
  );
}

export function useTeenProfile(): TeenProfileContextType {
  const ctx = useContext(TeenProfileContext);

  const syncedProfile = useSyncExternalStore(
    subscribe,
    () => memoryProfile,
    () => DEFAULT_PROFILE,
  );

  const profile = ctx?.profile ?? syncedProfile;

  const weeklyGrossIncome = profile.hourlyRate * profile.hoursPerWeek;
  const annualGrossIncome = weeklyGrossIncome * 52;

  let estimatedTaxWithheldWeekly = 0;
  if (!profile.claimsTaxFreeThreshold) {
    estimatedTaxWithheldWeekly = weeklyGrossIncome * 0.15;
  } else if (weeklyGrossIncome > 350) {
    const taxableWeeklyExcess = weeklyGrossIncome - 350;
    estimatedTaxWithheldWeekly = taxableWeeklyExcess * 0.15;
  }

  const weeklyNetPay = Math.max(0, weeklyGrossIncome - estimatedTaxWithheldWeekly);
  const superEligible = profile.age >= 18 || profile.hoursPerWeek > 30;
  const superRate = 0.12; // 12.0% statutory SG FY26-27
  const weeklySuperContribution = superEligible ? weeklyGrossIncome * superRate : 0;

  return {
    profile,
    updateProfile: ctx ? ctx.updateProfile : updateStoredProfile,
    applyAgePreset: ctx ? ctx.applyAgePreset : applyStoredAgePreset,
    resetProfile: ctx ? ctx.resetProfile : resetStoredProfile,
    weeklyGrossIncome,
    annualGrossIncome,
    estimatedTaxWithheldWeekly,
    weeklyNetPay,
    superEligible,
    weeklySuperContribution,
  };
}
