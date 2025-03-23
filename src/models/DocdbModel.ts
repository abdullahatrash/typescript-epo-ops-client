export class DocdbModel {
  constructor(
    private documentNumber: string,
    private countryCode: string,
    private kindCode: string
  ) {}

  toString(): string {
    return `${this.documentNumber}.${this.countryCode}.${this.kindCode}`;
  }

  getDocumentNumber(): string {
    return this.documentNumber;
  }

  getCountryCode(): string {
    return this.countryCode;
  }

  getKindCode(): string {
    return this.kindCode;
  }
} 
