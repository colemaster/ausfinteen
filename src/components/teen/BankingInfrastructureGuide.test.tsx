// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BankingInfrastructureGuide } from './BankingInfrastructureGuide';

describe('BankingInfrastructureGuide Component', () => {
  it('renders the header and statutory protections badge', () => {
    render(<BankingInfrastructureGuide />);
    expect(
      screen.getByText(/AU Banking Infrastructure & Regulatory Safeguards/i)
    ).toBeDefined();
    expect(screen.getByText(/Statutory Protections/i)).toBeDefined();
    expect(
      screen.getByText(/APRA Financial Claims Scheme \(FCS\)/i)
    ).toBeDefined();
  });

  it('renders the APRA FCS tab by default with $250k cap, 7-day payout, and joint account rules', () => {
    render(<BankingInfrastructureGuide />);
    expect(screen.getByText(/\$250,000 per ADI/i)).toBeDefined();
    expect(screen.getByText(/7-Day Payout Target/i)).toBeDefined();
    expect(screen.getByText(/Joint Accounts Rule/i)).toBeDefined();
    expect(screen.getByText(/Shared Banking Licence Checker/i)).toBeDefined();
  });

  it('allows checking shared banking licences for Bankwest (CBA) and Up Bank (Bendigo)', () => {
    render(<BankingInfrastructureGuide />);
    const select = screen.getByLabelText(/Check Bank:/i);
    expect(select).toBeDefined();

    // Default is Bankwest -> Commonwealth Bank of Australia
    expect(screen.getAllByText(/Commonwealth Bank of Australia/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Shares CBA’s single \$250,000 FCS guarantee/i)
    ).toBeDefined();

    // Select Up Bank
    fireEvent.change(select, { target: { value: 'Up Bank' } });
    expect(screen.getByText(/Bendigo and Adelaide Bank Limited/i)).toBeDefined();
    expect(
      screen.getByText(/powered by Bendigo and Adelaide Bank Ltd/i)
    ).toBeDefined();

    // Select Non-ADI entity like Spriggy
    fireEvent.change(select, { target: { value: 'Spriggy' } });
    expect(screen.getByText(/Non-ADI Fintech \/ Crypto/i)).toBeDefined();
    expect(screen.getByText(/ZERO APRA FCS Protection/i)).toBeDefined();
  });

  it('switches to the Payment Rails tab and operates the PayTo simulator', () => {
    render(<BankingInfrastructureGuide />);
    const paymentsTab = screen.getByRole('tab', {
      name: /2\. Payment Rails \(NPP, PayID, PayTo\)/i,
    });
    fireEvent.click(paymentsTab);

    // Verify PayID & Osko sections
    expect(screen.getByText(/PayID & Confirmation of Payee/i)).toBeDefined();
    expect(screen.getByText(/Osko by BPAY/i)).toBeDefined();
    expect(screen.getByText(/Sub-60s Rail/i)).toBeDefined();
    expect(
      screen.getByText(/PayTo \(Modern Digital Mandates\) vs Legacy BECS Direct Debit/i)
    ).toBeDefined();

    // Test PayTo simulator buttons
    const pauseButtons = screen.getAllByRole('button', { name: /pause/i });
    expect(pauseButtons.length).toBeGreaterThan(0);
    fireEvent.click(pauseButtons[0]);

    // Test cancel
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    expect(cancelButtons.length).toBeGreaterThan(0);
    fireEvent.click(cancelButtons[0]);
  });

  it('switches to the CDR Open Banking tab and verifies ACCC/OAIC safeguards and screen scraping warning', () => {
    render(<BankingInfrastructureGuide />);
    const cdrTab = screen.getByRole('tab', {
      name: /3\. CDR Open Banking Security/i,
    });
    fireEvent.click(cdrTab);

    expect(
      screen.getByText(/Competition and Consumer Act 2010 \(Part IVD\)/i)
    ).toBeDefined();
    expect(screen.getByText(/ACCC & OAIC Co-Regulated/i)).toBeDefined();
    expect(screen.getByText(/13 statutory/i)).toBeDefined();
    expect(screen.getByText(/ASIC ePayments Code Liability Shift/i)).toBeDefined();
    expect(screen.getByText(/Right to Deletion \(Safeguard 12\)/i)).toBeDefined();
    expect(screen.getByText(/The 3-Second Verification Test/i)).toBeDefined();
  });
});
