import type { MandyModule, TopicGuide } from './modules/types';
import { moneyAndYouModule } from './modules/money-and-you';
import { careersEmploymentModule } from './modules/careers-employment';
import { superRetirementModule } from './modules/super-retirement';
import { taxGuideModule } from './modules/tax-guide';
import { teenBudgetingModule } from './modules/teen-budgeting';
import { spendingSavingModule } from './modules/spending-saving';
import { investingSharesModule } from './modules/investing-shares';
import { interestProductsModule } from './modules/interest-products';
import { dealingWithDebtModule } from './modules/dealing-with-debt';
import { carDrivingModule } from './modules/car-driving';
import { brisbaneQldModule } from './modules/brisbane-qld';

export type { TopicGuide, MandyModule };

export {
  moneyAndYouModule,
  careersEmploymentModule,
  superRetirementModule,
  taxGuideModule,
  teenBudgetingModule,
  spendingSavingModule,
  investingSharesModule,
  interestProductsModule,
  dealingWithDebtModule,
  carDrivingModule,
  brisbaneQldModule,
};

export const MANDY_MODULES: MandyModule[] = [
  moneyAndYouModule,
  careersEmploymentModule,
  superRetirementModule,
  taxGuideModule,
  teenBudgetingModule,
  spendingSavingModule,
  investingSharesModule,
  interestProductsModule,
  dealingWithDebtModule,
  carDrivingModule,
  brisbaneQldModule,
];
