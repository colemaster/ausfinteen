import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface PortfolioData {
  // Income & Tax
  grossSalary: number;
  margTax: number;
  // Cash & Savings
  savingsBalance: number;
  monthlySavingsContrib: number;
  // Property & Mortgage
  propertyValue: number;
  mortgageBalance: number;
  mortgageRate: number;
  mortgageYearsRemaining: number;
  // Investments (ETF / shares)
  etfValue: number;
  monthlyEtfContrib: number;
  etfReturn: number;
  // Superannuation
  superBalance: number;
  monthlySuperContrib: number;
  // Living expenses — itemised (annual $)
  expRent: number;
  expGroceries: number;
  expDining: number;
  expUtilities: number;
  expInternet: number;
  expTransport: number;
  expHealth: number;
  expInsurance: number;
  expEntertainment: number;
  expClothing: number;
  expEducation: number;
  expChildcare: number;
  expTravel: number;
  expGym: number;
  expHomeMaint: number;
  expPets: number;
  expMisc: number;
}

export const PORTFOLIO_EMPTY: PortfolioData = {
  grossSalary: 0, margTax: 0,
  savingsBalance: 0, monthlySavingsContrib: 0,
  propertyValue: 0, mortgageBalance: 0, mortgageRate: 0, mortgageYearsRemaining: 0,
  etfValue: 0, monthlyEtfContrib: 0, etfReturn: 0,
  superBalance: 0, monthlySuperContrib: 0,
  expRent: 0, expGroceries: 0, expDining: 0, expUtilities: 0,
  expInternet: 0, expTransport: 0, expHealth: 0, expInsurance: 0,
  expEntertainment: 0, expClothing: 0, expEducation: 0, expChildcare: 0,
  expTravel: 0, expGym: 0, expHomeMaint: 0, expPets: 0, expMisc: 0,
};

const PORTFOLIO_STORAGE_KEY = 'aus_portfolio_data';
const PORTFOLIO_CHANGE_EVENT = 'aus:portfolio-change';

let memoryPortfolio: PortfolioData = PORTFOLIO_EMPTY;
const subscribers = new Set<() => void>();

export function getStoredPortfolio(): PortfolioData {
  if (typeof window === 'undefined') return PORTFOLIO_EMPTY;
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) return PORTFOLIO_EMPTY;
    const parsed = JSON.parse(raw) as Partial<PortfolioData>;
    return { ...PORTFOLIO_EMPTY, ...parsed };
  } catch {
    return PORTFOLIO_EMPTY;
  }
}

export function updateStoredPortfolio(updates: Partial<PortfolioData>): PortfolioData {
  const current = typeof window !== 'undefined' ? getStoredPortfolio() : memoryPortfolio;
  const next: PortfolioData = { ...current, ...updates };
  memoryPortfolio = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(PORTFOLIO_CHANGE_EVENT, { detail: next }));
    } catch {
      // Ignore storage quota errors
    }
  }
  subscribers.forEach(cb => cb());
  return next;
}

export function totalAnnualExpenses(p: PortfolioData): number {
  // Fields store monthly amounts; multiply by 12 for annual total
  return (
    p.expRent + p.expGroceries + p.expDining + p.expUtilities +
    p.expInternet + p.expTransport + p.expHealth + p.expInsurance +
    p.expEntertainment + p.expClothing + p.expEducation + p.expChildcare +
    p.expTravel + p.expGym + p.expHomeMaint + p.expPets + p.expMisc
  ) * 12;
}

interface PortfolioContextType {
  portfolio: PortfolioData;
  setPortfolio: (updates: Partial<PortfolioData>) => void;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolioState] = useState<PortfolioData>(PORTFOLIO_EMPTY);

  useEffect(() => {
    setPortfolioState(getStoredPortfolio());
    const sync = () => setPortfolioState(getStoredPortfolio());
    subscribers.add(sync);
    window.addEventListener('storage', sync);
    return () => {
      subscribers.delete(sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setPortfolio = useCallback((updates: Partial<PortfolioData>) => {
    const next = updateStoredPortfolio(updates);
    setPortfolioState(next);
  }, []);

  return (
    <PortfolioContext.Provider value={{ portfolio, setPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextType {
  const ctx = useContext(PortfolioContext);
  const [localPortfolio, setLocalPortfolio] = useState<PortfolioData>(PORTFOLIO_EMPTY);

  useEffect(() => {
    if (ctx) return;
    setLocalPortfolio(getStoredPortfolio());
    const sync = () => setLocalPortfolio(getStoredPortfolio());
    subscribers.add(sync);
    window.addEventListener('storage', sync);
    return () => {
      subscribers.delete(sync);
      window.removeEventListener('storage', sync);
    };
  }, [ctx]);

  const setPortfolio = useCallback((updates: Partial<PortfolioData>) => {
    const next = updateStoredPortfolio(updates);
    setLocalPortfolio(next);
  }, []);

  if (ctx) return ctx;
  return { portfolio: localPortfolio, setPortfolio };
}
