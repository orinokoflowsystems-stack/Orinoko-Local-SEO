import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, FileText, Receipt, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardDescription, CardHeader, CardTitle, StatCard } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/hooks/useTranslation';
import { getTable } from '@/services/storage';
import type { ActivityLog, DashboardMetrics, Notification } from '@/types';

export function DashboardPage() {
  const { formatCurrency, formatDateTime, t } = useTranslation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const leads = getTable('leads');
    const estimates = getTable('estimates');
    const jobs = getTable('jobs');
    const invoices = getTable('invoices');
    const activitiesData = getTable('activityLogs').slice(0, 5);
    const openNotifications = getTable('notifications').filter((item) => !item.read).slice(0, 4);
    const completedLeads = leads.filter((lead) => ['completed', 'closed'].includes(lead.status)).length;

    setMetrics({
      leadsOpen: leads.filter((lead) => !['lost', 'closed'].includes(lead.status)).length,
      estimatesOutstanding: estimates.filter((estimate) => ['draft', 'sent'].includes(estimate.status)).length,
      jobsToday: jobs.filter((job) => new Date(job.scheduledStart).toDateString() === new Date().toDateString()).length,
      invoicesDue: invoices.filter((invoice) => ['issued', 'partial', 'overdue'].includes(invoice.status)).length,
      revenueMonth: invoices.reduce((total, invoice) => total + invoice.total, 0),
      conversionRate: leads.length ? Math.round((completedLeads / leads.length) * 100) : 0,
    });
    setActivities(activitiesData);
    setNotifications(openNotifications);
  }, []);

  if (!metrics) {
    return <LoadingIndicator label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.title')} description={t('dashboard.subtitle')} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t('dashboard.openLeads')} value={String(metrics.leadsOpen)} description="Tracked across the ORINOKO pipeline" />
        <StatCard title={t('dashboard.estimates')} value={String(metrics.estimatesOutstanding)} description="Draft and sent estimates awaiting action" />
        <StatCard title={t('dashboard.jobsToday')} value={String(metrics.jobsToday)} description="Scheduled to start today"><CalendarDays className="h-6 w-6 text-accent-500" /></StatCard>
        <StatCard title={t('dashboard.invoicesDue')} value={String(metrics.invoicesDue)} description="Open invoices requiring payment follow-up"><Receipt className="h-6 w-6 text-accent-500" /></StatCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
              <CardDescription>Cross-team updates from leads, jobs, and invoices</CardDescription>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-300">
              View jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardBody className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="rounded-xl bg-brand-50 p-2 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  {activity.entityType === 'job' ? <Wrench className="h-4 w-4" /> : activity.entityType === 'invoice' ? <Receipt className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950 dark:text-white">{activity.description}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{activity.actorName} • {formatDateTime(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t('dashboard.quickActions')}</CardTitle>
                <CardDescription>Create key records fast</CardDescription>
              </div>
            </CardHeader>
            <CardBody className="grid gap-3">
              {[
                { label: 'New lead', to: '/leads' },
                { label: 'Schedule appointment', to: '/calendar' },
                { label: 'Create estimate', to: '/estimates' },
                { label: 'View invoices', to: '/invoices' },
              ].map((item) => (
                <Link key={item.label} to={item.to} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-300">
                  {item.label}
                </Link>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Alerts & reminders</CardTitle>
                <CardDescription>Unresolved operational notifications</CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                  <p className="font-medium text-slate-950 dark:text-white">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{notification.message}</p>
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.revenue')}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{formatCurrency(metrics.revenueMonth)}</p>
              <div className="mt-4 h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-3 rounded-full bg-accent-400" style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }} />
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('dashboard.conversion')}: {metrics.conversionRate}%</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

