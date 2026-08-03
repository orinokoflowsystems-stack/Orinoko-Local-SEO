import type { FormEvent } from 'react';
import type { Appointment, Customer, Service, Technician } from '@/types';
import { useForm } from '@/hooks/useForm';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormActions, FormSection } from './shared';

export function AppointmentForm({ customers, services, technicians, initialValues, onCancel, onSubmit }: { customers: Customer[]; services: Service[]; technicians: Technician[]; initialValues: Partial<Appointment>; onSubmit: (values: Partial<Appointment>) => Promise<void> | void; onCancel?: () => void; }) {
  const form = useForm<Partial<Appointment>>({
    initialValues: { customerId: customers[0]?.id ?? '', customerName: customers[0] ? `${customers[0].firstName} ${customers[0].lastName}` : '', technicianId: technicians[0]?.id ?? '', technicianName: technicians[0] ? `${technicians[0].firstName} ${technicians[0].lastName}` : '', serviceId: services[0]?.id ?? '', serviceName: services[0]?.name ?? '', scheduledStart: new Date().toISOString(), scheduledEnd: new Date(Date.now() + 7200000).toISOString(), status: 'scheduled', notes: '', ...initialValues },
    validator: (values) => ({ customerId: values.customerId ? '' : 'Customer is required.' }),
    onSubmit,
  });
  const submit = async (event: FormEvent) => { event.preventDefault(); await form.handleSubmit(); };
  return (
    <form className="space-y-4" onSubmit={submit}>
      <FormSection title="Appointment scheduling">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Customer"><Select value={String(form.values.customerId ?? '')} onChange={(event) => {
            const customer = customers.find((entry) => entry.id === event.target.value);
            form.handleChange('customerId', event.target.value);
            form.handleChange('customerName', customer ? `${customer.firstName} ${customer.lastName}` : '');
          }}>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.firstName} {customer.lastName}</option>)}</Select></FormField>
          <FormField label="Technician"><Select value={String(form.values.technicianId ?? '')} onChange={(event) => {
            const technician = technicians.find((entry) => entry.id === event.target.value);
            form.handleChange('technicianId', event.target.value);
            form.handleChange('technicianName', technician ? `${technician.firstName} ${technician.lastName}` : '');
          }}>{technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.firstName} {technician.lastName}</option>)}</Select></FormField>
          <FormField label="Service"><Select value={String(form.values.serviceId ?? '')} onChange={(event) => {
            const service = services.find((entry) => entry.id === event.target.value);
            form.handleChange('serviceId', event.target.value);
            form.handleChange('serviceName', service?.name ?? '');
          }}>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</Select></FormField>
          <FormField label="Status"><Select value={String(form.values.status ?? 'scheduled')} onChange={(event) => form.handleChange('status', event.target.value as Appointment['status'])}>{['scheduled','confirmed','in_progress','completed','canceled'].map((status) => <option key={status} value={status}>{status}</option>)}</Select></FormField>
          <FormField label="Start"><Input type="datetime-local" value={String(form.values.scheduledStart ?? '').slice(0, 16)} onChange={(event) => form.handleChange('scheduledStart', new Date(event.target.value).toISOString())} /></FormField>
          <FormField label="End"><Input type="datetime-local" value={String(form.values.scheduledEnd ?? '').slice(0, 16)} onChange={(event) => form.handleChange('scheduledEnd', new Date(event.target.value).toISOString())} /></FormField>
        </div>
        <FormField label="Notes"><Textarea value={String(form.values.notes ?? '')} onChange={(event) => form.handleChange('notes', event.target.value)} /></FormField>
      </FormSection>
      <FormActions submitting={form.isSubmitting} onCancel={onCancel} />
    </form>
  );
}

