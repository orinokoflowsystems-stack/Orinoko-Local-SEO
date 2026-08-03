import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { LoadingIndicator } from '@/components/ui/Spinner';
import { techniciansService } from '@/services/technicians';
import { getTable } from '@/services/storage';
import type { Job, Review, Technician } from '@/types';
import { DetailCard, KeyValueList } from './shared';

export function TechnicianDetailPage() {
  const { technicianId = '' } = useParams();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    techniciansService.getById(technicianId).then(setTechnician).catch(() => setTechnician(null));
    setJobs(getTable('jobs').filter((job) => job.technicianIds.includes(technicianId)));
    setReviews(getTable('reviews').filter((review) => review.technicianId === technicianId));
  }, [technicianId]);

  if (!technician) {
    return <LoadingIndicator label="Loading technician profile..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`${technician.firstName} ${technician.lastName}`} description={technician.territory ?? technician.email} breadcrumbs={[{ label: 'Technicians', to: '/technicians' }, { label: `${technician.firstName} ${technician.lastName}` }]} actions={<Badge variant={technician.status === 'available' ? 'success' : 'warning'}>{technician.status}</Badge>} />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <DetailCard title="Technician profile">
          <KeyValueList items={[
            { label: 'Email', value: technician.email },
            { label: 'Phone', value: technician.phone ?? '—' },
            { label: 'Hourly rate', value: `$${technician.hourlyRate}/hr` },
            { label: 'Average rating', value: technician.averageRating },
            { label: 'Total jobs', value: technician.totalJobs },
            { label: 'Territory', value: technician.territory ?? '—' },
          ]} />
        </DetailCard>
        <DetailCard title="Skills & certifications">
          <p className="font-medium text-slate-950 dark:text-white">Specialties</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{technician.specialties.join(', ')}</p>
          <p className="mt-4 font-medium text-slate-950 dark:text-white">Certifications</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{technician.certifications.join(', ') || 'No certifications listed'}</p>
        </DetailCard>
      </div>
      <DetailCard title="Assigned jobs">
        <div className="space-y-3">{jobs.map((job) => <div key={job.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><p className="font-medium text-slate-950 dark:text-white">{job.jobNumber}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{job.summary} • {job.status}</p></div>)}</div>
      </DetailCard>
      <DetailCard title="Customer reviews">
        <div className="space-y-3">{reviews.map((review) => <div key={review.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><p className="font-medium text-slate-950 dark:text-white">{review.title}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{'★'.repeat(review.rating)} • {review.body}</p></div>)}</div>
      </DetailCard>
    </div>
  );
}

