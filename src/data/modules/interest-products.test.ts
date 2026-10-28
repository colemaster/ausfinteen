import { describe, it, expect } from 'vitest';
import { interestProductsModule } from './interest-products';
import { OFFICIAL_WEB_LINKS } from '../statutory-links';

describe('interestProductsModule (Banking Infrastructure & Statutory Protections)', () => {
  it('has valid module metadata and covers all 18 curriculum topics', () => {
    expect(interestProductsModule.id).toBe('interest-products');
    expect(interestProductsModule.route).toBe('/interest-products');
    expect(interestProductsModule.emoji).toBe('🧬');
    expect(interestProductsModule.topics).toHaveLength(18);

    interestProductsModule.topics.forEach((topic) => {
      expect(topic.id).toMatch(/^ip-\d+$/);
      expect(topic.moduleId).toBe('interest-products');
      expect(topic.question).toBeTruthy();
      expect(topic.answer).toBeTruthy();
      expect(topic.actionStep).toBeTruthy();
      expect(topic.webLink).toBeDefined();
    });
  });

  describe('APRA Financial Claims Scheme (FCS) - Topic ip-1', () => {
    const topic = interestProductsModule.topics.find((t) => t.id === 'ip-1');

    it('documents the statutory foundation under Banking Act 1959 Part II Div 2AA', () => {
      expect(topic).toBeDefined();
      expect(topic?.answer).toContain('Banking Act 1959');
      expect(topic?.answer).toContain('Part II, Division 2AA');
      expect(topic?.answer).toContain('$250,000 AUD');
      expect(topic?.answer).toContain('Authorised Deposit-taking Institution');
      expect(topic?.answer).toContain('7 business days');
      expect(topic?.webLink?.url).toBe(OFFICIAL_WEB_LINKS.apra_fcs.url);
    });

    it('explains shared banking licences across Australian major and regional institutions', () => {
      const answer = topic?.answer ?? '';
      // CBA + Bankwest
      expect(answer).toContain('Commonwealth Bank of Australia (CBA) and Bankwest share one licence');
      // Westpac + St George + Melb + SA + RAMS
      expect(answer).toContain('Westpac Banking Corporation, St. George Bank, Bank of Melbourne, BankSA, and RAMS');
      // BOQ + ME Bank + Virgin Money
      expect(answer).toContain('Bank of Queensland (BOQ), ME Bank (Members Equity Bank), and Virgin Money Australia');
      // Bendigo + Up Bank + Adelaide Bank
      expect(answer).toContain('Bendigo and Adelaide Bank Ltd, Up Bank');
      // NAB + UBank
      expect(answer).toContain('National Australia Bank (NAB) and UBank share one licence');
    });

    it('documents joint account 50/50 deemed split rules', () => {
      expect(topic?.answer).toContain('Joint accounts are split 50/50');
    });

    it('explicitly excludes non-ADI fintechs, BNPL, crypto, and foreign bank branches', () => {
      const answer = topic?.answer ?? '';
      expect(answer).toContain('Foreign bank branches');
      expect(answer).toContain('Spriggy prepaid cards');
      expect(answer).toContain('Afterpay, Zip');
      expect(answer).toContain('crypto exchanges');
    });
  });

  describe('Modern Payment Rails (NPP, PayID, Osko) - Topic ip-11', () => {
    const topic = interestProductsModule.topics.find((t) => t.id === 'ip-11');

    it('documents NPP infrastructure, ISO 20022 messaging, and Australian Payments Plus (AP+)', () => {
      expect(topic).toBeDefined();
      expect(topic?.answer).toContain('New Payments Platform (NPP)');
      expect(topic?.answer).toContain('Australian Payments Plus');
      expect(topic?.answer).toContain('ISO 20022');
      expect(topic?.answer).toContain('280 characters');
      expect(topic?.webLink?.url).toBe(OFFICIAL_WEB_LINKS.payid_platform.url);
    });

    it('explains PayID addressing and Confirmation of Payee (NameCheck)', () => {
      const answer = topic?.answer ?? '';
      expect(answer).toContain('smart proxy');
      expect(answer).toContain('Confirmation of Payee (CoP) & CommBank NameCheck');
      expect(answer).toContain('registered legal name BEFORE');
      expect(answer).toContain('invoice redirection');
    });

    it('covers Osko sub-60-second real-time settlement and PayID scam defense', () => {
      const answer = topic?.answer ?? '';
      expect(answer).toContain('Osko by BPAY');
      expect(answer).toContain('under 60 seconds');
      expect(answer).toContain('PayID is 100% FREE');
      expect(answer).toContain('upgrade to a PayID business account');
    });
  });

  describe('PayTo Modern Digital Direct Debits - Topic ip-17', () => {
    const topic = interestProductsModule.topics.find((t) => t.id === 'ip-17');

    it('contrasts PayTo against legacy Bulk Electronic Clearing System (BECS) direct debits', () => {
      expect(topic).toBeDefined();
      expect(topic?.answer).toContain('Bulk Electronic Clearing System (BECS)');
      expect(topic?.answer).toContain('New Payments Platform (NPP)');
      expect(topic?.webLink?.url).toBe(OFFICIAL_WEB_LINKS.payto_platform.url);
    });

    it('explains digital mandates, biometric upfront authorisation, and in-app dashboard visibility', () => {
      const answer = topic?.answer ?? '';
      expect(answer).toContain('Digital Mandates (Agreements)');
      expect(answer).toContain('Face ID, Touch ID');
      expect(answer).toContain('Manage PayTo Agreements');
    });

    it('highlights instant unilateral pause and cancel authority to stop rogue subscriptions', () => {
      const answer = topic?.answer ?? '';
      expect(answer).toContain('One-Tap Instant Pause & Cancel');
      expect(answer).toContain('CANNOT pull a single cent from your account');
      expect(answer).toContain('Overdraft Defense');
    });
  });

  describe('Consumer Data Right (CDR / Open Banking) - Topic ip-18', () => {
    const topic = interestProductsModule.topics.find((t) => t.id === 'ip-18');

    it('cites Part IVD Competition and Consumer Act 2010 and co-regulation by ACCC and OAIC', () => {
      expect(topic).toBeDefined();
      expect(topic?.answer).toContain('Part IVD of the Competition and Consumer Act 2010');
      expect(topic?.answer).toContain('Australian Competition and Consumer Commission (ACCC)');
      expect(topic?.answer).toContain('Office of the Australian Information Commissioner (OAIC)');
      expect(topic?.answer).toContain('13 legally binding CDR Privacy Safeguards');
      expect(topic?.webLink?.url).toBe(OFFICIAL_WEB_LINKS.accc_cdr.url);
    });

    it('explains OAuth 2.0 / FAPI tokenized APIs and why screen scraping voids ASIC ePayments Code', () => {
      const answer = topic?.answer ?? '';
      expect(answer).toContain('OAuth 2.0');
      expect(answer).toContain('Financial-grade API (FAPI)');
      expect(answer).toContain('Screen Scraping');
      expect(answer).toContain('ASIC ePayments Code');
      expect(answer).toContain('hold YOU 100% financially liable');
    });

    it('documents consent revocation and right to deletion under CDR Privacy Safeguard 12', () => {
      const answer = topic?.answer ?? '';
      expect(answer).toContain('Granular & Revocable Consent');
      expect(answer).toContain('Safeguard 12');
      expect(answer).toContain('permanent deletion or de-identification');
    });
  });

  describe('Statutory Links Directory Verification', () => {
    it('contains all required banking infrastructure statutory web links', () => {
      expect(OFFICIAL_WEB_LINKS.apra_fcs.url).toBe('https://www.fcs.gov.au/');
      expect(OFFICIAL_WEB_LINKS.accc_cdr.url).toBe('https://www.cdr.gov.au/');
      expect(OFFICIAL_WEB_LINKS.payid_platform.url).toBe('https://payid.com.au/');
      expect(OFFICIAL_WEB_LINKS.payto_platform.url).toBe('https://payto.com.au/');
      expect(OFFICIAL_WEB_LINKS.osko_platform.url).toBe('https://osko.com.au/');
      expect(OFFICIAL_WEB_LINKS.npp_australia.url).toBe('https://nppa.com.au/');
      expect(OFFICIAL_WEB_LINKS.oaic_cdr_privacy.url).toBe('https://www.oaic.gov.au/consumer-data-right');
    });
  });
});
