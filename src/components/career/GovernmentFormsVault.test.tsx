// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GovernmentFormsVault } from './GovernmentFormsVault';
import { FifteenYearOldRoadmap } from '@/components/teen/FifteenYearOldRoadmap';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

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

describe('GovernmentFormsVault Component', () => {
  it('renders vault title and 6-item Day 1 readiness checklist', () => {
    render(<GovernmentFormsVault />);

    expect(screen.getByText('Official Government Forms & 15yo Independence Vault')).toBeDefined();
    expect(screen.getByText(/Mandatory Day 1 Readiness Checklist/i)).toBeDefined();

    // Check specific form codes in Day 1 items
    expect(screen.getAllByText(/NAT 3092/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/NAT 13080/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Form CE1/i).length).toBeGreaterThan(0);
  });

  it('toggles Day 1 checklist items and calculates readiness progress', () => {
    render(<GovernmentFormsVault />);

    const nat3092Item = screen.getByText('Tax File Number (TFN) Declaration');
    fireEvent.click(nat3092Item);

    // Should indicate progress updated in localStorage
    expect(localStorage.getItem('pft_gov_forms_day1_readiness')).toContain('nat3092');

    // Click "All Ready"
    const allReadyBtn = screen.getByText('All Ready');
    fireEvent.click(allReadyBtn);

    expect(screen.getByText('6 of 6 Ready (100%)')).toBeDefined();
  });

  it('calculates 100-Point Minor ID Verification correctly', () => {
    render(<GovernmentFormsVault />);

    // Default starter combo: Birth Cert (70) + Student ID (40) = 110 pts
    expect(screen.getByText(/Verified! \(110 pts\)/i)).toBeDefined();

    // Deselect Birth Certificate (70 pts) -> only Student ID (40 pts) remaining
    const birthCertOption = screen.getByText('Australian Birth Certificate');
    fireEvent.click(birthCertOption);

    // Should display Primary Document Required warning
    expect(screen.getByText(/Primary Document Required/i)).toBeDefined();
  });

  it('displays and toggles QLD Parent Consent Form CE1', () => {
    render(<GovernmentFormsVault />);

    // Click QLD Child Employment filter
    const qldFilterBtn = screen.getByRole('button', { name: 'QLD Child Employment' });
    fireEvent.click(qldFilterBtn);

    expect(screen.getByText(/Queensland Parent Consent Form CE1/i)).toBeDefined();

    // Toggle open the accordion
    const qldAccordionBtn = screen.getByRole('button', { name: /Queensland Parent Consent Form CE1/i });
    fireEvent.click(qldAccordionBtn);

    expect(screen.getAllByText(/Child Employment Act 2006/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/12 hours per week/i).length).toBeGreaterThan(0);
  });

  it('displays Medicare Form MS004 and MS011 for 15-year-olds', () => {
    render(<GovernmentFormsVault />);

    const medicareFilterBtn = screen.getByRole('button', { name: 'Medicare (15yo)' });
    fireEvent.click(medicareFilterBtn);

    const medicareAccordionBtn = screen.getByRole('button', { name: /Services Australia: Getting Your Own Medicare Card at 15/i });
    fireEvent.click(medicareAccordionBtn);

    expect(screen.getByText(/Form MS004 & MS011/i)).toBeDefined();
    expect(screen.getByText(/Option A: "Copy" \(Recommended at 15\)/i)).toBeDefined();
    expect(screen.getByText(/Health Insurance Act 1973/i)).toBeDefined();
  });
});

describe('FifteenYearOldRoadmap Component', () => {
  it('renders all 8 milestones and celebration ring', () => {
    render(<FifteenYearOldRoadmap />);

    expect(screen.getByText('The 15-Year-Old Australian Independence Roadmap')).toBeDefined();
    expect(screen.getByText('Apply for Your Free Tax File Number (TFN)')).toBeDefined();
    expect(screen.getByText('Open a Zero-Fee 5.0%+ Youth Bank Account')).toBeDefined();
    expect(screen.getByText('Claim Your Own Green Medicare Card')).toBeDefined();
    expect(screen.getByText('Land Your First Casual Job & Master Junior Pay')).toBeDefined();
    expect(screen.getByText('Claim the $22,575 Effective Tax-Free Threshold')).toBeDefined();
    expect(screen.getByText('Automate Barefoot 3-Buckets ($500 Mojo Buffer)')).toBeDefined();
    expect(screen.getByText('Study PrepL / DKT for Your Ls at 16')).toBeDefined();
    expect(screen.getByText('Unlock Student Concessions & Scam Protection')).toBeDefined();
  });

  it('allows state selection and updates statutory advice for QLD, NSW and VIC', () => {
    render(<FifteenYearOldRoadmap />);

    // Default QLD profile
    expect(screen.getByText(/Mandatory Form CE1/i)).toBeDefined();
    expect(screen.getByText(/PrepL online course from 15 years 11 months/i)).toBeDefined();

    // Switch to NSW
    const nswBtn = screen.getByRole('button', { name: 'NSW' });
    fireEvent.click(nswBtn);

    expect(screen.getByText(/Driver Knowledge Test \(DKT\) can be booked at Service NSW/i)).toBeDefined();
    expect(screen.getByText(/School Student Concession Opal card/i)).toBeDefined();

    // Switch to VIC
    const vicBtn = screen.getByRole('button', { name: 'VIC' });
    fireEvent.click(vicBtn);

    expect(screen.getByText(/Child Employment Act 2003/i)).toBeDefined();
  });

  it('expands detailed checkpoints and allows checking subtasks', () => {
    render(<FifteenYearOldRoadmap />);

    // Step 1 is expanded by default
    expect(screen.getByText(/Action Checkpoints:/i)).toBeDefined();
    const cpText = screen.getByText(/Gather 100 points of ID/i);
    expect(cpText).toBeDefined();

    // Click checkpoint
    fireEvent.click(cpText);
    expect(localStorage.getItem('pft_15yo_roadmap_subtasks')).toContain('Gather 100 points of ID');
  });

  it('marks all milestones complete with Mark All Done', () => {
    render(<FifteenYearOldRoadmap />);

    const markAllBtn = screen.getByRole('button', { name: /Mark All Done/i });
    fireEvent.click(markAllBtn);

    expect(screen.getByText('8 of 8 Complete (100%)')).toBeDefined();
    expect(screen.getByText(/100% Financial Independence Champion!/i)).toBeDefined();
  });
});
