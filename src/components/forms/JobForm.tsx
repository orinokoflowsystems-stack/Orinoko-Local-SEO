import type { FormEvent } from 'react';
import type { Customer, Job, JobStatus, Technician } from '@/types';
import { useForm } from '@/hooks/useForm';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormActions, FormSection } from './shared';

export function JobForm({ customers, technicians, initialValues, onCancel, onSubmit }: { customers: Customer[]; technicians: Technician[]; initialValues: Partial<Job>; onSubmit: (values: Partial<Job>) => Promise<void> | void; onCancel?: () => void; }) {
  const form = useForm<Partial<Job>>({
    initialValues: { jobNumber: '', customerId: customers[0]?.id ?? '', customerName: customers[0] ? `${customers[0].firstName} ${customers[0].lastName}` : '', technicianIds: [], technicianNames: [], scheduledStart: new Date().toISOString(), scheduledEnd: new Date(Date.now() + 7200000).toISOString(), summary: '', status: 'draft', total: 0, ...initialValues },
    validator: (values) => ({ jobNumber: values.jobNumber ? '' : 'Job number is required.', summary: values.summary ? '' : 'Summary is required.' }),
    onSubmit,
  });
  const submit = async (event: FormEvent) => { event.preventDefault(); await form.handleSubmit(); };
  return (
    <form className="space-y-4" onSubmit={submit}>
      <FormSection title="Job details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Job number" error={form.errors.jobNumber}><Input value={String(form.values.jobNumber ?? '')} onChange={(event) => form.handleChange('jobNumber', event.target.value)} /></FormField>
          <FormField label="Status"><Select value={String(form.values.status ?? 'draft')} onChange={(event) => form.handleChange('status', event.target.value as JobStatus)}>{['draft','scheduled','in_progress','on_hold','completed','canceled'].map((status) => <option key={status} value={status}>{status}</option>)}</Select></FormField>
          <FormField label="Customer"><Select value={String(form.values.customerId ?? '')} onChange={(event) => {
            const customer = customers.find((entry) => entry.id === event.target.value);
            form.handleChange('customerId', event.target.value);
            form.handleChange('customerName', customer ? `${customer.firstName} ${customer.lastName}` : '');
          }}>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.firstName} {customer.lastName}</option>)}</Select></FormField>
          <FormField label="Technician"><Select value={String(form.values.technicianIds?.[0] ?? '')} onChange={(event) => {
            const technician = technicians.find((entry) => entry.id === event.target.value);
            form.handleChange('technicianIds', event.target.value ? [event.target.value] : []);
            form.handleChange('technicianNames', technician ? [`${technician.firstName} ${technician.lastName}`] : []);
          }}><option value="">Unassigned</option>{technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.firstName} {technician.lastName}</option>)}</Select></FormField>
          <FormField label="Start"><Input type="datetime-local" value={String(form.values.scheduledStart ?? '').slice(0, 16)} onChange={(event) => form.handleChange('scheduledStart', new Date(event.target.value).toISOString())} /></FormField>
          <FormField label="End"><Input type="datetime-local" value={String(form.values.scheduledEnd ?? '').slice(0, 16)} onChange={(event) => form.handleChange('scheduledEnd', new Date(event.target.value).toISOString())} /></FormField>
          <FormField label="Total"><Input type="number" value={Number(form.values.total ?? 0)} onChange={(event) => form.handleChange('total', Number(event.target.value))} /></FormField>
        </div>
        <FormField label="Summary" error={form.errors.summary}><Textarea value={String(form.values.summary ?? '')} onChange={(event) => form.handleChange('summary', event.target.value)} /></FormField>
      </FormSection>
      <FormActions submitting={form.isSubmitting} onCancel={onCancel} />
    </form>
  );
}

