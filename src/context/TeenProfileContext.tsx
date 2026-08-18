import { createContext, useContext, useState, useEffect } from 'react';
import { AGE_PRESETS } from '@/data/teen-finance-data';

export interface TeenProfile {
  name: string;
  age: number; // 15, 16, 17, 18
  location: string; // e.g. "Brisbane, QLD"
  jobType: 'casual_retail' | 'casual_fast_food' | 'casual_hospitality' | 'part_time' | 'apprentice' | 'none';
  hourlyRate: number; // e.g. 16.50 for 15yo, 19.50 for 16yo
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
  hourlyRate: 17.20,
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

const TeenProfileContext = createContext<TeenProfileContextType | undefined>(undefined);

export function TeenProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<TeenProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aus_teen_profile');
      if (saved) {
        try {
          return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
        } catch {
          return DEFAULT_PROFILE;
        }
      }
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aus_teen_profile', JSON.stringify(profile));
    }
  }, [profile]);

  const updateProfile = (updates: Partial<TeenProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const applyAgePreset = (targetAge: number) => {
    const preset = AGE_PRESETS[targetAge] || AGE_PRESETS[15];
    setProfile(prev => ({
      ...prev,
      age: preset.age,
      hourlyRate: preset.hourlyRate,
      hoursPerWeek: preset.hoursPerWeek,
      claimsTaxFreeThreshold: preset.claimsTaxFreeThreshold,
      savingsGoalName: preset.savingsGoalName,
      savingsGoalTarget: preset.savingsGoalTarget,
      currentSavings: preset.currentSavings,
      hasPartTimeJob: true,
      weeklyHours: preset.hoursPerWeek,
    }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('aus_teen_profile');
  };

  // Calculations
  const weeklyGrossIncome = profile.hourlyRate * profile.hoursPerWeek;
  const annualGrossIncome = weeklyGrossIncome * 52;

  let estimatedTaxWithheldWeekly = 0;
  if (!profile.claimsTaxFreeThreshold) {
    estimatedTaxWithheldWeekly = weeklyGrossIncome * 0.16;
  } else if (weeklyGrossIncome > 350) {
    const taxableWeeklyExcess = weeklyGrossIncome - 350;
    estimatedTaxWithheldWeekly = taxableWeeklyExcess * 0.16;
  }

  const weeklyNetPay = Math.max(0, weeklyGrossIncome - estimatedTaxWithheldWeekly);

  // ATO Super Guarantee Rule for Under 18:
  // Must work MORE than 30 hours in a week to get Super Guarantee.
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

const DEFAULT_CONTEXT_VALUE: TeenProfileContextType = {
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
  applyAgePreset: () => {},
  resetProfile: () => {},
  weeklyGrossIncome: DEFAULT_PROFILE.hourlyRate * DEFAULT_PROFILE.hoursPerWeek,
  annualGrossIncome: DEFAULT_PROFILE.hourlyRate * DEFAULT_PROFILE.hoursPerWeek * 52,
  estimatedTaxWithheldWeekly: 0,
  weeklyNetPay: DEFAULT_PROFILE.hourlyRate * DEFAULT_PROFILE.hoursPerWeek,
  superEligible: false,
  weeklySuperContribution: 0,
};

export function useTeenProfile() {
  const context = useContext(TeenProfileContext);
  if (!context) {
    return DEFAULT_CONTEXT_VALUE;
  }
  return context;
}
