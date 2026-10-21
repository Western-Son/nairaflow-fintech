import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer, updateCustomer } from '../lib/api';
import { customerCreateSchema, customerUpdateSchema } from '../lib/validators/customerValidator';
import { useToast } from '../contexts/ToastContext';

/**
 * CustomerForm — Modal form for creating or editing a Paystack customer.
 * Pass `customer` to edit (email is locked — Paystack cannot update it), or null to create.
 */
export default function CustomerForm({ customer, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEdit = Boolean(customer);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isEdit ? customerUpdateSchema : customerCreateSchema),
    defaultValues: isEdit
      ? {
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          phone: customer.phone || '',
        }
      : { email: '', firstName: '', lastName: '', phone: '' },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        firstName: data.firstName?.trim() || '',
        lastName: data.lastName?.trim() || '',
        phone: data.phone?.trim() || '',
      };
      return isEdit
        ? updateCustomer({ code: customer.customerCode, ...payload })
        : createCustomer({ ...payload, email: data.email.trim() });
    },
    onSuccess: (data) => {
      toast.success(isEdit ? `Customer ${data.email} updated` : `Customer ${data.email} created`);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong. Please try again.');
    },
  });

  const inputStyle = (hasError) => ({
    borderColor: hasError ? 'var(--color-error)' : 'var(--color-border)',
    background: 'var(--color-surface-alt)',
    color: 'var(--color-text)',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        onClick={(e) => e.stopPropagation()}
        className="rounded-xl border p-6 w-full max-w-md space-y-4 shadow-xl max-h-[90vh] overflow-y-auto transition-colors"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? 'Edit Customer' : 'New Customer'}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg border text-sm cursor-pointer transition-colors"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-text)' }}
          >
            ✕
          </button>
        </div>

        {isEdit && (
          <p className="text-xs rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            Editing <strong>{customer.customerCode}</strong>. Email addresses cannot be changed via the Paystack API.
          </p>
        )}

        {/* Email — required for create, locked for edit */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="customer-email">Email address</label>
          <input
            {...register('email')}
            id="customer-email"
            type="email"
            placeholder="customer@email.com"
            disabled={isEdit}
            readOnly={isEdit}
            className="w-full px-3 py-2 rounded-lg border text-sm disabled:opacity-60"
            style={inputStyle(errors.email)}
          />
          {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="customer-first-name">First name</label>
            <input
              {...register('firstName')}
              id="customer-first-name"
              placeholder="Chinedu"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={inputStyle(errors.firstName)}
            />
            {errors.firstName && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="customer-last-name">Last name</label>
            <input
              {...register('lastName')}
              id="customer-last-name"
              placeholder="Okafor"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={inputStyle(errors.lastName)}
            />
            {errors.lastName && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="customer-phone">Phone number</label>
          <input
            {...register('phone')}
            id="customer-phone"
            type="tel"
            placeholder="+2348123456789"
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={inputStyle(errors.phone)}
          />
          {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.phone.message}</p>}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50 transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'var(--color-brand)' }}
        >
          {mutation.isPending ? (isEdit ? '⏳ Saving...' : '⏳ Creating...') : isEdit ? 'Save Changes' : 'Create Customer'}
        </button>
      </form>
    </div>
  );
}
