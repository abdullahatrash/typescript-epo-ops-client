export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export class IndividualQuotaPerHourExceeded extends QuotaExceededError {
  constructor() {
    super('Individual quota per hour exceeded');
    this.name = 'IndividualQuotaPerHourExceeded';
  }
}

export class RegisteredQuotaPerWeekExceeded extends QuotaExceededError {
  constructor() {
    super('Registered quota per week exceeded');
    this.name = 'RegisteredQuotaPerWeekExceeded';
  }
} 
