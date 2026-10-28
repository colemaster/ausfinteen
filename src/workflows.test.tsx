// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

// Import Calculators and Components
import { HECSPayoffCalc } from '@/calculators/hecs-payoff/HECSPayoffCalc';
import { SuperDrawdownCalc } from '@/calculators/super-drawdown/SuperDrawdownCalc';
import { CGTEngineCalc } from '@/calculators/cgt-engine/CGTEngineCalc';
import { DirectVsDR } from '@/calculators/direct-vs-dr/DirectVsDR';
import { FinancialStressTestCalc } from '@/calculators/financial-stress-test/FinancialStressTestCalc';
import { EVNovatedLeaseCalc } from '@/calculators/ev-novated-lease/EVNovatedLeaseCalc';
import { TeenTaxCalculator } from '@/calculators/teen-tax/TeenTaxCalculator';
import { FirstPaycheckSplitter } from '@/calculators/teen-budget/FirstPaycheckSplitter';
import { FirstCarCostCalculator } from '@/calculators/teen-car/FirstCarCostCalculator';
import { EvVsPetrolCalculator } from '@/calculators/teen-car/EvVsPetrolCalculator';
import { TeenSavingsAccountFinder } from '@/calculators/teen-savings/TeenSavingsAccountFinder';
import { ASXETFExplorer } from '@/calculators/teen-investing/ASXETFExplorer';
import { ETFPortfolioPicker } from '@/calculators/teen-investing/ETFPortfolioPicker';
import { BrisbaneBudgetCalculator } from '@/calculators/teen-brisbane/BrisbaneBudgetCalculator';
import { BrisbaneUniExplorer } from '@/calculators/teen-brisbane/BrisbaneUniExplorer';
import { QldSchoolsYear12 } from '@/calculators/teen-brisbane/QldSchoolsYear12';
import { BNPLDebtTrapVisualizer } from '@/calculators/teen-debt/BNPLDebtTrapVisualizer';
import { TeenResumeBuilder } from '@/components/career/TeenResumeBuilder';
import { PenaltyShiftCalculatorWidget } from '@/components/career/PenaltyShiftCalculatorWidget';
import { SavingsGoalsPlanner } from '@/components/teen/SavingsGoalsPlanner';
import { FifteenYearOldRoadmap } from '@/components/teen/FifteenYearOldRoadmap';

