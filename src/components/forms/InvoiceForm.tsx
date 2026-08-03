import type { FormEvent } from 'react';
import type { Customer, Invoice, InvoiceStatus } from '@/types';
import { useForm } from '@/hooks/useForm';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormActions, FormSection } from './shared';

export function InvoiceForm({ customers, initialValues, onCancel, onSubmit }: { customers: Customer[]; initialValues: Partial<Invoice>; onSubmit: (values: Partial<Invoice>) => Promise<void> | void; onCancel?: () => void; }) {
  const form = useForm<Partial<Invoice>>({
    initialValues: { invoiceNumber: '', customerId: customers[0]?.id ?? '', customerName: customers[0] ? `${customers[0].firstName} ${customers[0].lastName}` : '', dueDate: new Date().toISOString(), issuedAt: new Date().toISOString(), status: 'draft', subtotal: 0, tax: 0, total: 0, balanceDue: 0, payments: [], notes: '', items: [], ...initialValues },
    validator: (values) => ({ invoiceNumber: values.invoiceNumber ? '' : 'Invoice number is required.' }),
    onSubmit,
  });
  const submit = async (event: FormEvent) => { event.preventDefault(); await form.handleSubmit(); };
  return (
    <form className="space-y-4" onSubmit={submit}>
      <FormSection title="Invoice details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Invoice number" error={form.errors.invoiceNumber}><Input value={String(form.values.invoiceNumber ?? '')} onChange={(event) => form.handleChange('invoiceNumber', event.target.value)} /></FormField>
          <FormField label="Status"><Select value={String(form.values.status ?? 'draft')} onChange={(event) => form.handleChange('status', event.target.value as InvoiceStatus)}>{['draft','issued','paid','partial','overdue','void'].map((status) => <option key={status} value={status}>{status}</option>)}</Select></FormField>
          <FormField label="Customer"><Select value={String(form.values.customerId ?? '')} onChange={(event) => {
            const customer = customers.find((entry) => entry.id === event.target.value);
            form.handleChange('customerId', event.target.value);
            form.handleChange('customerName', customer ? `${customer.firstName} ${customer.lastName}` : '');
          }}>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.firstName} {customer.lastName}</option>)}</Select></FormField>
          <FormField label="Due date"><Input type="date" value={String(form.values.dueDate ?? '').slice(0, 10)} onChange={(event) => form.handleChange('dueDate', new Date(event.target.value).toISOString())} /></FormField>
          <FormField label="Subtotal"><Input type="number" value={Number(form.values.subtotal ?? 0)} onChange={(event) => form.handleChange('subtotal', Number(event.target.value))} /></FormField>
          <FormField label="Tax"><Input type="number" value={Number(form.values.tax ?? 0)} onChange={(event) => form.handleChange('tax', Number(event.target.value))} /></FormField>
        </div>
        <FormField label="Notes"><Textarea value={String(form.values.notes ?? '')} onChange={(event) => form.handleChange('notes', event.target.value)} /></FormField>
      </FormSection>
      <FormActions submitting={form.isSubmitting} onCancel={onCancel} />
    </form>
  );
}

