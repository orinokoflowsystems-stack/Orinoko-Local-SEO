import type { FormEvent } from 'react';
import type { Technician, TechnicianStatus } from '@/types';
import { useForm } from '@/hooks/useForm';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormActions, FormSection } from './shared';

export function TechnicianForm({ initialValues, onCancel, onSubmit }: { initialValues: Partial<Technician>; onSubmit: (values: Partial<Technician>) => Promise<void> | void; onCancel?: () => void; }) {
  const form = useForm<Partial<Technician>>({
    initialValues: { firstName: '', lastName: '', email: '', specialties: [], certifications: [], territory: '', hourlyRate: 0, workloadPercent: 0, averageRating: 0, totalJobs: 0, status: 'available', isAvailable: true, isActive: true, ...initialValues },
    validator: (values) => ({ firstName: values.firstName ? '' : 'First name is required.', email: values.email ? '' : 'Email is required.' }),
    onSubmit,
  });
  const submit = async (event: FormEvent) => { event.preventDefault(); await form.handleSubmit(); };
  return (
    <form className="space-y-4" onSubmit={submit}>
      <FormSection title="Technician profile">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="First name" error={form.errors.firstName}><Input value={String(form.values.firstName ?? '')} onChange={(event) => form.handleChange('firstName', event.target.value)} /></FormField>
          <FormField label="Last name"><Input value={String(form.values.lastName ?? '')} onChange={(event) => form.handleChange('lastName', event.target.value)} /></FormField>
          <FormField label="Email" error={form.errors.email}><Input type="email" value={String(form.values.email ?? '')} onChange={(event) => form.handleChange('email', event.target.value)} /></FormField>
          <FormField label="Territory"><Input value={String(form.values.territory ?? '')} onChange={(event) => form.handleChange('territory', event.target.value)} /></FormField>
          <FormField label="Hourly rate"><Input type="number" value={Number(form.values.hourlyRate ?? 0)} onChange={(event) => form.handleChange('hourlyRate', Number(event.target.value))} /></FormField>
          <FormField label="Status"><Select value={String(form.values.status ?? 'available')} onChange={(event) => form.handleChange('status', event.target.value as TechnicianStatus)}>{['available','scheduled','on_job','off_duty'].map((status) => <option key={status} value={status}>{status}</option>)}</Select></FormField>
        </div>
        <FormField label="Specialties (comma separated)"><Textarea value={String((form.values.specialties ?? []).join(', '))} onChange={(event) => form.handleChange('specialties', event.target.value.split(',').map((entry) => entry.trim()).filter(Boolean))} /></FormField>
      </FormSection>
      <FormActions submitting={form.isSubmitting} onCancel={onCancel} />
    </form>
  );
}

