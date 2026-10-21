/**
 * Customer Service
 * Business logic layer for customer operations
 */

import { getCustomerRepository } from '../repositories/customerRepository.js';
import { CustomerAdapter } from '../adapters/customerAdapter.js';

class CustomerService {
  constructor(repository = null) {
    this.repository = repository || getCustomerRepository();
  }

  /**
   * Fetch all customers with optional filtering
   * @param {Object} filters - Filter options
   * @param {string} filters.search - Search term (name, email, code, phone) — applied client-side
   * @param {number} filters.perPage - Results per page
   * @param {number} filters.page - Page number
   * @param {string} filters.from - Start date (YYYY-MM-DD)
   * @param {string} filters.to - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Filtered customers with pagination
   */
  async fetchCustomers(filters = {}) {
    try {
      const { search, ...apiFilters } = filters;
      const response = await this.repository.listCustomers(apiFilters);

      let customers = response.data;

      if (search) {
        customers = CustomerAdapter.filterBySearch(customers, search);
      }

      return {
        customers,
        pagination: response.meta,
        statistics: CustomerAdapter.calculateStatistics(customers),
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * Fetch a single customer by customer code, email or ID
   * @param {string} code - Customer code (CUS_xxx), email or ID
   * @returns {Promise<Object>} Customer details
   */
  async fetchCustomer(code) {
    try {
      const response = await this.repository.getCustomer(code);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
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
    try {
      const validation = this.validateCustomerData(customerData, { requireEmail: true });
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await this.repository.createCustomer(customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Update an existing customer by customer code
   * @param {string} code - Customer code (CUS_xxx)
   * @param {Object} customerData - Fields to update (email cannot be updated via API)
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(code, customerData) {
    try {
      if (!code) {
        throw new Error('Customer code is required for updates');
      }

      const validation = this.validateCustomerData(customerData, { requireEmail: false });
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await this.repository.updateCustomer(code, customerData);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  /**
   * Whitelist or blacklist a customer
   * @param {string} customer - Customer code or email address
   * @param {string} riskAction - One of 'default', 'allow', 'deny'
   */
  async setRiskAction(customer, riskAction = 'default') {
    try {
      if (!['default', 'allow', 'deny'].includes(riskAction)) {
        throw new Error('Risk action must be one of: default, allow, deny');
      }

      const response = await this.repository.setRiskAction(customer, riskAction);
      return response.data;
    } catch (error) {
      console.error('Error setting customer risk action:', error);
      throw error;
    }
  }

  /**
   * Validate customer data before sending to Paystack
   * @param {Object} customerData - Customer data to validate
   * @param {Object} options - Validation options
   * @param {boolean} options.requireEmail - Whether email is required (create vs update)
   * @returns {Object} Validation result
   */
  validateCustomerData(customerData, { requireEmail = false } = {}) {
    const errors = [];

    if (requireEmail && !customerData.email) {
      errors.push('Email is required');
    }

    if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.push('Invalid email address');
    }

    if (customerData.phone && !/^\+?[\d\s-]{7,15}$/.test(customerData.phone)) {
      errors.push('Invalid phone number');
    }

    if (!requireEmail) {
      const hasUpdatableField = Boolean(
        customerData.firstName?.trim() ||
        customerData.lastName?.trim() ||
        customerData.phone?.trim() ||
        Object.keys(customerData.metadata || {}).length > 0
      );

      if (!hasUpdatableField) {
        errors.push('No fields to update');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get customer statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Customer statistics
   */
  async getCustomerStatistics(filters = {}) {
    const result = await this.fetchCustomers(filters);
    return result.statistics;
  }
}

/**
 * Create a singleton instance of the customer service
 */
let customerServiceInstance = null;

export function getCustomerService() {
  if (!customerServiceInstance) {
    customerServiceInstance = new CustomerService();
  }
  return customerServiceInstance;
}

/**
 * Create a new customer service instance (for testing or custom config)
 */
export function createCustomerService(repository) {
  return new CustomerService(repository);
}

export default CustomerService;
