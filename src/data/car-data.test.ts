import { describe, it, expect } from 'vitest';
import {
  QLD_LICENCE_PATH,
  QLD_LICENCE_FEES,
  QLD_STANDARD_PATHWAY_GOV_COST,
  QLD_STANDARD_PATHWAY_5YR_COST,
  QLD_LICENCE_TERM_OPTIONS,
  QLD_ROAD_RULES_FINES,
  QLD_REGO_CTP_COSTS,
  QLD_VEHICLE_DUTY_RATES,
  QLD_REGO_CYLINDER_TIERS,
  ROADSIDE_ASSISTANCE_BENCHMARKS,
  OFFICIAL_PPSR_DATA,
  QLD_CTP_PROVIDERS,
  BRISBANE_PRICE_CYCLE,
  BRISBANE_FUEL_CYCLE_METRICS,
  QLD_FUEL_REPORTING_SCHEME,
  BRISBANE_PARKING_ZONES,
  BRISBANE_FREE_PARKING_TIPS,
} from './car-data';
import { carDrivingModule } from './modules/car-driving';

describe('Queensland Driver Licensing & Statutory Fees (2026-2027 Schedule)', () => {
  it('covers all 4 GLS milestones with correct age and tenure requirements', () => {
    expect(QLD_LICENCE_PATH).toHaveLength(4);
    const [learner, p1, p2, open] = QLD_LICENCE_PATH;

    expect(learner.stage).toContain('Learner');
    expect(learner.minAge).toBe(16);
    expect(learner.requirements).toContain('100 supervised driving hours');
    expect(learner.requirements).toContain('10 night hours');
    expect(learner.requirements).toContain('3-for-1');
    expect(learner.restrictions).toContain('0.00 BAC');
    expect(learner.restrictions).toContain('$1,295');

    expect(p1.stage).toContain('P1');
    expect(p1.minAge).toBe(17);
    expect(p1.fees).toContain('$42.70'); // HPT
    expect(p1.fees).toContain('$69.40'); // Q-SAFE
    expect(p1.restrictions).toContain('11:00 PM and 5:00 AM');
    expect(p1.restrictions).toContain('$518'); // Peer passenger fine
    expect(p1.restrictions).toContain('4 points');

    expect(p2.stage).toContain('P2');
    expect(p2.minAge).toBe(18);
    expect(p2.restrictions).toContain('Hands-free phone use permitted');

    expect(open.stage).toContain('Open');
    expect(open.minAge).toBe(20);
    expect(open.restrictions).toContain('0.05');
  });

  it('contains verified 2026-2027 QLD TMR licence test & licence fee schedule', () => {
    const feeMap = new Map(QLD_LICENCE_FEES.map(f => [f.item, f.cost]));

    expect(feeMap.get('PrepL online road rules test')).toBe(29.70);
    expect(feeMap.get('Written road rules (knowledge) test')).toBe(29.70);
    expect(feeMap.get('Learner licence (3 years)')).toBe(80.15);
    expect(feeMap.get('Hazard Perception Test (HPT)')).toBe(42.70);
    expect(feeMap.get('Practical driving test (all classes)')).toBe(69.40);
    expect(feeMap.get('P1 provisional licence (1 year)')).toBe(94.65);
    expect(feeMap.get('P2 provisional licence (2 years)')).toBe(132.00);
    expect(feeMap.get('Open licence (1 year)')).toBe(94.65);
  });

  it('verifies standard pathway government cost equals exactly $543.25', () => {
    // PrepL ($29.70) + Learner ($80.15) + HPT ($42.70) + Practical ($69.40) + P1 1yr ($94.65) + P2 2yr ($132.00) + Open 1yr ($94.65)
    const expectedCost = 29.70 + 80.15 + 42.70 + 69.40 + 94.65 + 132.00 + 94.65;
    expect(QLD_STANDARD_PATHWAY_GOV_COST).toBeCloseTo(expectedCost, 2);
    expect(QLD_STANDARD_PATHWAY_GOV_COST).toBe(543.25);

    // With 5-year open licence ($212.00)
    const expected5YrCost = 29.70 + 80.15 + 42.70 + 69.40 + 94.65 + 132.00 + 212.00;
    expect(QLD_STANDARD_PATHWAY_5YR_COST).toBe(660.60);
    expect(QLD_STANDARD_PATHWAY_5YR_COST).toBeCloseTo(expected5YrCost, 2);

    expect(QLD_LICENCE_TERM_OPTIONS).toHaveLength(5);
    expect(QLD_LICENCE_TERM_OPTIONS[0].cost).toBe(94.65);
    expect(QLD_LICENCE_TERM_OPTIONS[4].cost).toBe(212.00);
  });

  it('contains verified Queensland vehicle registration & transfer rates', () => {
    expect(QLD_REGO_CTP_COSTS.registrationFourCylinder).toBe(385.45);
    expect(QLD_REGO_CTP_COSTS.registrationEvOrUpToThreeCylinders).toBe(303.10);
    expect(QLD_REGO_CTP_COSTS.trafficImprovementFee).toBe(67.25);
    expect(QLD_REGO_CTP_COSTS.transferFee).toBe(33.65);
    expect(QLD_REGO_CTP_COSTS.interstateLicenceTransferFee).toBe(87.05);
    expect(QLD_REGO_CTP_COSTS.penaltyUnitValue).toBe(172.70);

    expect(QLD_VEHICLE_DUTY_RATES.hybridOrElectricPer100).toBe(2.00);
    expect(QLD_VEHICLE_DUTY_RATES.upToFourCylindersPer100).toBe(3.00);
    expect(QLD_VEHICLE_DUTY_RATES.fiveOrSixCylindersPer100).toBe(3.50);
    expect(QLD_VEHICLE_DUTY_RATES.sevenOrMoreCylindersPer100).toBe(4.00);
    expect(QLD_VEHICLE_DUTY_RATES.lodgementDeadlineDays).toBe(14);
  });

  it('verifies QLD registration cylinder tiers and escalating costs', () => {
    expect(QLD_REGO_CYLINDER_TIERS).toHaveLength(4);
    const [evTier, fourCyl, sixCyl, eightCyl] = QLD_REGO_CYLINDER_TIERS;

    expect(evTier.transferDutyRatePct).toBe(2.0);
    expect(evTier.registrationFee).toBe(303.10);

    expect(fourCyl.transferDutyRatePct).toBe(3.0);
    expect(fourCyl.registrationFee).toBe(385.45);
    expect(fourCyl.transferDutyOn5k).toBe(150);

    expect(sixCyl.transferDutyRatePct).toBe(3.5);
    expect(sixCyl.registrationFee).toBe(602.80);
    expect(sixCyl.totalAnnualRego).toBeGreaterThan(fourCyl.totalAnnualRego);

    expect(eightCyl.transferDutyRatePct).toBe(4.0);
    expect(eightCyl.registrationFee).toBe(838.10);
    expect(eightCyl.totalAnnualRego - fourCyl.totalAnnualRego).toBeGreaterThan(450);
  });

  it('verifies roadside assistance benchmark offerings for RACQ and NRMA', () => {
    expect(ROADSIDE_ASSISTANCE_BENCHMARKS.length).toBeGreaterThanOrEqual(3);
    const racqEveryday = ROADSIDE_ASSISTANCE_BENCHMARKS.find(b => b.planName.includes('Everyday Roadside'));
    expect(racqEveryday).toBeDefined();
    expect(racqEveryday?.annualFee).toBe(109);
    expect(racqEveryday?.towingDistanceKm).toBe(20);

    const nrma = ROADSIDE_ASSISTANCE_BENCHMARKS.find(b => b.provider === 'NRMA');
    expect(nrma).toBeDefined();
    expect(nrma?.annualFee).toBe(139);
  });

  it('verifies 2026-2027 QLD Road Rules camera fines and demerit points schedule', () => {
    expect(QLD_ROAD_RULES_FINES.length).toBeGreaterThanOrEqual(10);

    const drinkOffence = QLD_ROAD_RULES_FINES.find(f => f.offence.includes('Zero BAC'));
    expect(drinkOffence).toBeDefined();
    expect(drinkOffence?.fine).toBe(2417);
    expect(drinkOffence?.demeritPoints).toBe(0); // Court disqualification rather than demerits

    const phoneOffence = QLD_ROAD_RULES_FINES.find(f => f.offence.includes('Mobile phone'));
    expect(phoneOffence).toBeDefined();
    expect(phoneOffence?.fine).toBe(1295);
    expect(phoneOffence?.demeritPoints).toBe(4);

    const seatbeltOffence = QLD_ROAD_RULES_FINES.find(f => f.offence.includes('seatbelt'));
    expect(seatbeltOffence).toBeDefined();
    expect(seatbeltOffence?.fine).toBe(1295);
    expect(seatbeltOffence?.demeritPoints).toBe(4);

    const peerOffence = QLD_ROAD_RULES_FINES.find(f => f.offence.includes('peer passenger'));
    expect(peerOffence).toBeDefined();
    expect(peerOffence?.fine).toBe(518); // 3 penalty units @ $172.70
    expect(peerOffence?.demeritPoints).toBe(3);

    const redLightOffence = QLD_ROAD_RULES_FINES.find(f => f.offence.includes('red traffic light'));
    expect(redLightOffence).toBeDefined();
    expect(redLightOffence?.fine).toBe(690);
    expect(redLightOffence?.demeritPoints).toBe(3);

    const highSpeedOffence = QLD_ROAD_RULES_FINES.find(f => f.offence.includes('more than 40 km/h'));
    expect(highSpeedOffence).toBeDefined();
    expect(highSpeedOffence?.fine).toBe(1986);
    expect(highSpeedOffence?.demeritPoints).toBe(8);
  });

  it('verifies PPSR statutory check parameters and fee integrity', () => {
    expect(OFFICIAL_PPSR_DATA.officialFee).toBe(2.00);
    expect(OFFICIAL_PPSR_DATA.officialUrl).toBe('https://www.ppsr.gov.au');
    expect(OFFICIAL_PPSR_DATA.thirdPartyWarning).toContain('ppsr.gov.au');
    expect(OFFICIAL_PPSR_DATA.whatItChecks.length).toBe(4);
  });

  it('verifies QLD CTP Class 1 insurers exclude RACQ as direct underwriter', () => {
    const providerNames = QLD_CTP_PROVIDERS.map(p => p.name);
    expect(providerNames).toContain('Suncorp Insurance');
    expect(providerNames).toContain('Allianz Australia');
    expect(providerNames).toContain('QBE Insurance');
    expect(providerNames).not.toContain('RACQ Insurance'); // Exited 1 Oct 2023
  });

  it('verifies Brisbane fuel cycle metrics and parking zone parameters', () => {
    expect(BRISBANE_PRICE_CYCLE.days).toBe(35);
    expect(BRISBANE_PRICE_CYCLE.durationRange).toContain('28–45 days');
    expect(BRISBANE_FUEL_CYCLE_METRICS.savingsPer50LTank).toBe(25.00);
    expect(QLD_FUEL_REPORTING_SCHEME.reportingWindowMinutes).toBe(30);
    expect(BRISBANE_PARKING_ZONES).toHaveLength(3);
    expect(BRISBANE_FREE_PARKING_TIPS.length).toBeGreaterThan(0);
  });
});

