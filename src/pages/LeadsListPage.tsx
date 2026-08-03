import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/layout/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { LeadForm } from '@/components/forms/LeadForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { leadsService } from '@/services/leads';
import { getTable } from '@/services/storage';
import { useToastContext } from '@/context/ToastContext';
import type { Lead, PipelineStage } from '@/types';

export function LeadsListPage() {
  const { showToast } = useToastContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('kanban');
  const [open, setOpen] = useState(false);

  const load = async () => {
    const response = await leadsService.listLeads({ query: search, pageSize: 50 });
    setLeads(response.data);
    setStages(getTable('pipelineStages'));
  };

  useEffect(() => { void load(); }, [search]);

  const grouped = useMemo(() => stages.map((stage) => ({ stage, leads: leads.filter((lead) => lead.pipelineStageId === stage.id) })), [leads, stages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead management"
        description="Manage full lead intake, qualification, and conversion from a kanban pipeline or list view."
        actions={<Button onClick={() => setOpen(true)}>New lead</Button>}
      />
      <div className="flex justify-between gap-3">
        <Tabs tabs={[{ id: 'kanban', label: 'Kanban' }, { id: 'list', label: 'List' }]} value={view} onChange={setView} />
      </div>
      {view === 'list' ? (
        <DataTable
          title="Lead list"
          search={search}
          onSearchChange={setSearch}
          data={leads}
          rowKey={(lead) => lead.id}
          columns={[
            { id: 'name', header: 'Lead', accessor: 'firstName', sortable: true, cell: (lead) => <Link className="font-medium text-brand-700 dark:text-brand-300" to={`/leads/${lead.id}`}>{lead.firstName} {lead.lastName}</Link> },
            { id: 'serviceRequested', header: 'Service', accessor: 'serviceRequested', sortable: true },
            { id: 'sourceName', header: 'Source', accessor: 'sourceName', sortable: true },
            { id: 'status', header: 'Status', accessor: 'status', sortable: true, cell: (lead) => <Badge variant={lead.status === 'lost' ? 'danger' : 'info'}>{lead.status}</Badge> },
            { id: 'priority', header: 'Priority', accessor: 'priority', sortable: true },
          ]}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-4">
          {grouped.map(({ stage, leads: stageLeads }) => (
            <Card key={stage.id} className="min-h-[320px]">
              <CardHeader>
                <div>
                  <CardTitle className="text-base">{stage.name}</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stageLeads.length} lead(s)</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {stageLeads.length ? stageLeads.map((lead) => (
                  <Link key={lead.id} to={`/leads/${lead.id}`} className="block rounded-2xl border border-slate-100 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-400">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950 dark:text-white">{lead.firstName} {lead.lastName}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lead.serviceRequested}</p>
                      </div>
                      <Badge variant={lead.priority === 'urgent' ? 'danger' : lead.priority === 'high' ? 'warning' : 'default'}>{lead.priority}</Badge>
                    </div>
                  </Link>
                )) : <EmptyState title="No leads" description="Move or create leads to populate this stage." />}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create lead"
        footer={null}
      >
        <LeadForm
          stages={stages}
          initialValues={{}}
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            const firstStage = stages[0];
            await leadsService.create({
              organizationId: 'org-handy-glass',
              firstName: values.firstName ?? '',
              lastName: values.lastName ?? '',
              email: values.email,
              phone: values.phone,
              address: values.address ?? { street: '', city: '', state: '', postalCode: '', country: 'USA' },
              sourceId: values.sourceId ?? 'source-1',
              sourceName: values.sourceName ?? 'Website Form',
              pipelineStageId: values.pipelineStageId ?? firstStage?.id ?? '',
              pipelineStageName: values.pipelineStageName ?? firstStage?.name ?? '',
              status: values.status ?? 'new',
              priority: values.priority ?? 'normal',
              serviceRequested: values.serviceRequested ?? '',
              notes: values.notes,
              tags: values.tags ?? [],
              isDemo: true,
            });
            showToast({ title: 'Lead created', description: 'The new lead was added to the pipeline.', type: 'success' });
            setOpen(false);
            await load();
          }}
        />
      </Modal>
    </div>
  );
}

