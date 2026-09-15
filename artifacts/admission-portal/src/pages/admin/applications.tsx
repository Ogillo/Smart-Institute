import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button, Input } from '@/components/ui/core';
import { useListApplications, useApproveApplication, useRejectApplication } from '@workspace/api-client-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AdminApplications() {
  const [search, setSearch] = useState('');
  const { data: applications, isLoading, refetch } = useListApplications({ search: search || undefined });
  const approveApp = useApproveApplication();
  const rejectApp = useRejectApplication();
  const { toast } = useToast();

  const links = [
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

  const handleApprove = (id: number) => {
    approveApp.mutate({ id }, {
      onSuccess: () => {
        toast({ title: 'Application approved' });
        refetch();
      }
    });
  };

  const handleReject = (id: number) => {
    // Basic rejection for demo, ideally opens a dialog for a reason
    rejectApp.mutate({ id, data: { reason: 'Requirements not met' } }, {
      onSuccess: () => {
        toast({ title: 'Application rejected' });
        refetch();
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'under_review': return 'bg-purple-100 text-purple-700';
      case 'approved': return 'bg-teal-100 text-teal-800';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'checked_in': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <DashboardLayout title="Applications Management" links={links}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Applications</h2>
          <p className="text-slate-500 font-medium">Review and process student admissions.</p>
        </div>
        <div className="w-full md:w-72">
          <Input 
            placeholder="Search by student name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 bg-white"
          />
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">Loading applications...</TableCell>
                </TableRow>
              ) : (!applications || applications.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">No applications found.</TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-slate-500">#{app.id}</TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900">{app.student?.fullName || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{app.student?.assessmentNumber || 'Pending Details'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[60px]">
                          <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${(app.step / 7) * 100}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{app.step}/7</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(app.status)} shadow-none border-0 uppercase tracking-wider text-[10px] font-bold`}>
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${
                        app.paymentStatus === 'paid' ? 'border-green-200 text-green-700 bg-green-50' : 
                        app.paymentStatus === 'partial' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                        'border-slate-200 text-slate-500 bg-slate-50'
                      } shadow-none font-bold uppercase tracking-wider text-[10px]`}>
                        {app.paymentStatus || 'unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {app.status === 'under_review' || app.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleReject(app.id)} disabled={rejectApp.isPending}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => handleApprove(app.id)} disabled={approveApp.isPending}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="font-semibold text-slate-600">
                          View Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
