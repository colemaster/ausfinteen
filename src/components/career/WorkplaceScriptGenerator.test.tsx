// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkplaceScriptGenerator } from './WorkplaceScriptGenerator';

beforeEach(() => {
  localStorage.clear();
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    },
  });
});

describe('WorkplaceScriptGenerator Component', () => {
  it('renders title, Barefoot investor summary, and all 10 word-for-word scripts', () => {
    render(<WorkplaceScriptGenerator />);

    expect(screen.getByText(/Barefoot & Broke Millennial Workplace Scripts/i)).toBeDefined();
    expect(screen.getByText(/Scott Pape's Barefoot Investor Teen Paycheck System:/i)).toBeDefined();

    // Verify presence of our key WHS, unpaid trial, cash-in-hand, and bullying scripts
    expect(
      screen.getByText(/Pushing Back Against an Unlawful Multi-Hour Unpaid Trial/i),
    ).toBeDefined();
    expect(
      screen.getByText(/Refusing Cash-in-Hand Off-the-Books Payment/i),
    ).toBeDefined();
    expect(
      screen.getByText(/Reporting Workplace Bullying or Customer Harassment/i),
    ).toBeDefined();
    expect(
      screen.getByText(/Reporting Unsafe Conditions Or Equipment/i),
    ).toBeDefined();
  });

  it('allows copying scripts to clipboard with feedback', () => {
    render(<WorkplaceScriptGenerator />);

    const copyButtons = screen.getAllByText('Copy Script');
    expect(copyButtons.length).toBe(10);

    fireEvent.click(copyButtons[7]); // Script 8: Unpaid trial
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
