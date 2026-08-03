import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { LoadingIndicator } from '@/components/ui/Spinner';
import { leadsService } from '@/services/leads';
import { getTable } from '@/services/storage';
import { useToastContext } from '@/context/ToastContext';
import type { ActivityLog, Lead, LeadStatus } from '@/types';
import { DetailCard, KeyValueList } from './shared';

export function LeadDetailPage() {
  const { leadId = '' } = useParams();
  const { showToast } = useToastContext();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    leadsService.getById(leadId).then(setLead).catch(() => setLead(null));
    setActivities(getTable('activityLogs').filter((item) => item.entityId === leadId));
  }, [leadId]);

  if (!lead) {
    return <LoadingIndicator label="Loading lead details..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${lead.firstName} ${lead.lastName}`}
        description={lead.serviceRequested}
        breadcrumbs={[{ label: 'Leads', to: '/leads' }, { label: `${lead.firstName} ${lead.lastName}` }]}
        actions={<Badge variant={lead.status === 'lost' ? 'danger' : 'info'}>{lead.status}</Badge>}
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <DetailCard title="Lead overview">
          <KeyValueList
            items={[
              { label: 'Email', value: lead.email ?? '—' },
              { label: 'Phone', value: lead.phone ?? '—' },
              { label: 'Source', value: lead.sourceName },
              { label: 'Priority', value: lead.priority },
              { label: 'Stage', value: lead.pipelineStageName },
              { label: 'Assigned', value: lead.assignedToName ?? 'Unassigned' },
            ]}
          />
          {lead.notes ? <Alert className="mt-4">{lead.notes}</Alert> : null}
        </DetailCard>
        <DetailCard
          title="Pipeline actions"
          action={
            <Button
              variant="secondary"
              onClick={async () => {
                await leadsService.assignLead(lead.id, 'user-dispatch', 'Maya Lopez');
                setLead(await leadsService.getById(lead.id));
                showToast({ title: 'Lead assigned', description: 'The lead is now assigned to dispatch.', type: 'success' });
              }}
            >
              Assign to dispatch
            </Button>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">Advance or recover the lead in the ORINOKO workflow.</p>
            <Select
              value={lead.status}
              onChange={async (event) => {
                const nextStatus = event.target.value as LeadStatus;
                await leadsService.updateStatus(lead.id, nextStatus);
                setLead(await leadsService.getById(lead.id));
                showToast({ title: 'Lead updated', description: `Status changed to ${nextStatus}.`, type: 'success' });
              }}
            >
              {['new','contacted','appointment_scheduled','estimate_sent','estimate_approved','job_scheduled','in_progress','completed','payment_pending','closed','lost'].map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>
          </div>
        </DetailCard>
      </div>
      <DetailCard title="Activity history">
        <div className="space-y-3">
          {activities.length ? activities.map((activity) => (
            <div key={activity.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
              <p className="font-medium text-slate-950 dark:text-white">{activity.description}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activity.actorName}</p>
            </div>
          )) : <Alert type="info">No activity entries are attached to this lead yet.</Alert>}
        </div>
      </DetailCard>
    </div>
  );
}

