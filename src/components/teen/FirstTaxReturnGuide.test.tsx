// @vitest-environment jsdom
/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FirstTaxReturnGuide } from './FirstTaxReturnGuide';

describe('FirstTaxReturnGuide Component', () => {
  it('renders with 5-step walkthrough and step 1 active by default', () => {
    render(<FirstTaxReturnGuide />);
    expect(screen.getByText(/Teen First Tax Return Blueprint/i)).toBeDefined();
    expect(screen.getAllByText(/Link ATO to Your myGov Account/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Step 1 of 5/i)).toBeDefined();
    expect(screen.getAllByText(/13 28 61/i).length).toBeGreaterThan(0);
  });

  it('navigates through steps with Next Step and Previous buttons', () => {
    render(<FirstTaxReturnGuide />);
    const nextBtn = screen.getByText(/Next Step/i);
    fireEvent.click(nextBtn);

    // Step 2: Pre-Fill Timing
    expect(screen.getByText(/Step 2 of 5/i)).toBeDefined();
    expect(screen.getAllByText(/Mid-August/i).length).toBeGreaterThan(0);

    // Step 3: Wages & LITO
    fireEvent.click(screen.getByText(/Next Step/i));
    expect(screen.getByText(/Step 3 of 5/i)).toBeDefined();
    expect(screen.getAllByText(/22,866/i).length).toBeGreaterThan(0);

    // Go back with Previous
    const prevBtn = screen.getByText(/Previous/i);
    fireEvent.click(prevBtn);
    expect(screen.getByText(/Step 2 of 5/i)).toBeDefined();

    // Advance to Step 4: Deductions
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Step 4 of 5/i)).toBeDefined();
    expect(screen.getAllByText(/70c\/hr/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/91c\/km/i).length).toBeGreaterThan(0);

    // Advance to Step 5: Submission & Deadlines
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Step 5 of 5/i)).toBeDefined();
    expect(screen.getAllByText(/31 October/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/15 May/i).length).toBeGreaterThan(0);
  });

  it('switches to Deductions Checker tab and displays 91c/km, WFH 70c/hr, $20k write-off and logo uniform rules', () => {
    render(<FirstTaxReturnGuide />);
    const deductionsTab = screen.getByText(/Deductions Checker/i);
    fireEvent.click(deductionsTab);

    expect(screen.getByText(/What Can You Deduct on a Teen Tax Return\?/i)).toBeDefined();
    expect(screen.getByText(/Compulsory logo polo \/ apron/i)).toBeDefined();
    expect(screen.getByText(/Plain black pants or white shirts/i)).toBeDefined();
    expect(screen.getAllByText(/91c\/km/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/70c\/hour/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Freelance ABN gear under \$20,000/i)).toBeDefined();
    expect(screen.getByText(/Conventional business suit or stylish retail shoes/i)).toBeDefined();
    expect(screen.getByText(/Substantiation Thresholds vs \$1,000 Standard Deduction/i)).toBeDefined();
  });

  it('switches to Notice of Assessment (NOA) tab and shows sample refund breakdown', () => {
    render(<FirstTaxReturnGuide />);
    const noaTab = screen.getByText(/Notice of Assessment \(NOA\) Explainer/i);
    fireEvent.click(noaTab);

    expect(screen.getByText(/Sample Notice of Assessment \(NOA\) Walkthrough/i)).toBeDefined();
    expect(screen.getByText(/RESULT OF THIS ASSESSMENT: REFUND/i)).toBeDefined();
    expect(screen.getByText(/\+\$650\.00/i)).toBeDefined();
  });

  it('switches to Division 6AA tab and details passive income penalties & wages exemption', () => {
    render(<FirstTaxReturnGuide />);
    const div6aaTab = screen.getByText(/Division 6AA Unearned Income Rules/i);
    fireEvent.click(div6aaTab);

    expect(screen.getByText(/ATO Division 6AA: Minor Unearned Income Tax Trap/i)).toBeDefined();
    expect(screen.getByText(/\$0 – \$416/i)).toBeDefined();
    expect(screen.getByText(/\$417 – \$1,307/i)).toBeDefined();
    expect(screen.getByText(/Over \$1,307/i)).toBeDefined();
    expect(screen.getByText(/Crucial Protection: Employment Wages are 100% Exempt!/i)).toBeDefined();
  });
});
