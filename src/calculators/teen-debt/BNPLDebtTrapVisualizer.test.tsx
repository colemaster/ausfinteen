// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BNPLDebtTrapVisualizer } from './BNPLDebtTrapVisualizer';

vi.mock('@/lib/toast', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('@/components/charts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

afterEach(() => {
  cleanup();
});

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

describe('BNPLDebtTrapVisualizer Component', () => {
  it('renders multi-account stacking mode with 4 accounts by default', () => {
    render(<BNPLDebtTrapVisualizer />);

    expect(screen.getByText(/BNPL Debt Trap & Multi-Account Snowball Visualizer/i)).toBeDefined();
    expect(screen.getAllByText('Afterpay').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Zip Pay').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Klarna').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PayPal Pay in 4').length).toBeGreaterThan(0);
    expect(screen.getByText(/Cascading Late Fees/i)).toBeDefined();
  });

  it('displays statutory relief roadmap with NDH 1800 007 007 and NCCP s72', () => {
    render(<BNPLDebtTrapVisualizer />);

    expect(screen.getAllByText(/1800 007 007/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/National Debt Helpline/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Statutory Hardship Notices/i).length).toBeGreaterThan(0);
  });

  it('switches to Single Purchase Trap mode and renders single visualizer', () => {
    render(<BNPLDebtTrapVisualizer />);

    const singleTab = screen.getByText('Single Purchase Trap');
    fireEvent.click(singleTab);

    expect(screen.getByText('Original Purchase Amount ($)')).toBeDefined();
    expect(screen.getByText('Missed Fortnightly Installments')).toBeDefined();
    expect(screen.getByText('Base Late Fee per Missed Payment ($)')).toBeDefined();
  });

  it('displays CCR 5-Year Default Risk warning when debt >= $150 is overdue', () => {
    render(<BNPLDebtTrapVisualizer />);

    // Apply the CCR emergency preset
    const emergencyPreset = screen.getByText('Imminent 5-Yr CCR Defaults');
    fireEvent.click(emergencyPreset);

    expect(screen.getAllByText(/5-Year CCR Default Risk/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/CRITICAL COMPREHENSIVE CREDIT REPORTING \(CCR\) WARNING/i)).toBeDefined();
  });

  it('resets back to baseline settings upon clicking reset', () => {
    render(<BNPLDebtTrapVisualizer />);

    const starterPreset = screen.getByText('2-Account Starter Stack');
    fireEvent.click(starterPreset);

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);

    expect(screen.getAllByText('Afterpay').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PayPal Pay in 4').length).toBeGreaterThan(0);
  });

  it('renders the 2026 statutory BNPL provider regulatory comparison section', () => {
    render(<BNPLDebtTrapVisualizer />);

    expect(screen.getByText(/Major Australian BNPL Providers — 2026 Regulatory & Fee Comparison/i)).toBeDefined();
    expect(screen.getByText(/ASIC RG 281 & NCCP Reg 69G Caps/i)).toBeDefined();
    expect(screen.getAllByText(/ACL • AFCA/i).length).toBe(4);
    expect(screen.getAllByText(/24mo RHI \/ 5yr Default/i).length).toBe(4);
  });
});
