import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCustomers, fetchCustomerTransactions } from '../lib/api';
import CustomerList from '../components/CustomerList';
import CustomerForm from '../components/CustomerForm';
import TransactionFeed from '../components/TransactionFeed';

/**
 * CustomersPage — Create, edit and view customers backed by the Paystack Customers API.
 * Selecting a customer loads their transactions via Paystack's List Transactions
 * (customer filter), wiring the customer ↔ transaction relationship.
 */
export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [txFilter, setTxFilter] = useState('all');

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: () => fetchCustomers(),
  });

  const customerTxsQuery = useQuery({
    queryKey: ['customer-transactions', selectedCustomer?.id],
    queryFn: () => fetchCustomerTransactions(selectedCustomer.id),
    enabled: Boolean(selectedCustomer),
  });

  const customers = customersQuery.data ?? [];
  const filtered = search.trim()
    ? customers.filter((customer) =>
        [customer.displayName, customer.email, customer.customerCode, customer.phone]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search.trim().toLowerCase()))
      )
    : customers;

  const transactions = customerTxsQuery.data ?? [];

  function handleOpenCreate() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function handleEdit(customer) {
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  function handleSelect(customer) {
    setTxFilter('all');
    setSelectedCustomer((prev) => (prev?.id === customer.id ? null : customer));
  }

  return (
    <>
      <title>Customers — NairaFlow</title>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Customers</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Create and manage customers on your Paystack integration
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.98] self-start sm:self-auto"
            style={{ background: 'var(--color-brand)' }}
          >
            + Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, code or phone..."
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </div>

        {/* Customer list */}
        {customersQuery.isPending ? (
          <div className="space-y-3 p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-9 w-9 rounded-full" style={{ background: 'var(--color-border)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded" style={{ background: 'var(--color-border)' }} />
                  <div className="h-3 w-32 rounded" style={{ background: 'var(--color-border)' }} />
                </div>
                <div className="h-4 w-20 rounded" style={{ background: 'var(--color-border)' }} />
              </div>
            ))}
          </div>
        ) : customersQuery.isError ? (
          <div className="rounded-xl border p-6 text-center" style={{ borderColor: 'var(--color-error)' }}>
            <p style={{ color: 'var(--color-error)' }}>Failed to load customers</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {customersQuery.error?.message}
            </p>
            <button onClick={() => customersQuery.refetch()} className="mt-2 text-sm underline cursor-pointer">
              Retry
            </button>
          </div>
        ) : (
          <CustomerList
            customers={filtered}
            selectedId={selectedCustomer?.id}
            onSelect={handleSelect}
            onEdit={handleEdit}
          />
        )}

        {/* Selected customer's transactions — customer ↔ transaction relationship */}
        {selectedCustomer && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Transactions — {selectedCustomer.displayName}
              </h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-sm underline cursor-pointer"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Close
              </button>
            </div>

            {customerTxsQuery.isPending ? (
              <div className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--color-border)' }} />
            ) : customerTxsQuery.isError ? (
              <div className="rounded-xl border p-6 text-center" style={{ borderColor: 'var(--color-error)' }}>
                <p style={{ color: 'var(--color-error)' }}>Failed to load this customer's transactions</p>
                <button onClick={() => customerTxsQuery.refetch()} className="mt-2 text-sm underline cursor-pointer">
                  Retry
                </button>
              </div>
            ) : (
              <TransactionFeed
                transactions={transactions}
                filter={txFilter}
                onFilterChange={setTxFilter}
              />
            )}
          </section>
        )}

        {/* Create / Edit modal */}
        {formOpen && (
          <CustomerForm
            customer={editingCustomer}
            onClose={() => setFormOpen(false)}
          />
        )}
      </div>
    </>
  );
}
