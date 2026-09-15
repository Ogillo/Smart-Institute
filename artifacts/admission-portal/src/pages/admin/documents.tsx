import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button, Input } from '@/components/ui/core';
import { useListDocuments, useVerifyDocument } from '@workspace/api-client-react';
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

const DOC_LABELS: Record<string, string> = {
  admission_letter: 'Admission Letter', birth_certificate: 'Birth Certificate',
  result_slip: 'Result Slip', passport_photo: 'Passport Photo',
  medical_form: 'Medical Form', leaving_certificate: 'Leaving Certificate',
  transfer_letter: 'Transfer Letter', nemis: 'NEMIS',
};

export default function AdminDocuments() {
  const [applicationId, setApplicationId] = useState('');
  const { data: docs, isLoading, refetch } = useListDocuments({ applicationId: applicationId ? Number(applicationId) : undefined }, { query: { enabled: !!applicationId } });
  const verifyDoc = useVerifyDocument();
  const { toast } = useToast();

  const handleVerify = (id: number, status: 'approved' | 'rejected') => {
    verifyDoc.mutate({ id, data: { status } }, {
      onSuccess: () => { toast({ title: status === 'approved' ? 'Document approved' : 'Document rejected' }); refetch(); }
    });
  };

  const statusColor = (s: string) => s === 'approved' ? 'bg-teal-50 text-teal-700' : s === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700';

  return (
    <DashboardLayout title="Document Verification" links={adminLinks}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Documents</h2>
          <p className="text-slate-500 font-medium">Review and verify uploaded documents.</p>
        </div>
        <div className="w-full md:w-56">
          <Input placeholder="Enter Application ID..." value={applicationId} onChange={e => setApplicationId(e.target.value)} className="h-10 bg-white" type="number" />
        </div>
      </div>
      {!applicationId ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center h-48 text-slate-400">
            <CheckSquare className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold">Enter an application ID above to view documents</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center text-slate-500">Loading...</TableCell></TableRow>
                ) : !docs?.length ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center text-slate-500">No documents for this application.</TableCell></TableRow>
                ) : docs.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-semibold text-slate-900">{DOC_LABELS[d.documentType] || d.documentType}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] font-bold uppercase tracking-wider shadow-none border-0 ${statusColor(d.status)}`}>{d.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-teal-700 font-semibold text-sm hover:underline">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      {d.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleVerify(d.id, 'rejected')} disabled={verifyDoc.isPending}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => handleVerify(d.id, 'approved')} disabled={verifyDoc.isPending}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
