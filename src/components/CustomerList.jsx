import { formatDate } from '../lib/utils';

/**
 * CustomerList — The feed card containing all customer rows.
 * Rows are selectable to reveal the customer's transactions (Paystack relationship).
 */
function CustomerRow({ customer, isSelected, onSelect, onEdit }) {
  const initials = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    || customer.email.charAt(0).toUpperCase();

  return (
    <article
      className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_150px_130px_auto] items-center gap-3 md:gap-4 py-3 px-4 border-b cursor-pointer transition-colors hover:opacity-90"
      style={{
        borderColor: 'var(--color-border)',
        background: isSelected ? 'var(--color-brand-light)' : 'transparent',
      }}
      onClick={() => onSelect(customer)}
    >
      {/* Avatar */}
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand-dark)' }}
      >
        {initials}
      </span>

      {/* Name + email */}
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{customer.displayName}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {customer.email}
        </p>
        <p className="text-xs mt-0.5 md:hidden" style={{ color: 'var(--color-text-tertiary)' }}>
          {customer.customerCode}{customer.phone ? ` · ${customer.phone}` : ''}
        </p>
      </div>

      {/* Phone (desktop) */}
      <p className="text-xs hidden md:block truncate" style={{ color: 'var(--color-text-secondary)' }}>
        {customer.phone || '—'}
      </p>

      {/* Code + joined (desktop) */}
      <div className="hidden md:block">
        <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
          {customer.customerCode}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
          Joined {formatDate(customer.createdAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onSelect(customer)}
          className="px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer"
          style={
            isSelected
              ? { background: 'var(--color-brand)', color: 'white' }
              : { background: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)' }
          }
        >
          {isSelected ? 'Hide txns' : 'View txns'}
        </button>
        <button
          onClick={() => onEdit(customer)}
          className="px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors hover:opacity-80"
          style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)' }}
        >
          Edit
        </button>
      </div>
    </article>
  );
}

export default function CustomerList({ customers, selectedId, onSelect, onEdit }) {
  return (
    <section
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      {/* Column headers (desktop) */}
      <div
        className="hidden md:grid grid-cols-[auto_1fr_150px_130px_auto] items-center gap-4 py-2.5 px-4 border-b text-xs font-semibold uppercase tracking-wider"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
      >
        <span className="w-9" />
        <span>Customer</span>
        <span>Phone</span>
        <span>Code</span>
        <span className="w-[140px] text-right">Actions</span>
      </div>

      {/* Customer rows */}
      <div>
        {customers.length === 0 ? (
          <p className="p-8 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            No customers found. Create one to get started.
          </p>
        ) : (
          <div>
            <p className="px-4 py-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
            </p>
            {customers.map((customer) => (
              <CustomerRow
                key={customer.customerCode || customer.id}
                customer={customer}
                isSelected={selectedId === customer.id}
                onSelect={onSelect}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
