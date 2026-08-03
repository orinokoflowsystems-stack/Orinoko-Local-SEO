import { useEffect, useState } from 'react';
import { ServiceForm } from '@/components/forms/ServiceForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { organizationsService } from '@/services/organizations';
import { serviceCatalogService } from '@/services/services';
import { getTable, resetDatabase } from '@/services/storage';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/context/ToastContext';
import type { Organization, Role, Service, ServiceCategory, User } from '@/types';

export function SettingsPage() {
  const { organization } = useAuth();
  const { showToast } = useToastContext();
  const [tab, setTab] = useState('organization');
  const [orgProfile, setOrgProfile] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      if (organization) {
        setOrgProfile(await organizationsService.getProfile(organization.id));
      }
      setUsers(getTable('users'));
      setRoles(getTable('roles'));
      setServices(getTable('services'));
      setCategories(getTable('serviceCategories'));
    })();
  }, [organization]);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure organization profile, users, roles, services, and demo data." />
      <Tabs tabs={[{ id: 'organization', label: 'Organization' }, { id: 'users', label: 'Users & roles' }, { id: 'services', label: 'Services' }]} value={tab} onChange={setTab} />
      {tab === 'organization' && orgProfile ? (
        <Card>
          <CardHeader><CardTitle>Organization profile</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Name</p><p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{orgProfile.name}</p></div>
              <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Subscription</p><p className="mt-1 text-sm text-slate-900 dark:text-slate-100"><Badge variant="success">{orgProfile.subscription.plan} • {orgProfile.subscription.status}</Badge></p></div>
              <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Timezone</p><p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{orgProfile.timezone}</p></div>
              <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Locale</p><p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{orgProfile.locale}</p></div>
            </div>
            <Alert type="info">Brand colors are wired to ORINOKO defaults: #1e3a8a and #ff8c42.</Alert>
            <div className="flex flex-wrap gap-3">
              <Button onClick={async () => {
                if (!orgProfile) return;
                await organizationsService.updateSettings(orgProfile.id, { updatedAt: new Date().toISOString() });
                showToast({ title: 'Settings saved', description: 'Organization profile sync complete.', type: 'success' });
              }}>Save organization</Button>
              <Button variant="danger" onClick={() => {
                resetDatabase();
                showToast({ title: 'Demo data reset', description: 'The demo workspace was restored.', type: 'warning' });
                void (async () => {
                  if (organization) {
                    setOrgProfile(await organizationsService.getProfile(organization.id));
                  }
                  setUsers(getTable('users'));
                  setRoles(getTable('roles'));
                  setServices(getTable('services'));
                  setCategories(getTable('serviceCategories'));
                })();
              }}>Reset demo data</Button>
            </div>
          </CardBody>
        </Card>
      ) : null}
      {tab === 'users' ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader><CardTitle>Users</CardTitle></CardHeader>
            <CardBody className="space-y-3">{users.map((user) => <div key={user.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-slate-950 dark:text-white">{user.firstName} {user.lastName}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p></div><Badge>{user.roleKey}</Badge></div></div>)}</CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle>Roles & permissions</CardTitle></CardHeader>
            <CardBody className="space-y-3">{roles.map((role) => <div key={role.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><p className="font-medium text-slate-950 dark:text-white">{role.name}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{role.permissionCodes.length} permission(s)</p></div>)}</CardBody>
          </Card>
        </div>
      ) : null}
      {tab === 'services' ? (
        <Card>
          <CardHeader>
            <CardTitle>Service catalog</CardTitle>
            <Button onClick={() => setOpen(true)}>Add service</Button>
          </CardHeader>
          <CardBody className="space-y-3">{services.map((service) => <div key={service.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-slate-950 dark:text-white">{service.name}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{service.categoryName} • ${service.basePrice.toFixed(2)}</p></div><Badge>{service.estimatedDurationMinutes} min</Badge></div></div>)}</CardBody>
        </Card>
      ) : null}
      <Modal open={open} onClose={() => setOpen(false)} title="Create service">
        <ServiceForm
          categories={categories}
          initialValues={{}}
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            await serviceCatalogService.create({
              organizationId: organization?.id ?? 'org-handy-glass',
              categoryId: values.categoryId ?? categories[0]?.id ?? '',
              categoryName: values.categoryName ?? categories[0]?.name ?? '',
              name: values.name ?? '',
              description: values.description ?? '',
              basePrice: values.basePrice ?? 0,
              estimatedDurationMinutes: values.estimatedDurationMinutes ?? 60,
              isActive: true,
              isDemo: true,
            });
            showToast({ title: 'Service added', description: 'Catalog entry created successfully.', type: 'success' });
            setOpen(false);
            if (organization) {
              setOrgProfile(await organizationsService.getProfile(organization.id));
            }
            setUsers(getTable('users'));
            setRoles(getTable('roles'));
            setServices(getTable('services'));
            setCategories(getTable('serviceCategories'));
          }}
        />
      </Modal>
    </div>
  );
}

