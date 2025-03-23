/**
 * Creates a new DocdbModel instance for representing patent document identifiers in DOCDB format
 * @param countryCode The country code (e.g., 'EP', 'US')
 * @param documentNumber The document number (e.g., '1000000')
 * @param kindCode The kind code (e.g., 'A1', 'B1')
 */
export class DocdbModel {
  constructor(
    private countryCode: string,
    private documentNumber: string,
    private kindCode: string
  ) {}

  /**
   * Returns the string representation of the patent document in DOCDB format
   * @returns {string} The patent document identifier in format: countryCode.documentNumber.kindCode
   */
  toString(): string {
    return `${this.countryCode}.${this.documentNumber}.${this.kindCode}`;
  }

  /**
   * Gets the document number
   * @returns {string} The document number
   */
  getDocumentNumber(): string {
    return this.documentNumber;
  }

  /**
   * Gets the country code
   * @returns {string} The country code
   */
  getCountryCode(): string {
    return this.countryCode;
  }

  /**
   * Gets the kind code
   * @returns {string} The kind code
   */
  getKindCode(): string {
    return this.kindCode;
  }
}