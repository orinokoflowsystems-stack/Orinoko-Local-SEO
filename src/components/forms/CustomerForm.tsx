import type { FormEvent } from 'react';
import type { Customer, CustomerType } from '@/types';
import { useForm } from '@/hooks/useForm';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormActions, FormSection } from './shared';

export function CustomerForm({ initialValues, onCancel, onSubmit }: { initialValues: Partial<Customer>; onSubmit: (values: Partial<Customer>) => Promise<void> | void; onCancel?: () => void; }) {
  const form = useForm<Partial<Customer>>({
    initialValues: { firstName: '', lastName: '', email: '', phone: '', type: 'residential', preferredContact: 'phone', notes: '', tags: [], ...initialValues },
    validator: (values) => ({ firstName: values.firstName ? '' : 'First name is required.' }),
    onSubmit,
  });
  const submit = async (event: FormEvent) => { event.preventDefault(); await form.handleSubmit(); };
  return (
    <form className="space-y-4" onSubmit={submit}>
      <FormSection title="Customer details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="First name" error={form.errors.firstName}><Input value={String(form.values.firstName ?? '')} onChange={(event) => form.handleChange('firstName', event.target.value)} /></FormField>
          <FormField label="Last name"><Input value={String(form.values.lastName ?? '')} onChange={(event) => form.handleChange('lastName', event.target.value)} /></FormField>
          <FormField label="Email"><Input type="email" value={String(form.values.email ?? '')} onChange={(event) => form.handleChange('email', event.target.value)} /></FormField>
          <FormField label="Phone"><Input value={String(form.values.phone ?? '')} onChange={(event) => form.handleChange('phone', event.target.value)} /></FormField>
          <FormField label="Customer type"><Select value={String(form.values.type ?? 'residential')} onChange={(event) => form.handleChange('type', event.target.value as CustomerType)}><option value="residential">Residential</option><option value="commercial">Commercial</option></Select></FormField>
          <FormField label="Preferred contact"><Select value={String(form.values.preferredContact ?? 'phone')} onChange={(event) => form.handleChange('preferredContact', event.target.value as Customer['preferredContact'])}><option value="phone">Phone</option><option value="email">Email</option><option value="sms">SMS</option></Select></FormField>
        </div>
        <FormField label="Notes"><Textarea value={String(form.values.notes ?? '')} onChange={(event) => form.handleChange('notes', event.target.value)} /></FormField>
      </FormSection>
      <FormActions submitting={form.isSubmitting} onCancel={onCancel} />
    </form>
  );
}

