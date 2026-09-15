import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button, Input } from '@/components/ui/core';
import { useListAllocations, useCreateAllocation, useListStreams, useListDormitories, useGetCurrentUser } from '@workspace/api-client-react';
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

const emptyForm = { applicationId: '', admissionNumber: '', streamId: '', dormitoryId: '', teacherName: '', teacherPhone: '', reportingDate: '', reportingTime: '' };

export default function AdminAllocations() {
  const { data: me } = useGetCurrentUser();
  const institutionId = me?.institutionId;
  const { data: allocations, isLoading, refetch } = useListAllocations({});
  const createAlloc = useCreateAllocation();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = () => {
    if (!form.applicationId) return;
    createAlloc.mutate({
      data: {
        applicationId: Number(form.applicationId),
        admissionNumber: form.admissionNumber,
        streamId: form.streamId ? Number(form.streamId) : undefined,
        dormitoryId: form.dormitoryId ? Number(form.dormitoryId) : undefined,
        teacherName: form.teacherName,
        teacherPhone: form.teacherPhone,
        reportingDate: form.reportingDate,
        reportingTime: form.reportingTime,
      }
    }, {
      onSuccess: () => { toast({ title: 'Allocation saved' }); setShowForm(false); setForm(emptyForm); refetch(); }
    });
  };

  return (
    <DashboardLayout title="Student Allocations" links={adminLinks}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Allocations</h2>
          <p className="text-slate-500 font-medium">Assign streams, dormitories, and reporting details.</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 font-bold" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Allocation
        </Button>
      </div>

      {showForm && (
        <Card className="border-teal-200 bg-teal-50/30 shadow-sm mb-6">
          <CardHeader><CardTitle className="text-base font-bold">New Allocation</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Application ID *</label><Input type="number" value={form.applicationId} onChange={e => setForm({ ...form, applicationId: e.target.value })} placeholder="App ID" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Admission No.</label><Input value={form.admissionNumber} onChange={e => setForm({ ...form, admissionNumber: e.target.value })} placeholder="e.g. GVS/2027/001" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Stream ID</label><Input type="number" value={form.streamId} onChange={e => setForm({ ...form, streamId: e.target.value })} placeholder="Stream ID" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Dormitory ID</label><Input type="number" value={form.dormitoryId} onChange={e => setForm({ ...form, dormitoryId: e.target.value })} placeholder="Dorm ID" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Class Teacher</label><Input value={form.teacherName} onChange={e => setForm({ ...form, teacherName: e.target.value })} placeholder="Teacher name" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Reporting Date</label><Input type="date" value={form.reportingDate} onChange={e => setForm({ ...form, reportingDate: e.target.value })} /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Reporting Time</label><Input type="time" value={form.reportingTime} onChange={e => setForm({ ...form, reportingTime: e.target.value })} /></div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmit} disabled={createAlloc.isPending}>Save Allocation</Button>
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
                <TableHead>App ID</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Dormitory</TableHead>
                <TableHead>Class Teacher</TableHead>
                <TableHead>Reporting Date</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-slate-500">Loading...</TableCell></TableRow>
              ) : !allocations?.length ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-slate-500">No allocations yet.</TableCell></TableRow>
              ) : (allocations as any[]).map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-slate-500">#{a.applicationId}</TableCell>
                  <TableCell className="font-bold text-teal-800">{a.admissionNumber || '—'}</TableCell>
                  <TableCell className="text-slate-600">{a.streamName || (a.streamId ? `Stream #${a.streamId}` : '—')}</TableCell>
                  <TableCell className="text-slate-600">{a.dormitoryName || (a.dormitoryId ? `Dorm #${a.dormitoryId}` : '—')}</TableCell>
                  <TableCell className="text-slate-600">{a.teacherName || '—'}</TableCell>
                  <TableCell className="text-slate-600">{a.reportingDate || '—'}</TableCell>
                  <TableCell className="text-slate-500">{a.reportingTime || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
