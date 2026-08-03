import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { DataTable } from '@/components/layout/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { invoicesService } from '@/services/invoices';
import { getTable } from '@/services/storage';
import { useToastContext } from '@/context/ToastContext';
import type { Customer, Invoice } from '@/types';

export function InvoicesListPage() {
  const { showToast } = useToastContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      const response = await invoicesService.listInvoices({ query: search, pageSize: 50 });
      setInvoices(response.data);
      setCustomers(getTable('customers'));
    })();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Generate invoices from jobs and track payment status." actions={<Button onClick={() => setOpen(true)}>New invoice</Button>} />
      <DataTable
        title="Invoice ledger"
        search={search}
        onSearchChange={setSearch}
        data={invoices}
        rowKey={(invoice) => invoice.id}
        columns={[
          { id: 'invoiceNumber', header: 'Invoice', accessor: 'invoiceNumber', sortable: true, cell: (invoice) => <Link className="font-medium text-brand-700 dark:text-brand-300" to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link> },
          { id: 'customerName', header: 'Customer', accessor: 'customerName', sortable: true },
          { id: 'status', header: 'Status', accessor: 'status', sortable: true, cell: (invoice) => <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'}>{invoice.status}</Badge> },
          { id: 'total', header: 'Total', accessor: 'total', sortable: true, cell: (invoice) => `$${invoice.total.toFixed(2)}` },
          { id: 'balanceDue', header: 'Balance', accessor: 'balanceDue', sortable: true, cell: (invoice) => `$${invoice.balanceDue.toFixed(2)}` },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Create invoice">
        <InvoiceForm
          customers={customers}
          initialValues={{}}
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            await invoicesService.create({
              organizationId: 'org-handy-glass',
              invoiceNumber: values.invoiceNumber ?? '',
              customerId: values.customerId ?? '',
              customerName: values.customerName ?? '',
              status: values.status ?? 'draft',
              dueDate: values.dueDate ?? new Date().toISOString(),
              issuedAt: values.issuedAt ?? new Date().toISOString(),
              items: values.items ?? [],
              subtotal: values.subtotal ?? 0,
              tax: values.tax ?? 0,
              total: (values.subtotal ?? 0) + (values.tax ?? 0),
              balanceDue: (values.subtotal ?? 0) + (values.tax ?? 0),
              payments: [],
              notes: values.notes,
              isDemo: true,
            });
            showToast({ title: 'Invoice created', description: 'Invoice added to the ledger.', type: 'success' });
            setOpen(false);
            const response = await invoicesService.listInvoices({ query: search, pageSize: 50 });
            setInvoices(response.data);
            setCustomers(getTable('customers'));
          }}
        />
      </Modal>
    </div>
  );
}

