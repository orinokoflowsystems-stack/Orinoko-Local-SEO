import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingIndicator } from '@/components/ui/Spinner';
import { estimatesService } from '@/services/estimates';
import type { Estimate, EstimateStatus } from '@/types';
import { DetailCard, KeyValueList } from './shared';

export function EstimateDetailPage() {
  const { estimateId = '' } = useParams();
  const [estimate, setEstimate] = useState<Estimate | null>(null);

  useEffect(() => {
    estimatesService.getById(estimateId).then(setEstimate).catch(() => setEstimate(null));
  }, [estimateId]);

  if (!estimate) return <LoadingIndicator label="Loading estimate..." />;

  const updateStatus = async (status: EstimateStatus) => setEstimate(await estimatesService.updateStatus(estimate.id, status));

  return (
    <div className="space-y-6">
      <PageHeader title={estimate.estimateNumber} description={estimate.customerName} breadcrumbs={[{ label: 'Estimates', to: '/estimates' }, { label: estimate.estimateNumber }]} actions={<Badge variant={estimate.status === 'approved' ? 'success' : estimate.status === 'declined' ? 'danger' : 'info'}>{estimate.status}</Badge>} />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <DetailCard title="Estimate summary">
          <KeyValueList items={[
            { label: 'Customer', value: estimate.customerName },
            { label: 'Valid until', value: new Date(estimate.validUntil).toLocaleDateString() },
            { label: 'Subtotal', value: `$${estimate.subtotal.toFixed(2)}` },
            { label: 'Tax', value: `$${estimate.tax.toFixed(2)}` },
            { label: 'Total', value: `$${estimate.total.toFixed(2)}` },
            { label: 'Status', value: estimate.status },
          ]} />
          <Alert className="mt-4">{estimate.scopeOfWork}</Alert>
        </DetailCard>
        <DetailCard title="Actions" action={<Button variant="secondary" onClick={async () => { await estimatesService.generatePdf(estimate.id); }}>Generate PDF</Button>}>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void updateStatus('sent')}>Mark sent</Button>
            <Button variant="secondary" onClick={() => void updateStatus('approved')}>Approve</Button>
            <Button variant="danger" onClick={() => void updateStatus('declined')}>Decline</Button>
          </div>
        </DetailCard>
      </div>
      <DetailCard title="Line items">
        <div className="space-y-3">{estimate.items.map((item) => <div key={item.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><p className="font-medium text-slate-950 dark:text-white">{item.description}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}</p></div>)}</div>
      </DetailCard>
    </div>
  );
}

