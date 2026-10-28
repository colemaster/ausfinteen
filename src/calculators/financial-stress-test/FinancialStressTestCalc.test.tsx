// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FinancialStressTestCalc } from './FinancialStressTestCalc';

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

describe('FinancialStressTestCalc Component', () => {
  it('renders stress tester with KPIs, runway tiers, and rate shock spectrum', () => {
    render(<FinancialStressTestCalc />);

    expect(screen.getByText('Emergency Fund Runway & Stress Tester')).toBeDefined();
    expect(screen.getAllByText(/Emergency Runway/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Emergency Runway Benchmarks (1, 3, 6 Months)')).toBeDefined();
    expect(screen.getByText('Interest Rate Shock Spectrum (+2%, +3%, +4%)')).toBeDefined();
    expect(screen.getByText('Cost of Living Inflation Buffers (+5%, +10%, +15%)')).toBeDefined();
  });

  it('renders 1, 3, and 6 month benchmark cards', () => {
    render(<FinancialStressTestCalc />);

    expect(screen.getByText('1 Month (Minimum Floor)')).toBeDefined();
    expect(screen.getByText('3 Months (LAWP Buffer)')).toBeDefined();
    expect(screen.getByText('6 Months (Gold Standard)')).toBeDefined();
  });

  it('renders rate shock spectrum (+2.0%, +3.0% APRA, +4.0% Severe)', () => {
    render(<FinancialStressTestCalc />);

    expect(screen.getByText('+2.0% (8.2% Rate)')).toBeDefined();
    expect(screen.getByText('+3.0% APRA Buffer (9.2%)')).toBeDefined();
    expect(screen.getByText('+4.0% Severe Hike (10.2%)')).toBeDefined();
  });

  it('switches between cumulative scenario presets including +4% and Stagflation', () => {
    render(<FinancialStressTestCalc />);

    const rate4Btn = screen.getByText('Rate +4% (Severe Shock)');
    fireEvent.click(rate4Btn);
    expect(screen.getByText('Combined Impact')).toBeDefined();

    const stagflationBtn = screen.getByText('Stagflation (+3% Rate & +15% CoL)');
    fireEvent.click(stagflationBtn);
    expect(screen.getByText('Combined Impact')).toBeDefined();
  });

  it('displays CCR default risk section and statutory relief steps', () => {
    render(<FinancialStressTestCalc />);

    expect(screen.getByText(/Statutory Relief & Hardship Steps/i)).toBeDefined();
    expect(screen.getAllByText(/1800 007 007/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Banking Code of Practice/i).length).toBeGreaterThan(0);
  });

  it('handles reset action cleanly', () => {
    render(<FinancialStressTestCalc />);

    const tripleBtn = screen.getByText('Triple whammy');
    fireEvent.click(tripleBtn);

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('No shocks')).toBeDefined();
    expect(screen.getAllByText(/Combined Impact/i).length).toBeGreaterThan(0);
  });
});
