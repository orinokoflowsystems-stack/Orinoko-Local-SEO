import { useEffect, useMemo, useState } from 'react';
import { AppointmentForm } from '@/components/forms/AppointmentForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { appointmentsService } from '@/services/appointments';
import { getTable } from '@/services/storage';
import { useToastContext } from '@/context/ToastContext';
import type { Appointment, Customer, Service, Technician } from '@/types';

export function CalendarPage() {
  const { showToast } = useToastContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [view, setView] = useState('week');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      const response = await appointmentsService.listAppointments({ pageSize: 50 });
      setAppointments(response.data);
      setCustomers(getTable('customers'));
      setServices(getTable('services'));
      setTechnicians(getTable('technicians'));
    })();
  }, []);

  const filtered = useMemo(() => {
    if (view === 'day') {
      return appointments.filter((item) => new Date(item.scheduledStart).toDateString() === new Date().toDateString());
    }
    if (view === 'month') {
      const month = new Date().getMonth();
      return appointments.filter((item) => new Date(item.scheduledStart).getMonth() === month);
    }
    return appointments;
  }, [appointments, view]);

  return (
    <div className="space-y-6">
      <PageHeader title="Scheduling calendar" description="Interactive day, week, and month scheduling for technicians and appointments." actions={<Button onClick={() => setOpen(true)}>Schedule appointment</Button>} />
      <Tabs tabs={[{ id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }]} value={view} onChange={setView} />
      {filtered.length ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div>
                  <CardTitle className="text-base">{appointment.customerName}</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{appointment.serviceName}</p>
                </div>
                <Badge variant={appointment.status === 'confirmed' ? 'success' : 'info'}>{appointment.status}</Badge>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(appointment.scheduledStart).toLocaleString()} → {new Date(appointment.scheduledEnd).toLocaleTimeString()}</p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">Assigned to {appointment.technicianName ?? 'Unassigned'}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No appointments" description="Use the scheduler to book technicians and site visits." />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Schedule appointment">
        <AppointmentForm
          customers={customers}
          services={services}
          technicians={technicians}
          initialValues={{}}
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            await appointmentsService.create({
              organizationId: 'org-handy-glass',
              customerId: values.customerId ?? '',
              customerName: values.customerName ?? '',
              technicianId: values.technicianId,
              technicianName: values.technicianName,
              serviceId: values.serviceId,
              serviceName: values.serviceName ?? '',
              scheduledStart: values.scheduledStart ?? new Date().toISOString(),
              scheduledEnd: values.scheduledEnd ?? new Date(Date.now() + 7200000).toISOString(),
              status: values.status ?? 'scheduled',
              notes: values.notes,
              address: values.address ?? { street: '', city: '', state: '', postalCode: '', country: 'USA' },
              isDemo: true,
            });
            showToast({ title: 'Appointment scheduled', description: 'New appointment added to calendar.', type: 'success' });
            setOpen(false);
            const response = await appointmentsService.listAppointments({ pageSize: 50 });
            setAppointments(response.data);
            setCustomers(getTable('customers'));
            setServices(getTable('services'));
            setTechnicians(getTable('technicians'));
          }}
        />
      </Modal>
    </div>
  );
}

