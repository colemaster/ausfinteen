// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock matchMedia
beforeEach(() => {
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

import { Landing } from './Landing';
import { TeenBudgeting } from './TeenBudgeting';
import { CareersEmployment } from './CareersEmployment';
import { CarDriving } from './CarDriving';
import { BrisbaneQLD } from './BrisbaneQLD';
import { SpendingSavingRealWorld } from './SpendingSavingRealWorld';
import { TeenProfile } from './TeenProfile';
import { TaxGuide } from './TaxGuide';
import { InvestingShares } from './InvestingShares';
import { InterestFinancialProducts } from './InterestFinancialProducts';
import { SuperRetirement } from './SuperRetirement';
import { MoneyAndYou } from './MoneyAndYou';
import { DealingWithDebt } from './DealingWithDebt';
import { HECSPayoff } from './HECSPayoff';
import { SuperDrawdown } from './SuperDrawdown';
import { DirectVsDR } from '@/calculators/direct-vs-dr/DirectVsDR';
import { CGTEngine } from './CGTEngine';
import { FinancialStressTest } from './FinancialStressTest';
import { EVNovatedLease } from './EVNovatedLease';
import { CalculatorsHub } from './CalculatorsHub';
import { NotFound } from './NotFound';

describe('All 21 Page Views Mount Successfully', () => {
  it('renders Landing without error', () => {
    const { container } = render(<Landing />);
    expect(container).toBeDefined();
  });

  it('renders TeenBudgeting without error', () => {
    const { container } = render(<TeenBudgeting />);
    expect(container).toBeDefined();
  });

  it('renders CareersEmployment without error', () => {
    const { container } = render(<CareersEmployment />);
    expect(container).toBeDefined();
  });

  it('renders CarDriving without error', () => {
    const { container } = render(<CarDriving />);
    expect(container).toBeDefined();
  });

  it('renders BrisbaneQLD without error', () => {
    const { container } = render(<BrisbaneQLD />);
    expect(container).toBeDefined();
  });

  it('renders SpendingSavingRealWorld without error', () => {
    const { container } = render(<SpendingSavingRealWorld />);
    expect(container).toBeDefined();
  });

  it('renders TeenProfile without error', () => {
    const { container } = render(<TeenProfile />);
    expect(container).toBeDefined();
  });

  it('renders TaxGuide without error', () => {
    const { container } = render(<TaxGuide />);
    expect(container).toBeDefined();
  });

  it('renders InvestingShares without error', () => {
    const { container } = render(<InvestingShares />);
    expect(container).toBeDefined();
  });

  it('renders InterestFinancialProducts without error', () => {
    const { container } = render(<InterestFinancialProducts />);
    expect(container).toBeDefined();
  });

  it('renders SuperRetirement without error', () => {
    const { container } = render(<SuperRetirement />);
    expect(container).toBeDefined();
  });

  it('renders MoneyAndYou without error', () => {
    const { container } = render(<MoneyAndYou />);
    expect(container).toBeDefined();
  });

  it('renders DealingWithDebt without error', () => {
    const { container } = render(<DealingWithDebt />);
    expect(container).toBeDefined();
  });

  it('renders HECSPayoff without error', () => {
    const { container } = render(<HECSPayoff />);
    expect(container).toBeDefined();
  });

  it('renders SuperDrawdown without error', () => {
    const { container } = render(<SuperDrawdown />);
    expect(container).toBeDefined();
  });

  it('renders DirectVsDR without error', () => {
    const { container } = render(<DirectVsDR />);
    expect(container).toBeDefined();
  });

  it('renders CGTEngine without error', () => {
    const { container } = render(<CGTEngine />);
    expect(container).toBeDefined();
  });

  it('renders FinancialStressTest without error', () => {
    const { container } = render(<FinancialStressTest />);
    expect(container).toBeDefined();
  });

  it('renders EVNovatedLease without error', () => {
    const { container } = render(<EVNovatedLease />);
    expect(container).toBeDefined();
  });

  it('renders CalculatorsHub without error', () => {
    const { container } = render(<CalculatorsHub />);
    expect(container).toBeDefined();
  });

  it('renders NotFound without error', () => {
    const { container } = render(<NotFound />);
    expect(container).toBeDefined();
  });
});
