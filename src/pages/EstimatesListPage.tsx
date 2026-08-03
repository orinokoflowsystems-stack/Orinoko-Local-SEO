import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EstimateForm } from '@/components/forms/EstimateForm';
import { DataTable } from '@/components/layout/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { estimatesService } from '@/services/estimates';
import { getTable } from '@/services/storage';
import { useToastContext } from '@/context/ToastContext';
import type { Customer, Estimate } from '@/types';

export function EstimatesListPage() {
  const { showToast } = useToastContext();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const load = async () => {
    const response = await estimatesService.listEstimates({ query: search, pageSize: 50 });
    setEstimates(response.data);
    setCustomers(getTable('customers'));
  };

  useEffect(() => { void load(); }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Estimates" description="Create, send, approve, and track estimate workflows." actions={<Button onClick={() => setOpen(true)}>New estimate</Button>} />
      <DataTable
        title="Estimate register"
        search={search}
        onSearchChange={setSearch}
        data={estimates}
        rowKey={(estimate) => estimate.id}
        columns={[
          { id: 'estimateNumber', header: 'Estimate', accessor: 'estimateNumber', sortable: true, cell: (estimate) => <Link to={`/estimates/${estimate.id}`} className="font-medium text-brand-700 dark:text-brand-300">{estimate.estimateNumber}</Link> },
          { id: 'customerName', header: 'Customer', accessor: 'customerName', sortable: true },
          { id: 'status', header: 'Status', accessor: 'status', sortable: true, cell: (estimate) => <Badge variant={estimate.status === 'approved' ? 'success' : estimate.status === 'declined' ? 'danger' : 'info'}>{estimate.status}</Badge> },
          { id: 'total', header: 'Total', accessor: 'total', sortable: true, cell: (estimate) => `$${estimate.total.toFixed(2)}` },
          { id: 'validUntil', header: 'Valid until', accessor: 'validUntil', sortable: true, cell: (estimate) => new Date(estimate.validUntil).toLocaleDateString() },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Create estimate">
        <EstimateForm
          customers={customers}
          initialValues={{}}
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            await estimatesService.create({
              organizationId: 'org-handy-glass',
              estimateNumber: values.estimateNumber ?? '',
              customerId: values.customerId ?? '',
              customerName: values.customerName ?? '',
              status: values.status ?? 'draft',
              validUntil: values.validUntil ?? new Date().toISOString(),
              scopeOfWork: values.scopeOfWork ?? '',
              notes: values.notes,
              items: values.items ?? [],
              subtotal: values.subtotal ?? 0,
              tax: values.tax ?? 0,
              total: (values.subtotal ?? 0) + (values.tax ?? 0),
              isDemo: true,
            });
            showToast({ title: 'Estimate created', description: 'Estimate is ready for review or sending.', type: 'success' });
            setOpen(false);
            await load();
          }}
        />
      </Modal>
    </div>
  );
}

