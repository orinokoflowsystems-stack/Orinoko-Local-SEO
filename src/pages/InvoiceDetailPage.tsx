import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingIndicator } from '@/components/ui/Spinner';
import { invoicesService } from '@/services/invoices';
import { createId } from '@/utils/id';
import type { Invoice, InvoiceStatus } from '@/types';
import { DetailCard, KeyValueList } from './shared';

export function InvoiceDetailPage() {
  const { invoiceId = '' } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    invoicesService.getById(invoiceId).then(setInvoice).catch(() => setInvoice(null));
  }, [invoiceId]);

  if (!invoice) return <LoadingIndicator label="Loading invoice..." />;

  const updateStatus = async (status: InvoiceStatus) => setInvoice(await invoicesService.updateStatus(invoice.id, status));

  return (
    <div className="space-y-6">
      <PageHeader title={invoice.invoiceNumber} description={invoice.customerName} breadcrumbs={[{ label: 'Invoices', to: '/invoices' }, { label: invoice.invoiceNumber }]} actions={<Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'}>{invoice.status}</Badge>} />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <DetailCard title="Invoice summary">
          <KeyValueList items={[
            { label: 'Customer', value: invoice.customerName },
            { label: 'Issued', value: new Date(invoice.issuedAt).toLocaleDateString() },
            { label: 'Due', value: new Date(invoice.dueDate).toLocaleDateString() },
            { label: 'Total', value: `$${invoice.total.toFixed(2)}` },
            { label: 'Balance', value: `$${invoice.balanceDue.toFixed(2)}` },
            { label: 'Status', value: invoice.status },
          ]} />
        </DetailCard>
        <DetailCard title="Payment actions">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void updateStatus('issued')}>Mark issued</Button>
            <Button variant="secondary" onClick={() => void invoicesService.recordPayment(invoice.id, { id: createId('payment'), organizationId: invoice.organizationId, invoiceId: invoice.id, amount: invoice.balanceDue || invoice.total, method: 'card', status: 'completed', paidAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'user-owner' }).then(setInvoice)}>Record payment</Button>
            <Button variant="danger" onClick={() => void updateStatus('void')}>Void invoice</Button>
          </div>
        </DetailCard>
      </div>
      <DetailCard title="Line items">
        <div className="space-y-3">{invoice.items.map((item) => <div key={item.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><p className="font-medium text-slate-950 dark:text-white">{item.description}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}</p></div>)}</div>
      </DetailCard>
      <DetailCard title="Payments">
        <div className="space-y-3">{invoice.payments.length ? invoice.payments.map((payment) => <div key={payment.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><p className="font-medium text-slate-950 dark:text-white">${payment.amount.toFixed(2)} via {payment.method}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{payment.status} • {payment.reference ?? 'Manual entry'}</p></div>) : <Alert type="info">No payments recorded yet.</Alert>}</div>
      </DetailCard>
    </div>
  );
}

