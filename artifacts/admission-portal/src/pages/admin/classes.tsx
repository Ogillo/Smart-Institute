import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui/core';
import { useListClasses, useCreateClass, useCreateStream, useGetCurrentUser } from '@workspace/api-client-react';
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

export default function AdminClasses() {
  const { data: me } = useGetCurrentUser();
  const institutionId = me?.institutionId;
  const { data: classes, isLoading, refetch } = useListClasses({ institutionId: institutionId! }, { query: { enabled: !!institutionId } });
  const createClass = useCreateClass();
  const createStream = useCreateStream();
  const { toast } = useToast();

  const [expanded, setExpanded] = useState<number | null>(null);
  const [showClassForm, setShowClassForm] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', level: '', academicYear: '2027' });
  const [streamForms, setStreamForms] = useState<Record<number, { name: string; teacherName: string; teacherPhone: string; capacity: string; show: boolean }>>({});

  const handleAddClass = () => {
    if (!classForm.name || !institutionId) return;
    createClass.mutate({ data: { institutionId, name: classForm.name, level: classForm.level, academicYear: classForm.academicYear } }, {
      onSuccess: () => { toast({ title: 'Class added' }); setShowClassForm(false); setClassForm({ name: '', level: '', academicYear: '2027' }); refetch(); }
    });
  };

  const handleAddStream = (classId: number) => {
    const sf = streamForms[classId];
    if (!sf?.name) return;
    createStream.mutate({ data: { classId, name: sf.name, teacherName: sf.teacherName, teacherPhone: sf.teacherPhone, capacity: Number(sf.capacity || 40) } }, {
      onSuccess: () => { toast({ title: 'Stream added' }); setStreamForms(prev => ({ ...prev, [classId]: { ...prev[classId], show: false, name: '', teacherName: '', teacherPhone: '', capacity: '40' } })); refetch(); }
    });
  };

  return (
    <DashboardLayout title="Classes & Streams" links={adminLinks}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Classes & Streams</h2>
          <p className="text-slate-500 font-medium">Manage academic classes and their streams.</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 font-bold" onClick={() => setShowClassForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Class
        </Button>
      </div>

      {showClassForm && (
        <Card className="border-teal-200 bg-teal-50/30 shadow-sm mb-6">
          <CardHeader><CardTitle className="text-base font-bold">New Class</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Class Name *</label><Input value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} placeholder="e.g. Form 1" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Level</label><Input value={classForm.level} onChange={e => setClassForm({ ...classForm, level: e.target.value })} placeholder="e.g. Form 1" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Academic Year *</label><Input value={classForm.academicYear} onChange={e => setClassForm({ ...classForm, academicYear: e.target.value })} /></div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleAddClass} disabled={createClass.isPending}>Add Class</Button>
              <Button variant="outline" onClick={() => setShowClassForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">Loading...</div>
      ) : !classes?.length ? (
        <Card className="border-slate-200 shadow-sm"><CardContent className="flex items-center justify-center h-32 text-slate-400 font-semibold">No classes yet. Add your first class above.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {(classes as any[]).map((cls: any) => (
            <Card key={cls.id} className="border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpanded(expanded === cls.id ? null : cls.id)}>
                <div className="flex items-center gap-4">
                  {expanded === cls.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  <div>
                    <span className="font-bold text-slate-900 text-lg">{cls.name}</span>
                    <span className="ml-3 text-sm text-slate-500 font-medium">{cls.academicYear}</span>
                  </div>
                </div>
                <Badge className="bg-teal-50 text-teal-700 shadow-none border-0 font-bold">{cls.streams?.length || 0} stream{cls.streams?.length !== 1 ? 's' : ''}</Badge>
              </div>
              {expanded === cls.id && (
                <div className="border-t border-slate-100 px-5 pb-5">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {(cls.streams || []).map((s: any) => (
                      <div key={s.id} className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900">{s.name}</span>
                          <Badge className="bg-blue-50 text-blue-700 shadow-none border-0 text-xs font-bold">{s.enrolled || 0}/{s.capacity}</Badge>
                        </div>
                        {s.teacherName && <p className="text-sm text-slate-600 font-medium">{s.teacherName}</p>}
                        {s.teacherPhone && <p className="text-xs text-slate-400">{s.teacherPhone}</p>}
                      </div>
                    ))}
                    {/* Add stream card */}
                    {streamForms[cls.id]?.show ? (
                      <div className="bg-teal-50 rounded-xl border border-teal-200 p-4">
                        <div className="space-y-2">
                          <Input placeholder="Stream name *" value={streamForms[cls.id]?.name || ''} onChange={e => setStreamForms(prev => ({ ...prev, [cls.id]: { ...prev[cls.id], name: e.target.value } }))} className="h-8 text-sm" />
                          <Input placeholder="Teacher name" value={streamForms[cls.id]?.teacherName || ''} onChange={e => setStreamForms(prev => ({ ...prev, [cls.id]: { ...prev[cls.id], teacherName: e.target.value } }))} className="h-8 text-sm" />
                          <Input placeholder="Capacity (40)" value={streamForms[cls.id]?.capacity || ''} onChange={e => setStreamForms(prev => ({ ...prev, [cls.id]: { ...prev[cls.id], capacity: e.target.value } }))} className="h-8 text-sm" type="number" />
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 flex-1" onClick={() => handleAddStream(cls.id)} disabled={createStream.isPending}>Add</Button>
                            <Button size="sm" variant="outline" onClick={() => setStreamForms(prev => ({ ...prev, [cls.id]: { ...prev[cls.id], show: false } }))}>Cancel</Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setStreamForms(prev => ({ ...prev, [cls.id]: { name: '', teacherName: '', teacherPhone: '', capacity: '40', show: true } }))} className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-slate-400 font-semibold text-sm hover:border-teal-300 hover:text-teal-600 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add Stream
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
