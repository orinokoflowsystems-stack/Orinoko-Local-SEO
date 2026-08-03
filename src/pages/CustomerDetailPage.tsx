import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingIndicator } from '@/components/ui/Spinner';
import { customersService } from '@/services/customers';
import { getTable } from '@/services/storage';
import type { Customer, Job } from '@/types';
import { DetailCard, KeyValueList } from './shared';

export function CustomerDetailPage() {
  const { customerId = '' } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    customersService.getById(customerId).then(setCustomer).catch(() => setCustomer(null));
    setJobs(getTable('jobs').filter((job) => job.customerId === customerId));
  }, [customerId]);

  if (!customer) {
    return <LoadingIndicator label="Loading customer details..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`${customer.firstName} ${customer.lastName}`} description={customer.companyName ?? customer.email ?? 'Customer detail'} breadcrumbs={[{ label: 'Customers', to: '/customers' }, { label: `${customer.firstName} ${customer.lastName}` }]} />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <DetailCard title="Customer profile">
          <KeyValueList items={[
            { label: 'Email', value: customer.email ?? '—' },
            { label: 'Phone', value: customer.phone ?? '—' },
            { label: 'Type', value: customer.type },
            { label: 'Preferred contact', value: customer.preferredContact },
            { label: 'Lifetime value', value: `$${customer.totalSpent.toFixed(2)}` },
            { label: 'Completed jobs', value: customer.jobsCompleted },
          ]} />
        </DetailCard>
        <DetailCard title="Notes">
          <p className="text-sm text-slate-500 dark:text-slate-400">{customer.notes ?? 'No customer notes recorded yet.'}</p>
        </DetailCard>
      </div>
      <DetailCard title="Job history">
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
              <p className="font-medium text-slate-950 dark:text-white">{job.jobNumber} • {job.summary}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{job.status} • {job.technicianNames.join(', ')}</p>
            </div>
          ))}
        </div>
      </DetailCard>
    </div>
  );
}

