import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell } from 'lucide-react';
import { Card, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button, Input } from '@/components/ui/core';
import { useListStudents } from '@workspace/api-client-react';
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

export default function AdminStudents() {
  const [search, setSearch] = useState('');
  const { data: students, isLoading } = useListStudents({ search: search || undefined });

  return (
    <DashboardLayout title="Students" links={adminLinks}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Records</h2>
          <p className="text-slate-500 font-medium">All enrolled and pending students.</p>
        </div>
        <div className="w-full md:w-72">
          <Input placeholder="Search by name, assessment no..." value={search} onChange={e => setSearch(e.target.value)} className="h-10 bg-white" />
        </div>
      </div>
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Assessment No.</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Previous School</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">Loading...</TableCell></TableRow>
              ) : !students?.length ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">No students found.</TableCell></TableRow>
              ) : students.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-bold text-slate-900">{s.fullName}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] font-bold uppercase tracking-wider shadow-none border-0 ${s.gender === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>{s.gender}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-600">{s.assessmentNumber || '—'}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-600">{s.admissionNumber || '—'}</TableCell>
                  <TableCell className="text-slate-600">{s.county || '—'}</TableCell>
                  <TableCell className="text-slate-600">{s.previousSchool || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