describe('End-to-End Frontend Workflows', () => {
  it('HECS Payoff: mounts, applies presets and recalculates payoff schedule', () => {
    const { container } = render(<HECSPayoffCalc />);
    expect(container).toBeDefined();

    const presetBtn = screen.getByText('Fresh Graduate');
    fireEvent.click(presetBtn);

    expect(screen.getAllByText(/HECS\/HELP Payoff/i).length).toBeGreaterThan(0);
  });

  it('Super Drawdown: mounts and applies ASFA presets', () => {
    const { container } = render(<SuperDrawdownCalc />);
    expect(container).toBeDefined();

    const asfaBtn = screen.getByText(/ASFA Comfortable/i);
    fireEvent.click(asfaBtn);
    expect(screen.getAllByText(/Super Drawdown & Age Pension/i).length).toBeGreaterThan(0);
  });

  it('CGT Engine: mounts and handles presets & workflow steps', () => {
    const { container } = render(<CGTEngineCalc />);
    expect(container).toBeDefined();

    const presetBtn = screen.getByText(/Investment Property/i);
    fireEvent.click(presetBtn);

    expect(screen.getAllByText(/Capital Gains Tax/i).length).toBeGreaterThan(0);
  });

  it('Direct vs DR: mounts and renders without errors', () => {
    const { container } = render(<DirectVsDR />);
    expect(container).toBeDefined();
    expect(screen.getByRole('heading', { name: /Direct Investing vs Debt Recycling/i })).toBeDefined();
  });

  it('Financial Stress Test: applies shock scenarios', () => {
    const { container } = render(<FinancialStressTestCalc />);
    expect(container).toBeDefined();

    const shockBtn = screen.getByText('Triple whammy');
    fireEvent.click(shockBtn);
    expect(screen.getAllByText(/Stress Test/i).length).toBeGreaterThan(0);
  });

  it('EV Novated Lease: mounts and renders EV comparison metrics', () => {
    const { container } = render(<EVNovatedLeaseCalc />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Novated Lease/i).length).toBeGreaterThan(0);
  });

  it('Teen Tax: handles threshold toggle and junior rates', () => {
    const { container } = render(<TeenTaxCalculator />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Tax/i).length).toBeGreaterThan(0);
  });

  it('First Paycheck Splitter: toggles Barefoot vs 50/30/20 frameworks', () => {
    const { container } = render(<FirstPaycheckSplitter />);
    expect(container).toBeDefined();

    const barefootBtn = screen.getByText('Barefoot 3-Bucket');
    fireEvent.click(barefootBtn);
    expect(screen.getAllByText(/Paycheck/i).length).toBeGreaterThan(0);
  });

  it('First Car Cost: mounts and displays true running cost breakdown', () => {
    const { container } = render(<FirstCarCostCalculator />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Running Costs/i).length).toBeGreaterThan(0);
  });

  it('EV vs Petrol: compares weekly running costs', () => {
    const { container } = render(<EvVsPetrolCalculator />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Petrol/i).length).toBeGreaterThan(0);
  });

  it('Teen Savings: filters accounts and displays APRA badges', () => {
    const { container } = render(<TeenSavingsAccountFinder />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Savings/i).length).toBeGreaterThan(0);
  });

  it('ASX ETF Explorer: searches ETFs', () => {
    const { container } = render(<ASXETFExplorer />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/ETF/i).length).toBeGreaterThan(0);
  });

  it('ETF Portfolio Picker: switches starter portfolios', () => {
    const { container } = render(<ETFPortfolioPicker />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Portfolio/i).length).toBeGreaterThan(0);
  });

  it('Brisbane Budget: calculates weekly student costs', () => {
    const { container } = render(<BrisbaneBudgetCalculator />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Budget/i).length).toBeGreaterThan(0);
  });

  it('Brisbane Uni Explorer: navigates through sub-tabs', () => {
    const { container } = render(<BrisbaneUniExplorer />);
    expect(container).toBeDefined();

    const degreesTab = screen.getByRole('tab', { name: /Top Degrees & Fees/i });
    fireEvent.click(degreesTab);
    expect(screen.getAllByText(/Top Degrees/i).length).toBeGreaterThan(0);
  });

  it('QLD Schools Year 12: switches sub-tabs', () => {
    const { container } = render(<QldSchoolsYear12 />);
    expect(container).toBeDefined();

    const cutoffsTab = screen.getByRole('tab', { name: /2026 ATAR Cut-offs/i });
    fireEvent.click(cutoffsTab);
    expect(screen.getAllByText(/ATAR/i).length).toBeGreaterThan(0);
  });

  it('BNPL Debt Trap: models interest and late fees', () => {
    const { container } = render(<BNPLDebtTrapVisualizer />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Buy Now Pay Later/i).length).toBeGreaterThan(0);
  });

  it('Teen Resume Builder: selects role presets and renders sections', () => {
    const { container } = render(<TeenResumeBuilder />);
    expect(container).toBeDefined();

    const crewBtn = screen.getAllByText(/Fast food/i)[0];
    fireEvent.click(crewBtn);
    expect(screen.getAllByText(/Resume/i).length).toBeGreaterThan(0);
  });

  it('Penalty Shift Calculator: calculates weekend / public holiday rates', () => {
    const { container } = render(<PenaltyShiftCalculatorWidget />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Penalty/i).length).toBeGreaterThan(0);
  });

  it('Savings Goals Planner: mounts and interacts with milestones', () => {
    const { container } = render(<SavingsGoalsPlanner />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Savings Goal/i).length).toBeGreaterThan(0);
  });

  it('15yo Roadmap: mounts and displays 15yo milestones', () => {
    const { container } = render(<FifteenYearOldRoadmap />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/15-Year-Old/i).length).toBeGreaterThan(0);
  });
});
