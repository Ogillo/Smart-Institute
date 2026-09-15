import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LayoutDashboard, Building2, Users, ClipboardList, Plus, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button, Input } from '@/components/ui/core';
import { useListInstitutions, useCreateInstitution, useApproveInstitution } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const superAdminLinks = [
  { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super-admin/institutions', label: 'Institutions', icon: Building2 },
  { href: '/super-admin/users', label: 'User Management', icon: Users },
  { href: '/super-admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
];

const emptyForm = { name: '', level: 'secondary', county: '', address: '', phone: '', email: '' };
const statusColor = (s: string) => s === 'approved' ? 'bg-teal-50 text-teal-700' : s === 'suspended' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700';
const levelColor = (l: string) => l === 'university' ? 'bg-indigo-50 text-indigo-700' : l === 'college' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-700';

export default function SuperAdminInstitutions() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: institutions, isLoading, refetch } = useListInstitutions({ search: search || undefined, status: statusFilter || undefined });
  const createInstitution = useCreateInstitution();
  const approveInstitution = useApproveInstitution();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleCreate = () => {
    if (!form.name || !form.county) return;
    createInstitution.mutate({ data: { ...form, level: form.level as any } }, {
      onSuccess: () => { toast({ title: 'Institution created' }); setShowForm(false); setForm(emptyForm); refetch(); }
    });
  };

  return (
    <DashboardLayout title="Institutions" links={superAdminLinks}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Institutions</h2>
          <p className="text-slate-500 font-medium">Manage and approve registered institutions.</p>
        </div>
        <div className="flex gap-3">
          <select className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button className="bg-teal-600 hover:bg-teal-700 font-bold" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Add</Button>
        </div>
      </div>

      <div className="mb-6">
        <Input placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} className="h-10 bg-white max-w-sm" />
      </div>

      {showForm && (
        <Card className="border-teal-200 bg-teal-50/30 shadow-sm mb-6">
          <CardHeader><CardTitle className="text-base font-bold">New Institution</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Name *</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Institution name" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Level *</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  <option value="secondary">Secondary</option><option value="college">College</option><option value="university">University</option>
                </select>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">County *</label><Input value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} placeholder="e.g. Nairobi" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Phone</label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Email</label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Address</label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCreate} disabled={createInstitution.isPending}>Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">Loading...</TableCell></TableRow>
              ) : !institutions?.length ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">No institutions found.</TableCell></TableRow>
              ) : (institutions as any[]).map((inst: any) => (
                <TableRow key={inst.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900">{inst.name}</div>
                    {inst.email && <div className="text-xs text-slate-400">{inst.email}</div>}
                  </TableCell>
                  <TableCell><Badge className={`${levelColor(inst.level)} shadow-none border-0 text-[10px] font-bold uppercase tracking-wider`}>{inst.level}</Badge></TableCell>
                  <TableCell className="text-slate-600">{inst.county}</TableCell>
                  <TableCell><Badge className={`${statusColor(inst.status)} shadow-none border-0 text-[10px] font-bold uppercase tracking-wider`}>{inst.status}</Badge></TableCell>
                  <TableCell><Badge className={`${inst.subscriptionStatus === 'active' ? 'bg-teal-50 text-teal-700' : 'bg-slate-50 text-slate-500'} shadow-none border-0 text-[10px] font-bold uppercase tracking-wider`}>{inst.subscriptionStatus}</Badge></TableCell>
                  <TableCell className="text-right">
                    {inst.status === 'pending' && (
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => approveInstitution.mutate({ id: inst.id }, { onSuccess: () => { toast({ title: 'Institution approved' }); refetch(); } })} disabled={approveInstitution.isPending}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
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
