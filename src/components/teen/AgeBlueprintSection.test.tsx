// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgeBlueprintSection } from './AgeBlueprintSection';

describe('AgeBlueprintSection Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders correctly for 14yo First Hustle', () => {
    render(<AgeBlueprintSection age={14} />);
    expect(screen.getByText(/Age 14 Blueprint/i)).toBeDefined();
    expect(screen.getAllByText(/\$13.90/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Mini-Mojo/i)).toBeDefined();
    expect(screen.getByText(/Apply for Free Tax File Number/i)).toBeDefined();
    expect(screen.getByText(/Division 6AA Penalty Tax/i)).toBeDefined();
  });

  it('renders correctly for 16yo L-Plates & Car Savings', () => {
    render(<AgeBlueprintSection age={16} />);
    expect(screen.getByText(/Age 16 Blueprint/i)).toBeDefined();
    expect(screen.getAllByText(/\$17.39/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Pass Road Rules Test & Pick Up L-Plates/i)).toBeDefined();
    expect(screen.getByText(/Falsifying Logbook Hours/i)).toBeDefined();
  });

  it('renders correctly for 18yo Legal Adulthood & 12% Super', () => {
    render(<AgeBlueprintSection age={18} />);
    expect(screen.getByText(/Age 18 Blueprint/i)).toBeDefined();
    expect(screen.getAllByText(/\$24.34/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Unlock 12.0% Super Guarantee on Every Dollar/i)).toBeDefined();
    expect(screen.getByText(/Mandatory AEC Voter Enrolment/i)).toBeDefined();
    expect(screen.getByText(/Predatory Buy Now Pay Later/i)).toBeDefined();
  });

  it('renders correctly for 19yo Uni / TAFE & Sharehousing', () => {
    render(<AgeBlueprintSection age={19} />);
    expect(screen.getByText(/Age 19 Blueprint/i)).toBeDefined();
    expect(screen.getAllByText(/\$27.81/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Master HECS-HELP Indexation/i)).toBeDefined();
    expect(screen.getByText(/Lodge Official 4-Week Rental Bond/i)).toBeDefined();
    expect(screen.getByText(/Rental Bond & Fake Sublet Scams/i)).toBeDefined();
  });

  it('renders correctly for 20yo Young Adult & Wealth Acceleration', () => {
    render(<AgeBlueprintSection age={20} />);
    expect(screen.getByText(/Age 20 Blueprint/i)).toBeDefined();
    expect(screen.getAllByText(/\$31.29/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Reach 100% Adult Wage Rate/i)).toBeDefined();
    expect(screen.getByText(/Research First Home Super Saver Scheme/i)).toBeDefined();
    expect(screen.getByText(/Lifestyle Creep As Incomes Rise/i)).toBeDefined();
  });

  it('allows toggling checklist items and saving state in localStorage', () => {
    render(<AgeBlueprintSection age={15} />);
    const checklistButton = screen.getByText(/Complete TFN Declaration \(NAT 3092\)/i);
    expect(checklistButton).toBeDefined();

    // Click to toggle complete
    fireEvent.click(checklistButton);

    const saved = JSON.parse(localStorage.getItem('pft_age_checklist_15') || '[]');
    expect(saved).toContain('Complete TFN Declaration (NAT 3092)');
  });
});
