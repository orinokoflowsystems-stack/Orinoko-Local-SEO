import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { CardGrid } from '@/components/layout/CardGrid';
import { DataTable } from '@/components/layout/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { customersService } from '@/services/customers';
import { useToastContext } from '@/context/ToastContext';
import type { Customer } from '@/types';

export function CustomersListPage() {
  const { showToast } = useToastContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table');
  const [open, setOpen] = useState(false);

  const load = async () => {
    const response = await customersService.listCustomers({ query: search, pageSize: 50 });
    setCustomers(response.data);
  };

  useEffect(() => { void load(); }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Track homeowners, commercial accounts, and customer lifetime value." actions={<Button onClick={() => setOpen(true)}>New customer</Button>} />
      <Tabs tabs={[{ id: 'table', label: 'Table' }, { id: 'cards', label: 'Cards' }]} value={view} onChange={setView} />
      {view === 'table' ? (
        <DataTable
          title="Customer records"
          search={search}
          onSearchChange={setSearch}
          data={customers}
          rowKey={(customer) => customer.id}
          columns={[
            { id: 'name', header: 'Customer', accessor: 'firstName', sortable: true, cell: (customer) => <Link to={`/customers/${customer.id}`} className="font-medium text-brand-700 dark:text-brand-300">{customer.firstName} {customer.lastName}</Link> },
            { id: 'type', header: 'Type', accessor: 'type', sortable: true, cell: (customer) => <Badge>{customer.type}</Badge> },
            { id: 'email', header: 'Email', accessor: 'email', sortable: true },
            { id: 'totalSpent', header: 'Lifetime value', accessor: 'totalSpent', sortable: true, cell: (customer) => `$${customer.totalSpent.toFixed(2)}` },
            { id: 'jobsCompleted', header: 'Jobs', accessor: 'jobsCompleted', sortable: true },
          ]}
        />
      ) : (
        <CardGrid>
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/customers/${customer.id}`} className="text-lg font-semibold text-slate-950 hover:text-brand-700 dark:text-white dark:hover:text-brand-300">{customer.firstName} {customer.lastName}</Link>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{customer.companyName ?? customer.email}</p>
                  </div>
                  <Badge>{customer.type}</Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{customer.jobsCompleted} jobs • ${customer.totalSpent.toFixed(0)} billed</p>
              </CardBody>
            </Card>
          ))}
        </CardGrid>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Create customer">
        <CustomerForm
          initialValues={{}}
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            await customersService.create({
              organizationId: 'org-handy-glass',
              firstName: values.firstName ?? '',
              lastName: values.lastName ?? '',
              email: values.email,
              phone: values.phone,
              companyName: values.companyName,
              address: values.address ?? { street: '', city: '', state: '', postalCode: '', country: 'USA' },
              type: values.type ?? 'residential',
              preferredContact: values.preferredContact ?? 'phone',
              totalSpent: 0,
              jobsCompleted: 0,
              notes: values.notes,
              tags: values.tags ?? [],
              isDemo: true,
            });
            showToast({ title: 'Customer created', description: 'New customer record saved.', type: 'success' });
            setOpen(false);
            await load();
          }}
        />
      </Modal>
    </div>
  );
}

