// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FifteenYearOldRoadmap } from './FifteenYearOldRoadmap';

describe('FifteenYearOldRoadmap Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders correctly with default state Queensland (QLD)', () => {
    render(<FifteenYearOldRoadmap />);
    expect(screen.getByText(/The 15-Year-Old Australian Independence Roadmap/i)).toBeDefined();
    expect(screen.getByText(/Select Your State \/ Territory for Local Statutory Rules:/i)).toBeDefined();
    expect(screen.getByText(/Queensland Work Rules:/i)).toBeDefined();
    expect(screen.getByText(/Mandatory Form CE1/i)).toBeDefined();
    expect(screen.getByText(/PrepL online course/i)).toBeDefined();
  });

  it('switches state to Victoria and updates child employment details', () => {
    render(<FifteenYearOldRoadmap />);
    const vicBtn = screen.getByRole('button', { name: 'VIC' });
    fireEvent.click(vicBtn);

    expect(screen.getByText(/Victoria Work Rules:/i)).toBeDefined();
    expect(screen.getByText(/Child Employment Act 2003/i)).toBeDefined();
    expect(screen.getByText(/Wage Inspectorate Victoria/i)).toBeDefined();
  });

  it('switches state to Western Australia and displays Wageline requirements', () => {
    render(<FifteenYearOldRoadmap />);
    const waBtn = screen.getByRole('button', { name: 'WA' });
    fireEvent.click(waBtn);

    expect(screen.getByText(/Western Australia Work Rules:/i)).toBeDefined();
    expect(screen.getByText(/Children and Community Services Act 2004/i)).toBeDefined();
    expect(screen.getAllByText(/Wageline/i).length).toBeGreaterThan(0);
  });

  it('switches state to NSW, SA, TAS, ACT, and NT with statutory protections', () => {
    render(<FifteenYearOldRoadmap />);

    // NSW
    fireEvent.click(screen.getByRole('button', { name: 'NSW' }));
    expect(screen.getByText(/New South Wales Work Rules:/i)).toBeDefined();
    expect(screen.getByText(/Children and Young Persons \(Care and Protection\) Act 1998/i)).toBeDefined();

    // SA
    fireEvent.click(screen.getByRole('button', { name: 'SA' }));
    expect(screen.getByText(/South Australia Work Rules:/i)).toBeDefined();
    expect(screen.getByText(/s 74/i)).toBeDefined();

    // TAS
    fireEvent.click(screen.getByRole('button', { name: 'TAS' }));
    expect(screen.getByText(/Tasmania Work Rules:/i)).toBeDefined();
    expect(screen.getByText(/s 247/i)).toBeDefined();

    // ACT
    fireEvent.click(screen.getByRole('button', { name: 'ACT' }));
    expect(screen.getByText(/Australian Capital Territory Work Rules:/i)).toBeDefined();
    expect(screen.getByText(/Chapter 21/i)).toBeDefined();

    // NT
    fireEvent.click(screen.getByRole('button', { name: 'NT' }));
    expect(screen.getByText(/Northern Territory Work Rules:/i)).toBeDefined();
    expect(screen.getByText(/s 203/i)).toBeDefined();
  });

  it('shows state-specific work regulations inside Milestone 4 expanded drawer', () => {
    render(<FifteenYearOldRoadmap />);
    // Click View Details & Checkpoints on Step 4 (Land Your First Casual Job)
    const viewButtons = screen.getAllByRole('button', { name: /View Details & Checkpoints/i });
    // Step 4 is index 2 among the unexpanded milestones (since Step 1 is expanded initially)
    fireEvent.click(viewButtons[2]);

    // Select WA
    fireEvent.click(screen.getByRole('button', { name: 'WA' }));
    expect(screen.getAllByText(/Western Australia Work Rules/i).length).toBeGreaterThan(0);
  });
});
