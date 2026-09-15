import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LayoutDashboard, Building2, Users, ClipboardList } from 'lucide-react';
import { Card, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/core';
import { useListAuditLogs } from '@workspace/api-client-react';

const superAdminLinks = [
  { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super-admin/institutions', label: 'Institutions', icon: Building2 },
  { href: '/super-admin/users', label: 'User Management', icon: Users },
  { href: '/super-admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
];

export default function SuperAdminAuditLogs() {
  const { data: logs, isLoading } = useListAuditLogs({ limit: 200 });

  return (
    <DashboardLayout title="Platform Audit Logs" links={superAdminLinks}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail</h2>
        <p className="text-slate-500 font-medium">Platform-wide activity log across all institutions.</p>
      </div>
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">Loading...</TableCell></TableRow>
              ) : !logs?.length ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">No audit entries yet.</TableCell></TableRow>
              ) : (logs as any[]).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-semibold text-slate-900">{l.action}</TableCell>
                  <TableCell className="text-slate-600">{l.entityType ? `${l.entityType}${l.entityId ? ` #${l.entityId}` : ''}` : '—'}</TableCell>
                  <TableCell className="text-slate-500 font-mono text-sm">{l.institutionId ? `#${l.institutionId}` : '—'}</TableCell>
                  <TableCell className="font-mono text-slate-500 text-sm">{l.userId ? `#${l.userId}` : '—'}</TableCell>
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
