import type { FormEvent } from 'react';
import type { Customer, Estimate, EstimateStatus } from '@/types';
import { useForm } from '@/hooks/useForm';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormActions, FormSection } from './shared';

export function EstimateForm({ customers, initialValues, onCancel, onSubmit }: { customers: Customer[]; initialValues: Partial<Estimate>; onSubmit: (values: Partial<Estimate>) => Promise<void> | void; onCancel?: () => void; }) {
  const form = useForm<Partial<Estimate>>({
    initialValues: { estimateNumber: '', customerId: customers[0]?.id ?? '', customerName: customers[0] ? `${customers[0].firstName} ${customers[0].lastName}` : '', status: 'draft', scopeOfWork: '', subtotal: 0, tax: 0, total: 0, validUntil: new Date().toISOString(), items: [], ...initialValues },
    validator: (values) => ({ estimateNumber: values.estimateNumber ? '' : 'Estimate number is required.', scopeOfWork: values.scopeOfWork ? '' : 'Scope of work is required.' }),
    onSubmit,
  });
  const submit = async (event: FormEvent) => { event.preventDefault(); await form.handleSubmit(); };
  return (
    <form className="space-y-4" onSubmit={submit}>
      <FormSection title="Estimate details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Estimate number" error={form.errors.estimateNumber}><Input value={String(form.values.estimateNumber ?? '')} onChange={(event) => form.handleChange('estimateNumber', event.target.value)} /></FormField>
          <FormField label="Status"><Select value={String(form.values.status ?? 'draft')} onChange={(event) => form.handleChange('status', event.target.value as EstimateStatus)}>{['draft','sent','approved','declined','expired'].map((status) => <option key={status} value={status}>{status}</option>)}</Select></FormField>
          <FormField label="Customer"><Select value={String(form.values.customerId ?? '')} onChange={(event) => {
            const customer = customers.find((entry) => entry.id === event.target.value);
            form.handleChange('customerId', event.target.value);
            form.handleChange('customerName', customer ? `${customer.firstName} ${customer.lastName}` : '');
          }}>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.firstName} {customer.lastName}</option>)}</Select></FormField>
          <FormField label="Valid until"><Input type="date" value={String(form.values.validUntil ?? '').slice(0, 10)} onChange={(event) => form.handleChange('validUntil', new Date(event.target.value).toISOString())} /></FormField>
          <FormField label="Subtotal"><Input type="number" value={Number(form.values.subtotal ?? 0)} onChange={(event) => form.handleChange('subtotal', Number(event.target.value))} /></FormField>
          <FormField label="Tax"><Input type="number" value={Number(form.values.tax ?? 0)} onChange={(event) => form.handleChange('tax', Number(event.target.value))} /></FormField>
        </div>
        <FormField label="Scope of work" error={form.errors.scopeOfWork}><Textarea value={String(form.values.scopeOfWork ?? '')} onChange={(event) => form.handleChange('scopeOfWork', event.target.value)} /></FormField>
      </FormSection>
      <FormActions submitting={form.isSubmitting} onCancel={onCancel} />
    </form>
  );
}

