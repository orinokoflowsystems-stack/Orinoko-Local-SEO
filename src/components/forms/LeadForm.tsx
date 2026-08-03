import type { FormEvent } from 'react';
import type { Lead, LeadPriority, LeadStatus, PipelineStage } from '@/types';
import { useForm } from '@/hooks/useForm';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormActions, FormSection } from './shared';

interface LeadFormProps {
  initialValues: Partial<Lead>;
  stages: PipelineStage[];
  onSubmit: (values: Partial<Lead>) => Promise<void> | void;
  onCancel?: () => void;
}

export function LeadForm({ initialValues, onCancel, onSubmit, stages }: LeadFormProps) {
  const form = useForm<Partial<Lead>>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      sourceName: 'Website Form',
      pipelineStageName: stages[0]?.name ?? 'New Lead',
      pipelineStageId: stages[0]?.id ?? '',
      status: 'new',
      priority: 'normal',
      serviceRequested: '',
      notes: '',
      ...initialValues,
    },
    validator: (values) => ({
      firstName: values.firstName ? '' : 'First name is required.',
      serviceRequested: values.serviceRequested ? '' : 'Service requested is required.',
    }),
    onSubmit,
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await form.handleSubmit();
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <FormSection title="Lead details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="First name" error={form.errors.firstName}><Input value={String(form.values.firstName ?? '')} onChange={(event) => form.handleChange('firstName', event.target.value)} /></FormField>
          <FormField label="Last name"><Input value={String(form.values.lastName ?? '')} onChange={(event) => form.handleChange('lastName', event.target.value)} /></FormField>
          <FormField label="Email"><Input type="email" value={String(form.values.email ?? '')} onChange={(event) => form.handleChange('email', event.target.value)} /></FormField>
          <FormField label="Phone"><Input value={String(form.values.phone ?? '')} onChange={(event) => form.handleChange('phone', event.target.value)} /></FormField>
          <FormField label="Priority"><Select value={String(form.values.priority ?? 'normal')} onChange={(event) => form.handleChange('priority', event.target.value as LeadPriority)}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></Select></FormField>
          <FormField label="Status"><Select value={String(form.values.status ?? 'new')} onChange={(event) => form.handleChange('status', event.target.value as LeadStatus)}>{['new','contacted','appointment_scheduled','estimate_sent','estimate_approved','job_scheduled','in_progress','completed','payment_pending','closed','lost'].map((status) => <option key={status} value={status}>{status}</option>)}</Select></FormField>
          <FormField label="Pipeline stage"><Select value={String(form.values.pipelineStageId ?? '')} onChange={(event) => {
            const stage = stages.find((entry) => entry.id === event.target.value);
            form.handleChange('pipelineStageId', event.target.value);
            form.handleChange('pipelineStageName', stage?.name ?? '');
          }}>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</Select></FormField>
          <FormField label="Requested service" error={form.errors.serviceRequested}><Input value={String(form.values.serviceRequested ?? '')} onChange={(event) => form.handleChange('serviceRequested', event.target.value)} /></FormField>
        </div>
        <FormField label="Notes"><Textarea value={String(form.values.notes ?? '')} onChange={(event) => form.handleChange('notes', event.target.value)} /></FormField>
      </FormSection>
      <FormActions submitting={form.isSubmitting} onCancel={onCancel} />
    </form>
  );
}

