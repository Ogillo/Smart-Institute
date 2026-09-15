import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell, CheckCircle } from 'lucide-react';
import { Card, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button, Input } from '@/components/ui/core';
import { useListPayments, useVerifyPayment, useGetCurrentUser } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/applications', label: 'Applications', icon: FileText },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/documents', label: 'Documents', icon: CheckSquare },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/classes', label: 'Classes', icon: LayoutDashboard },
  { href: '/admin/dormitories', label: 'Dormitories', icon: BedDouble },
  { href: '/admin/allocations', label: 'Allocations', icon: CheckSquare },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

export default function AdminPayments() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: payments, isLoading, refetch } = useListPayments({ status: statusFilter || undefined });
  const verifyPayment = useVerifyPayment();
  const { toast } = useToast();

  const total = payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0;
  const confirmed = payments?.filter((p: any) => p.status === 'confirmed') ?? [];
  const confirmedTotal = confirmed.reduce((s: number, p: any) => s + Number(p.amount), 0);

  const methodColor: Record<string, string> = { mpesa: 'bg-green-50 text-green-700', airtel_money: 'bg-red-50 text-red-700', bank_transfer: 'bg-blue-50 text-blue-700', card: 'bg-purple-50 text-purple-700' };
  const statusColor: Record<string, string> = { confirmed: 'bg-teal-50 text-teal-700', pending: 'bg-amber-50 text-amber-700', failed: 'bg-red-50 text-red-700' };

  return (
    <DashboardLayout title="Payments & Finance" links={adminLinks}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Payments</h2>
          <p className="text-slate-500 font-medium">Track and verify student fee payments.</p>
        </div>
        <select className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 w-full md:w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5"><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Payments</p><p className="text-3xl font-extrabold text-slate-900">{payments?.length ?? 0}</p></CardContent></Card>
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5"><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confirmed Revenue</p><p className="text-3xl font-extrabold text-teal-700">KES {confirmedTotal.toLocaleString()}</p></CardContent></Card>
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-5"><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Amount</p><p className="text-3xl font-extrabold text-amber-600">KES {(total - confirmedTotal).toLocaleString()}</p></CardContent></Card>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No.</TableHead>
                <TableHead>App ID</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-slate-500">Loading...</TableCell></TableRow>
              ) : !payments?.length ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-slate-500">No payments found.</TableCell></TableRow>
              ) : (payments as any[]).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-slate-500">{p.receiptNumber || '—'}</TableCell>
                  <TableCell className="font-mono text-slate-500">#{p.applicationId}</TableCell>
                  <TableCell><Badge className={`${methodColor[p.method] || 'bg-slate-50 text-slate-600'} shadow-none border-0 text-[10px] font-bold uppercase tracking-wider`}>{p.method?.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="text-right font-bold text-slate-900">KES {Number(p.amount).toLocaleString()}</TableCell>
                  <TableCell><Badge className={`${statusColor[p.status] || 'bg-slate-50 text-slate-600'} shadow-none border-0 text-[10px] font-bold uppercase tracking-wider`}>{p.status}</Badge></TableCell>
                  <TableCell className="text-slate-500 text-sm">{new Date(p.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell className="text-right">
                    {p.status === 'pending' && (
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => verifyPayment.mutate({ id: p.id }, { onSuccess: () => { toast({ title: 'Payment verified' }); refetch(); } })} disabled={verifyPayment.isPending}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Verify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
