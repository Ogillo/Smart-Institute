import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LayoutDashboard, Building2, Users, ClipboardList } from 'lucide-react';
import { Card, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button, Input } from '@/components/ui/core';
import { useListUsers, useUpdateUser } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const superAdminLinks = [
  { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super-admin/institutions', label: 'Institutions', icon: Building2 },
  { href: '/super-admin/users', label: 'User Management', icon: Users },
  { href: '/super-admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
];

const ROLES = ['parent', 'admission_officer', 'finance_officer', 'storekeeper', 'institution_admin', 'super_admin'];
const roleColor: Record<string, string> = { super_admin: 'bg-purple-50 text-purple-700', institution_admin: 'bg-blue-50 text-blue-700', admission_officer: 'bg-teal-50 text-teal-700', finance_officer: 'bg-green-50 text-green-700', storekeeper: 'bg-amber-50 text-amber-700', parent: 'bg-slate-50 text-slate-600' };

export default function SuperAdminUsers() {
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const { data: users, isLoading, refetch } = useListUsers({ role: roleFilter || undefined });
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState('');

  const filtered = (users as any[] | undefined)?.filter(u => !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) ?? [];

  const handleRoleUpdate = (id: number) => {
    updateUser.mutate({ id, data: { role: editRole as any } }, {
      onSuccess: () => { toast({ title: 'Role updated' }); setEditingId(null); refetch(); }
    });
  };

  return (
    <DashboardLayout title="User Management" links={superAdminLinks}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Users</h2>
          <p className="text-slate-500 font-medium">Manage roles and institution assignments.</p>
        </div>
        <div className="flex gap-3">
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="h-10 bg-white w-56" />
          <select className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 w-44" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">Loading...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">No users found.</TableCell></TableRow>
              ) : filtered.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold text-slate-900">{u.fullName || '—'}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{u.email}</TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <div className="flex gap-2 items-center">
                        <select className="h-8 px-2 rounded border border-slate-200 text-sm" value={editRole} onChange={e => setEditRole(e.target.value)}>
                          {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                        </select>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 h-8" onClick={() => handleRoleUpdate(u.id)} disabled={updateUser.isPending}>Save</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Badge className={`${roleColor[u.role] || 'bg-slate-50 text-slate-600'} shadow-none border-0 text-[10px] font-bold uppercase tracking-wider`}>{u.role?.replace('_', ' ')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{u.institutionId ? `Inst. #${u.institutionId}` : '—'}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                  <TableCell className="text-right">
                    {editingId !== u.id && (
                      <Button size="sm" variant="outline" className="font-semibold text-slate-600" onClick={() => { setEditingId(u.id); setEditRole(u.role); }}>Edit Role</Button>
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
