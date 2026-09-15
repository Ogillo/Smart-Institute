import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell, Plus, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui/core';
import { useListDormitories, useCreateDormitory, useUpdateDormitory, useGetCurrentUser } from '@workspace/api-client-react';
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

const emptyForm = { name: '', gender: 'male', capacity: '', dormitoryMaster: '', dormitoryMasterPhone: '' };

export default function AdminDormitories() {
  const { data: me } = useGetCurrentUser();
  const institutionId = me?.institutionId;
  const { data: dorms, isLoading, refetch } = useListDormitories({ institutionId: institutionId! }, { query: { enabled: !!institutionId } });
  const createDorm = useCreateDormitory();
  const updateDorm = useUpdateDormitory();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!form.name || !form.capacity || !institutionId) return;
    const data = { ...form, institutionId, capacity: Number(form.capacity), gender: form.gender as any };
    if (editId) {
      updateDorm.mutate({ id: editId, data }, { onSuccess: () => { toast({ title: 'Dormitory updated' }); setShowForm(false); setEditId(null); setForm(emptyForm); refetch(); } });
    } else {
      createDorm.mutate({ data }, { onSuccess: () => { toast({ title: 'Dormitory added' }); setShowForm(false); setForm(emptyForm); refetch(); } });
    }
  };

  const startEdit = (d: any) => {
    setForm({ name: d.name, gender: d.gender || 'male', capacity: String(d.capacity), dormitoryMaster: d.dormitoryMaster || '', dormitoryMasterPhone: d.dormitoryMasterPhone || '' });
    setEditId(d.id);
    setShowForm(true);
  };

  const genderColor = (g: string) => g === 'male' ? 'bg-blue-50 text-blue-700' : g === 'female' ? 'bg-pink-50 text-pink-700' : 'bg-purple-50 text-purple-700';

  return (
    <DashboardLayout title="Dormitories" links={adminLinks}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dormitories</h2>
          <p className="text-slate-500 font-medium">Manage boarding houses and occupancy.</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 font-bold" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Dormitory
        </Button>
      </div>

      {showForm && (
        <Card className="border-teal-200 bg-teal-50/30 shadow-sm mb-6">
          <CardHeader><CardTitle className="text-base font-bold">{editId ? 'Edit Dormitory' : 'New Dormitory'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Name *</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nyati House" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Gender</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="male">Male</option><option value="female">Female</option><option value="mixed">Mixed</option>
                </select>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Capacity *</label><Input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="80" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Dormitory Master</label><Input value={form.dormitoryMaster} onChange={e => setForm({ ...form, dormitoryMaster: e.target.value })} placeholder="Full name" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Master Phone</label><Input value={form.dormitoryMasterPhone} onChange={e => setForm({ ...form, dormitoryMasterPhone: e.target.value })} placeholder="07XX XXX XXX" /></div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmit} disabled={createDorm.isPending || updateDorm.isPending}>{editId ? 'Update' : 'Add'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">Loading...</div>
      ) : !dorms?.length ? (
        <Card className="border-slate-200 shadow-sm"><CardContent className="flex items-center justify-center h-32 text-slate-400 font-semibold">No dormitories yet.</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(dorms as any[]).map((d: any) => (
            <Card key={d.id} className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{d.name}</h3>
                    <Badge className={`${genderColor(d.gender)} shadow-none border-0 text-xs font-bold uppercase tracking-wider mt-1`}>{d.gender}</Badge>
                  </div>
                  <button onClick={() => startEdit(d)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm font-semibold text-slate-600 mb-1">
                    <span>Occupancy</span>
                    <span className={d.occupancyPercent > 90 ? 'text-red-600' : d.occupancyPercent > 70 ? 'text-amber-600' : 'text-teal-600'}>{d.occupancy}/{d.capacity} ({d.occupancyPercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${d.occupancyPercent > 90 ? 'bg-red-500' : d.occupancyPercent > 70 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${d.occupancyPercent}%` }} />
                  </div>
                </div>
                {d.dormitoryMaster && (
                  <div className="text-sm text-slate-600 pt-3 border-t border-slate-100">
                    <p className="font-semibold">{d.dormitoryMaster}</p>
                    {d.dormitoryMasterPhone && <p className="text-slate-400">{d.dormitoryMasterPhone}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
