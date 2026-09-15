import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell, ClipboardList } from 'lucide-react';
import { Card, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/core';
import { useListAuditLogs, useGetCurrentUser } from '@workspace/api-client-react';

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
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
];

export default function AdminAuditLogs() {
  const { data: me } = useGetCurrentUser();
  const { data: logs, isLoading } = useListAuditLogs({ institutionId: me?.institutionId, limit: 100 });

  return (
    <DashboardLayout title="Audit Logs" links={adminLinks}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail</h2>
        <p className="text-slate-500 font-medium">All recorded system actions for this institution.</p>
      </div>
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500">Loading...</TableCell></TableRow>
              ) : !logs?.length ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500">No audit log entries.</TableCell></TableRow>
              ) : (logs as any[]).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-semibold text-slate-900">{l.action}</TableCell>
                  <TableCell className="text-slate-600">{l.entityType ? `${l.entityType}${l.entityId ? ` #${l.entityId}` : ''}` : '—'}</TableCell>
                  <TableCell className="font-mono text-slate-500">{l.userId ? `#${l.userId}` : '—'}</TableCell>
                  <TableCell className="text-slate-500 text-sm font-mono">{l.ipAddress || '—'}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{new Date(l.createdAt).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
