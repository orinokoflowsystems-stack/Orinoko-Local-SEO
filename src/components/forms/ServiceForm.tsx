import type { FormEvent } from 'react';
import type { Service, ServiceCategory } from '@/types';
import { useForm } from '@/hooks/useForm';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormActions, FormSection } from './shared';

export function ServiceForm({ categories, initialValues, onCancel, onSubmit }: { categories: ServiceCategory[]; initialValues: Partial<Service>; onSubmit: (values: Partial<Service>) => Promise<void> | void; onCancel?: () => void; }) {
  const form = useForm<Partial<Service>>({
    initialValues: { name: '', description: '', categoryId: categories[0]?.id ?? '', categoryName: categories[0]?.name ?? '', basePrice: 0, estimatedDurationMinutes: 60, isActive: true, ...initialValues },
    validator: (values) => ({ name: values.name ? '' : 'Service name is required.' }),
    onSubmit,
  });
  const submit = async (event: FormEvent) => { event.preventDefault(); await form.handleSubmit(); };
  return (
    <form className="space-y-4" onSubmit={submit}>
      <FormSection title="Service catalog entry">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Service name" error={form.errors.name}><Input value={String(form.values.name ?? '')} onChange={(event) => form.handleChange('name', event.target.value)} /></FormField>
          <FormField label="Category"><Select value={String(form.values.categoryId ?? '')} onChange={(event) => {
            const category = categories.find((entry) => entry.id === event.target.value);
            form.handleChange('categoryId', event.target.value);
            form.handleChange('categoryName', category?.name ?? '');
          }}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></FormField>
          <FormField label="Base price"><Input type="number" value={Number(form.values.basePrice ?? 0)} onChange={(event) => form.handleChange('basePrice', Number(event.target.value))} /></FormField>
          <FormField label="Estimated minutes"><Input type="number" value={Number(form.values.estimatedDurationMinutes ?? 60)} onChange={(event) => form.handleChange('estimatedDurationMinutes', Number(event.target.value))} /></FormField>
        </div>
        <FormField label="Description"><Textarea value={String(form.values.description ?? '')} onChange={(event) => form.handleChange('description', event.target.value)} /></FormField>
      </FormSection>
      <FormActions submitting={form.isSubmitting} onCancel={onCancel} />
    </form>
  );
}

