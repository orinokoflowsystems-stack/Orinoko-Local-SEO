import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingIndicator } from '@/components/ui/Spinner';
import { jobsService } from '@/services/jobs';
import type { Job, JobStatus } from '@/types';
import { DetailCard, KeyValueList } from './shared';

export function JobDetailPage() {
  const { jobId = '' } = useParams();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    jobsService.getById(jobId).then(setJob).catch(() => setJob(null));
  }, [jobId]);

  if (!job) return <LoadingIndicator label="Loading job..." />;

  const updateStatus = async (status: JobStatus) => setJob(await jobsService.updateStatus(job.id, status));

  return (
    <div className="space-y-6">
      <PageHeader title={job.jobNumber} description={job.summary} breadcrumbs={[{ label: 'Jobs', to: '/jobs' }, { label: job.jobNumber }]} actions={<Badge variant={job.status === 'completed' ? 'success' : job.status === 'in_progress' ? 'warning' : 'info'}>{job.status}</Badge>} />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <DetailCard title="Job details">
          <KeyValueList items={[
            { label: 'Customer', value: job.customerName },
            { label: 'Technicians', value: job.technicianNames.join(', ') || 'Unassigned' },
            { label: 'Start', value: new Date(job.scheduledStart).toLocaleString() },
            { label: 'End', value: new Date(job.scheduledEnd).toLocaleString() },
            { label: 'Total', value: `$${job.total.toFixed(2)}` },
            { label: 'Status', value: job.status },
          ]} />
          {job.notes ? <Alert className="mt-4">{job.notes}</Alert> : null}
        </DetailCard>
        <DetailCard title="Job actions">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void updateStatus('scheduled')}>Schedule</Button>
            <Button variant="secondary" onClick={() => void updateStatus('in_progress')}>Start job</Button>
            <Button variant="secondary" onClick={() => void updateStatus('completed')}>Complete</Button>
          </div>
        </DetailCard>
      </div>
      <DetailCard title="Checklist">
        <div className="space-y-4">{job.checklists.map((checklist) => <div key={checklist.id}><p className="font-medium text-slate-950 dark:text-white">{checklist.title}</p><ul className="mt-2 space-y-2 text-sm text-slate-500 dark:text-slate-400">{checklist.items.map((item) => <li key={item.id}>• {item.label} {item.completed ? '✓' : ''}</li>)}</ul></div>)}</div>
      </DetailCard>
      <DetailCard title="Photos">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{job.photos.length ? job.photos.map((photo) => <div key={photo.id} className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800"><img src={photo.url} alt={photo.caption} className="h-48 w-full object-cover" /><div className="p-3 text-sm text-slate-500 dark:text-slate-400">{photo.caption}</div></div>) : <Alert type="info">No job photos uploaded yet.</Alert>}</div>
      </DetailCard>
    </div>
  );
}

