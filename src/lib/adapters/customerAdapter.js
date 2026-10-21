/**
 * Customer Adapter
 * Transforms Paystack API customer responses to our application's data structure
 * Reference: https://paystack.com/docs/api/customer/
 */

export class CustomerAdapter {
  /**
   * Transform Paystack customer to our app's customer format
   */
  static fromPaystack(paystackCustomer) {
    return {
      id: paystackCustomer.id,
      customerCode: paystackCustomer.customer_code,
      email: paystackCustomer.email,
      firstName: paystackCustomer.first_name || null,
      lastName: paystackCustomer.last_name || null,
      phone: paystackCustomer.phone || null,
      metadata: this.parseMetadata(paystackCustomer.metadata),
      riskAction: paystackCustomer.risk_action,
      domain: paystackCustomer.domain,
      identified: paystackCustomer.identified || false,
      createdAt: paystackCustomer.createdAt,
      updatedAt: paystackCustomer.updatedAt,
      displayName: this.buildDisplayName(paystackCustomer),
      authorizations: paystackCustomer.authorizations || [],
      subscriptions: paystackCustomer.subscriptions || [],
      transactions: paystackCustomer.transactions || [],
    };
  }

  /**
   * Transform array of Paystack customers
   */
  static fromPaystackArray(paystackCustomers) {
    return (paystackCustomers || []).map(customer => this.fromPaystack(customer));
  }

  /**
   * Build a display name from available name parts, falling back to email
   */
  static buildDisplayName(paystackCustomer) {
    const fullName = [paystackCustomer.first_name, paystackCustomer.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || paystackCustomer.email || 'Unknown customer';
  }

  /**
   * Paystack may return metadata as a stringified JSON object — normalize to object
   */
  static parseMetadata(metadata) {
    if (!metadata) return {};

    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch {
        return {};
      }
    }

    return metadata;
  }

  /**
   * Transform our app's customer to Paystack create payload
   * Only email is required; first_name, last_name, phone and metadata are optional
   */
  static toPaystackCreate(appCustomer) {
    return {
      email: appCustomer.email,
      first_name: this.emptyToUndefined(appCustomer.firstName),
      last_name: this.emptyToUndefined(appCustomer.lastName),
      phone: this.emptyToUndefined(appCustomer.phone),
      metadata: Object.keys(appCustomer.metadata || {}).length > 0 ? appCustomer.metadata : undefined,
    };
  }

  /**
   * Transform our app's customer to Paystack update payload
   * Email cannot be updated via the Paystack API
   */
  static toPaystackUpdate(appCustomer) {
    return {
      first_name: this.emptyToUndefined(appCustomer.firstName),
      last_name: this.emptyToUndefined(appCustomer.lastName),
      phone: this.emptyToUndefined(appCustomer.phone),
      metadata: Object.keys(appCustomer.metadata || {}).length > 0 ? appCustomer.metadata : undefined,
    };
  }

  /**
   * Empty strings are treated as "not provided" so optional fields stay optional
   */
  static emptyToUndefined(value) {
    if (value === undefined || value === null) return undefined;
    const trimmed = String(value).trim();
    return trimmed === '' ? undefined : trimmed;
  }

  /**
   * Extract pagination metadata from a Paystack customer list response
   * Customer list meta uses { next, previous, perPage } cursors
   */
  static extractPagination(paystackResponse) {
    return {
      perPage: paystackResponse.meta?.perPage || 50,
      next: paystackResponse.meta?.next || null,
      previous: paystackResponse.meta?.previous || null,
      total: paystackResponse.meta?.total || 0,
      totalPages: paystackResponse.meta?.total_pages || 0,
    };
  }

  /**
   * Filter customers by a search query (name, email, customer code or phone)
   */
  static filterBySearch(customers, query) {
    if (!query) return customers;

    const term = query.toLowerCase().trim();

    return customers.filter(customer =>
      [customer.email, customer.firstName, customer.lastName, customer.displayName, customer.customerCode, customer.phone]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(term))
    );
  }

  /**
   * Calculate basic customer statistics
   */
  static calculateStatistics(customers) {
    const withPhone = customers.filter(c => c.phone).length;
    const withMetadata = customers.filter(c => Object.keys(c.metadata || {}).length > 0).length;

    return {
      total: customers.length,
      withPhone,
      withMetadata,
    };
  }
}

export default CustomerAdapter;
