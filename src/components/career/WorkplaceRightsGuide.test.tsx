// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkplaceRightsGuide } from './WorkplaceRightsGuide';

beforeEach(() => {
  localStorage.clear();
});

describe('WorkplaceRightsGuide Component', () => {
  it('renders title, Safe Work Australia WHS badge, and 3 core danger cards', () => {
    render(<WorkplaceRightsGuide />);

    expect(
      screen.getByText(/Workplace Rights, Safe Work Australia \(WHS\) & Anti-Bullying Protections/i),
    ).toBeDefined();
    expect(screen.getByText('Unpaid Trial Shift Rules')).toBeDefined();
    expect(screen.getByText('Cash-in-Hand Hazard')).toBeDefined();
    expect(screen.getByText('Safe Work Australia & WHS Rights')).toBeDefined();
  });

  it('evaluates lawful vs unlawful trial shifts in the interactive validator', () => {
    render(<WorkplaceRightsGuide />);

    expect(screen.getByText(/Interactive Tool: "Is My Trial Shift Legal\?"/i)).toBeDefined();

    // Default is lawful paid shift
    expect(screen.getByText(/🟢 100% Lawful Paid Shift/i)).toBeDefined();

    // Switch to Unpaid trial
    const unpaidBtn = screen.getByText('Unpaid (Volunteer / Test)');
    fireEvent.click(unpaidBtn);

    // Default short duration (≤ 1 hour) and supervised -> Lawful Brief Skills Evaluation
    expect(
      screen.getByText(/🟢 Lawful Brief Skills Evaluation \(Max 1 Hour\)/i),
    ).toBeDefined();

    // Switch to 2 to 8 Hours -> Illegal Unpaid Work Trial
    const longDurationBtn = screen.getByText('2 to 8 Hours (Full shift)');
    fireEvent.click(longDurationBtn);

    expect(
      screen.getByText(/🔴 Illegal Unpaid Work Trial \(Wage Theft\)/i),
    ).toBeDefined();

    // Switch to Cash-in-Hand
    const cashBtn = screen.getByText('Cash-in-Hand Off Books');
    fireEvent.click(cashBtn);

    expect(
      screen.getByText(/🔴 Unlawful Cash-in-Hand \(Black Market Pay\)/i),
    ).toBeDefined();
  });

  it('renders workplace bullying, sexual harassment, positive duty, and the 4-step action ladder', () => {
    render(<WorkplaceRightsGuide />);

    expect(
      screen.getByText(/Workplace Bullying, Sexual Harassment & Psychosocial Safety Rights/i),
    ).toBeDefined();
    expect(screen.getByText(/Unlawful Bullying & Harassment:/i)).toBeDefined();
    expect(screen.getByText(/Lawful Reasonable Management Action:/i)).toBeDefined();
    expect(screen.getByText(/Employer Positive Duty/i)).toBeDefined();

    // 4-step ladder
    expect(screen.getByText('Step 1: Keep a Private Diary')).toBeDefined();
    expect(screen.getByText('Step 2: Report to a Safe Leader')).toBeDefined();
    expect(screen.getByText('Step 3: Escalate to Fair Work')).toBeDefined();
    expect(screen.getByText('Step 4: Contact Youth Support')).toBeDefined();
  });

  it('displays confidential youth support helplines (Kids Helpline, Youth Law Australia, 13YARN)', () => {
    render(<WorkplaceRightsGuide />);

    expect(screen.getByText('Kids Helpline')).toBeDefined();
    expect(screen.getByText('1800 55 1800')).toBeDefined();
    expect(screen.getByText('Youth Law Australia')).toBeDefined();
    expect(screen.getByText('yla.org.au')).toBeDefined();
    expect(screen.getByText('13YARN')).toBeDefined();
    expect(screen.getByText('13 92 76')).toBeDefined();
  });

  it('renders the 3-hour minimum shift rule and paid rest break tables', () => {
    render(<WorkplaceRightsGuide />);

    expect(screen.getByText('3-Hour Minimum Shift Rule')).toBeDefined();
    expect(screen.getByText('Paid Rest Pauses vs Meal Breaks')).toBeDefined();
    expect(screen.getByText('4 Steps to Make a WorkCover Claim If Injured at Work:')).toBeDefined();
  });
});
