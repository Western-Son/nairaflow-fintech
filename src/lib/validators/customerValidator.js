/**
 * Customer Validator
 * Validates customer data before sending to Paystack API
 * Reference: https://paystack.com/docs/api/customer/
 */

import { z } from 'zod';

/**
 * Optional fields accept either a trimmed non-empty value or an empty string
 * (HTML inputs submit '' rather than undefined)
 */
const optionalName = z.string().trim().max(100, 'Name is too long').or(z.literal('')).optional();
const optionalPhone = z.string().trim().regex(/^\+?[\d\s-]{7,15}$/, 'Invalid phone number').or(z.literal('')).optional();

/**
 * Customer creation schema — email is the only required field
 */
export const customerCreateSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  firstName: optionalName,
  lastName: optionalName,
  phone: optionalPhone,
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Customer update schema — email cannot be updated via the Paystack API
 */
export const customerUpdateSchema = z.object({
  firstName: optionalName,
  lastName: optionalName,
  phone: optionalPhone,
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Customer list filters schema
 */
export const customerFiltersSchema = z.object({
  perPage: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  search: z.string().optional(),
});

/**
 * Validate customer creation data
 */
export function validateCustomerCreate(data) {
  try {
    return {
      success: true,
      data: customerCreateSchema.parse(data),
    };
  } catch (error) {
    return {
      success: false,
      errors: error.errors,
    };
  }
}

/**
 * Validate customer update data
 */
export function validateCustomerUpdate(data) {
  try {
    return {
      success: true,
      data: customerUpdateSchema.parse(data),
    };
  } catch (error) {
    return {
      success: false,
      errors: error.errors,
    };
  }
}

/**
 * Validate customer list filters
 */
export function validateCustomerFilters(data) {
  try {
    return {
      success: true,
      data: customerFiltersSchema.parse(data),
    };
  } catch (error) {
    return {
      success: false,
      errors: error.errors,
    };
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors) {
  return errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}
