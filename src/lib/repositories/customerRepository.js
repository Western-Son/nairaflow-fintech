/**
 * Customer Repository
 * Handles all customer-related API calls to Paystack
 * Reference: https://paystack.com/docs/api/customer/
 */

import { getPaystackClient } from '../paystackClient.js';
import { CustomerAdapter } from '../adapters/customerAdapter.js';

class CustomerRepository {
  constructor(client = null) {
    this.client = client || getPaystackClient();
  }

  /**
   * List all customers with optional filters
   * @param {Object} filters - Query parameters for filtering
   * @param {string} filters.perPage - Number of results per page
   * @param {string} filters.page - Page number to retrieve
   * @param {string} filters.from - Start date to filter customers (YYYY-MM-DD)
   * @param {string} filters.to - End date to filter customers (YYYY-MM-DD)
   * @returns {Promise<Object>} Paginated customer list
   */
  async listCustomers(filters = {}) {
    const response = await this.client.get('/customer', filters);

    return {
      data: CustomerAdapter.fromPaystackArray(response.data),
      meta: CustomerAdapter.extractPagination(response),
      status: response.status,
      message: response.message,
    };
  }

  /**
   * Get a single customer by customer code, email or ID
   * @param {string} code - Customer code (CUS_xxx), email or ID
   * @returns {Promise<Object>} Customer details
   */
  async getCustomer(code) {
    const response = await this.client.get(`/customer/${encodeURIComponent(code)}`);

    return {
      data: CustomerAdapter.fromPaystack(response.data),
      status: response.status,
      message: response.message,
    };
  }

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @param {string} customerData.email - Customer's email address (required)
   * @param {string} customerData.firstName - Customer's first name
   * @param {string} customerData.lastName - Customer's last name
   * @param {string} customerData.phone - Customer's phone number
   * @param {Object} customerData.metadata - Additional metadata
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    const payload = CustomerAdapter.toPaystackCreate(customerData);
    const response = await this.client.post('/customer', payload);

    return {
      data: CustomerAdapter.fromPaystack(response.data),
      status: response.status,
      message: response.message,
    };
  }

  /**
   * Update an existing customer by customer code
   * @param {string} code - Customer code (CUS_xxx)
   * @param {Object} customerData - Fields to update (email cannot be updated)
   * @param {string} customerData.firstName - Customer's first name
   * @param {string} customerData.lastName - Customer's last name
   * @param {string} customerData.phone - Customer's phone number
   * @param {Object} customerData.metadata - Additional metadata
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(code, customerData) {
    const payload = CustomerAdapter.toPaystackUpdate(customerData);
    const response = await this.client.put(`/customer/${encodeURIComponent(code)}`, payload);

    return {
      data: CustomerAdapter.fromPaystack(response.data),
      status: response.status,
      message: response.message,
    };
  }

  /**
   * Whitelist or blacklist a customer
   * @param {string} customer - Customer code or email address
   * @param {string} riskAction - One of 'default', 'allow', 'deny'
   * @returns {Promise<Object>} Result
   */
  async setRiskAction(customer, riskAction = 'default') {
    const response = await this.client.post('/customer/set_risk_action', {
      customer,
      risk_action: riskAction,
    });

    return {
      data: response.data,
      status: response.status,
      message: response.message,
    };
  }

  /**
   * Deactivate a customer's card authorization
   * @param {string} authorizationCode - Authorization code to deactivate
   * @returns {Promise<Object>} Result
   */
  async deactivateAuthorization(authorizationCode) {
    const response = await this.client.post('/customer/deactivate_authorization', {
      authorization_code: authorizationCode,
    });

    return {
      data: response.data,
      status: response.status,
      message: response.message,
    };
  }
}

/**
 * Create a singleton instance of the customer repository
 */
let customerRepositoryInstance = null;

export function getCustomerRepository() {
  if (!customerRepositoryInstance) {
    customerRepositoryInstance = new CustomerRepository();
  }
  return customerRepositoryInstance;
}

/**
 * Create a new customer repository instance (for testing or custom config)
 */
export function createCustomerRepository(client) {
  return new CustomerRepository(client);
}

export default CustomerRepository;
