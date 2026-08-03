import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TechnicianForm } from '@/components/forms/TechnicianForm';
import { CardGrid } from '@/components/layout/CardGrid';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { techniciansService } from '@/services/technicians';
import { useToastContext } from '@/context/ToastContext';
import type { Technician } from '@/types';

export function TechniciansListPage() {
  const { showToast } = useToastContext();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const response = await techniciansService.listTechnicians({ pageSize: 50 });
    setTechnicians(response.data);
  };

  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Technicians" description="Manage field technicians, workload, skills, and job readiness." actions={<Button onClick={() => setOpen(true)}>Add technician</Button>} />
      <CardGrid>
        {technicians.map((technician) => (
          <Card key={technician.id}>
            <CardHeader>
              <div>
                <Link to={`/technicians/${technician.id}`} className="text-lg font-semibold text-slate-950 hover:text-brand-700 dark:text-white dark:hover:text-brand-300">{technician.firstName} {technician.lastName}</Link>
                <p className="text-sm text-slate-500 dark:text-slate-400">{technician.territory}</p>
              </div>
              <Badge variant={technician.status === 'available' ? 'success' : technician.status === 'on_job' ? 'warning' : 'info'}>{technician.status}</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">{technician.specialties.join(', ')}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400"><span>Workload</span><span>{technician.workloadPercent}%</span></div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-brand-700" style={{ width: `${technician.workloadPercent}%` }} /></div>
              </div>
            </CardBody>
          </Card>
        ))}
      </CardGrid>
      <Modal open={open} onClose={() => setOpen(false)} title="Add technician">
        <TechnicianForm
          initialValues={{}}
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            await techniciansService.create({
              organizationId: 'org-handy-glass',
              firstName: values.firstName ?? '',
              lastName: values.lastName ?? '',
              email: values.email ?? '',
              phone: values.phone,
              specialties: values.specialties ?? [],
              certifications: values.certifications ?? [],
              territory: values.territory,
              serviceAreaRadiusMiles: values.serviceAreaRadiusMiles ?? 25,
              hourlyRate: values.hourlyRate ?? 0,
              workloadPercent: values.workloadPercent ?? 0,
              averageRating: values.averageRating ?? 0,
              totalJobs: values.totalJobs ?? 0,
              isActive: true,
              isAvailable: values.status !== 'off_duty',
              status: values.status ?? 'available',
              isDemo: true,
            });
            showToast({ title: 'Technician created', description: 'Field technician added to roster.', type: 'success' });
            setOpen(false);
            await load();
          }}
        />
      </Modal>
    </div>
  );
}

