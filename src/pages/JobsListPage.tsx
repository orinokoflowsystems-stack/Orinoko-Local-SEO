import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { JobForm } from '@/components/forms/JobForm';
import { DataTable } from '@/components/layout/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { jobsService } from '@/services/jobs';
import { getTable } from '@/services/storage';
import { useToastContext } from '@/context/ToastContext';
import type { Customer, Job, Technician } from '@/types';

export function JobsListPage() {
  const { showToast } = useToastContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      const response = await jobsService.listJobs({ query: search, pageSize: 50 });
      setJobs(response.data);
      setCustomers(getTable('customers'));
      setTechnicians(getTable('technicians'));
    })();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Jobs" description="Manage full work order lifecycle from scheduling to completion." actions={<Button onClick={() => setOpen(true)}>New job</Button>} />
      <DataTable
        title="Job board"
        search={search}
        onSearchChange={setSearch}
        data={jobs}
        rowKey={(job) => job.id}
        columns={[
          { id: 'jobNumber', header: 'Job', accessor: 'jobNumber', sortable: true, cell: (job) => <Link className="font-medium text-brand-700 dark:text-brand-300" to={`/jobs/${job.id}`}>{job.jobNumber}</Link> },
          { id: 'customerName', header: 'Customer', accessor: 'customerName', sortable: true },
          { id: 'status', header: 'Status', accessor: 'status', sortable: true, cell: (job) => <Badge variant={job.status === 'completed' ? 'success' : job.status === 'in_progress' ? 'warning' : 'info'}>{job.status}</Badge> },
          { id: 'scheduledStart', header: 'Start', accessor: 'scheduledStart', sortable: true, cell: (job) => new Date(job.scheduledStart).toLocaleString() },
          { id: 'total', header: 'Total', accessor: 'total', sortable: true, cell: (job) => `$${job.total.toFixed(2)}` },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Create job">
        <JobForm
          customers={customers}
          technicians={technicians}
          initialValues={{}}
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            await jobsService.create({
              organizationId: 'org-handy-glass',
              jobNumber: values.jobNumber ?? '',
              customerId: values.customerId ?? '',
              customerName: values.customerName ?? '',
              technicianIds: values.technicianIds ?? [],
              technicianNames: values.technicianNames ?? [],
              serviceAddress: values.serviceAddress ?? { street: '', city: '', state: '', postalCode: '', country: 'USA' },
              summary: values.summary ?? '',
              scheduledStart: values.scheduledStart ?? new Date().toISOString(),
              scheduledEnd: values.scheduledEnd ?? new Date(Date.now() + 7200000).toISOString(),
              status: values.status ?? 'draft',
              items: values.items ?? [],
              photos: values.photos ?? [],
              checklists: values.checklists ?? [],
              notes: values.notes,
              total: values.total ?? 0,
              isDemo: true,
            });
            showToast({ title: 'Job created', description: 'Work order added to schedule.', type: 'success' });
            setOpen(false);
            const response = await jobsService.listJobs({ query: search, pageSize: 50 });
            setJobs(response.data);
            setCustomers(getTable('customers'));
            setTechnicians(getTable('technicians'));
          }}
        />
      </Modal>
    </div>
  );
}