describe('Cars & Driving Module (carDrivingModule)', () => {
  it('has 15 well-structured educational topics', () => {
    expect(carDrivingModule.topics).toHaveLength(15);
  });

  it('verifies every topic has valid metadata and official webLink', () => {
    for (const topic of carDrivingModule.topics) {
      expect(topic.id).toMatch(/^cd-\d+$/);
      expect(topic.question).toBeTruthy();
      expect(topic.answer).toBeTruthy();
      expect(topic.actionStep).toBeTruthy();
      expect(topic.webLink).toBeDefined();
      expect(topic.webLink?.url).toMatch(/^https?:\/\//);
      expect(topic.webLink?.title).toBeTruthy();
    }
  });

  it('explicitly references PrepL, 100 logbook hours, $1,295 mobile fine and peer passenger rules in answers', () => {
    const q1 = carDrivingModule.topics.find(t => t.id === 'cd-1');
    expect(q1?.answer).toContain('PrepL road rules course ($29.70)');
    expect(q1?.answer).toContain('$80.15');
    expect(q1?.answer).toContain('$543.25');

    const q5 = carDrivingModule.topics.find(t => t.id === 'cd-5');
    expect(q5?.answer).toContain('$1,295 and 4 demerit points');
    expect(q5?.answer).toContain('11:00 PM and 5:00 AM');
    expect(q5?.answer).toContain('$518');
    expect(q5?.answer).toContain('double demerit points');

    const q6 = carDrivingModule.topics.find(t => t.id === 'cd-6');
    expect(q6?.answer).toContain('$385.45 registration');
    expect(q6?.answer).toContain('$67.25 traffic improvement fee');
    expect(q6?.answer).toContain('CTP Green Slip');

    const q8 = carDrivingModule.topics.find(t => t.id === 'cd-8');
    expect(q8?.answer).toContain('$33.65 transfer fee');
    expect(q8?.answer).toContain('Safety Certificate');
  });

  it('verifies Brisbane fuel cycle dynamics and commuter economics', () => {
    expect(BRISBANE_FUEL_CYCLE_METRICS.typicalCycleDaysMin).toBe(28);
    expect(BRISBANE_FUEL_CYCLE_METRICS.typicalCycleDaysMax).toBe(45);
    expect(BRISBANE_FUEL_CYCLE_METRICS.troughPriceUlp91Min).toBe(1.80);
    expect(BRISBANE_FUEL_CYCLE_METRICS.troughPriceUlp91Max).toBe(1.95);
    expect(BRISBANE_FUEL_CYCLE_METRICS.peakPriceUlp91Min).toBe(2.30);
    expect(BRISBANE_FUEL_CYCLE_METRICS.peakPriceUlp91Max).toBe(2.45);
    expect(BRISBANE_FUEL_CYCLE_METRICS.annualCommuterSavings).toBeGreaterThanOrEqual(400);
    expect(BRISBANE_PRICE_CYCLE.annualCommuterSavings).toContain('$400 – $600');
  });

  it('verifies Queensland mandatory real-time fuel reporting regulations', () => {
    expect(QLD_FUEL_REPORTING_SCHEME.regulation).toContain('Fair Trading (Fuel Price Reporting) Regulation 2018');
    expect(QLD_FUEL_REPORTING_SCHEME.reportingWindowMinutes).toBe(30);
    expect(QLD_FUEL_REPORTING_SCHEME.maximumPenaltyUnits).toBe(20);
    expect(QLD_FUEL_REPORTING_SCHEME.consumerApps).toContain('RACQ Fuel and Deals (Fair Fuel Finder)');
  });

  it('verifies Brisbane City Council parking zones and rules', () => {
    expect(BRISBANE_PARKING_ZONES).toHaveLength(3);
    const [z1, z2, z3] = BRISBANE_PARKING_ZONES;

    expect(z1.zone).toBe('Zone 1');
    expect(z1.area).toContain('Brisbane CBD');
    expect(z1.weekdayHourly).toBe(6.85);
    expect(z1.weekendHourly).toContain('$3.70/hr');

    expect(z2.zone).toBe('Zone 2');
    expect(z2.area).toContain('Fortitude Valley');
    expect(z2.area).toContain('Spring Hill');
    expect(z2.area).toContain('Milton');
    expect(z2.weekdayHourly).toBe(4.95);

    expect(z3.zone).toBe('Zone 3');
    expect(z3.weekdayHourly).toBe(3.45);
    expect(z3.weekendHourly).toContain('FREE all weekend');

    expect(BRISBANE_FREE_PARKING_TIPS[0]).toContain('15-minute parking');
    expect(BRISBANE_FREE_PARKING_TIPS[0]).toContain('rego');
  });
});
