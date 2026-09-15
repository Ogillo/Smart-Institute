import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Search, FileText, Bell, MapPin, GraduationCap, Phone, Mail, Link as LinkIcon, Calendar, Info, Clock, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/core';
import { useGetInstitution, useGetInstitutionFeeStructure } from '@workspace/api-client-react';
import { Link, useParams } from 'wouter';

export default function InstitutionDetail() {
  const { id } = useParams();
  const instId = id ? parseInt(id, 10) : 0;
  
  const { data: inst, isLoading: instLoading } = useGetInstitution(instId, { query: { enabled: !!instId } });
  const { data: feeStructure, isLoading: feeLoading } = useGetInstitutionFeeStructure(instId, { query: { enabled: !!instId } });

  const links = [
    { href: '/portal', label: 'Dashboard', icon: Home },
    { href: '/portal/institutions', label: 'Browse Institutions', icon: Search },
    { href: '/portal/applications', label: 'My Applications', icon: FileText },
    { href: '/portal/notifications', label: 'Notifications', icon: Bell },
  ];

  if (instLoading) {
    return (
      <DashboardLayout title="Institution Details" links={links}>
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-white rounded-2xl border border-slate-100"></div>
          <div className="h-96 bg-white rounded-2xl border border-slate-100"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!inst) {
    return (
      <DashboardLayout title="Institution Not Found" links={links}>
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Institution Not Found</h2>
          <p className="text-slate-500 mb-6">The institution you are looking for does not exist or has been removed.</p>
          <Link href="/portal/institutions">
            <Button>Back to Directory</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Institution Profile" links={links}>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/portal/institutions" className="text-teal-600 font-medium hover:underline text-sm flex items-center gap-1">
          &larr; Back to Directory
        </Link>
        <Link href={`/portal/apply/${inst.id}`}>
          <Button className="bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 font-bold px-6">
            Start Application
          </Button>
        </Link>
      </div>

      {/* Hero Profile */}
      <Card className="border-slate-200 shadow-sm mb-6 overflow-hidden">
        <div className="h-48 bg-slate-100 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:16px_16px]"></div>
          {inst.logoUrl ? (
            <div className="absolute -bottom-10 left-8 w-24 h-24 bg-white rounded-2xl shadow-md border border-slate-100 p-2 flex items-center justify-center">
              <img src={inst.logoUrl} alt={inst.name} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="absolute -bottom-10 left-8 w-24 h-24 bg-teal-50 rounded-2xl shadow-md border border-slate-100 p-2 flex items-center justify-center text-teal-700">
              <GraduationCap className="w-12 h-12" />
            </div>
          )}
        </div>
        <CardContent className="pt-14 pb-8 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{inst.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" />{inst.county}</div>
                {inst.phone && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" />{inst.phone}</div>}
                {inst.email && <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" />{inst.email}</div>}
                {inst.website && <div className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-slate-400" />{inst.website}</div>}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <div className="flex gap-2">
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 capitalize shadow-none border-0 text-xs px-3 py-1">{inst.level}</Badge>
                {inst.category && <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 capitalize shadow-none border-0 text-xs px-3 py-1">{inst.category}</Badge>}
              </div>
              <p className="text-xs text-slate-500 font-medium">Joined {new Date(inst.createdAt).getFullYear()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Info className="w-5 h-5 text-teal-600" />
                Admission Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {inst.admissionRequirements ? (
                <div className="prose prose-slate max-w-none text-slate-600">
                  {inst.admissionRequirements.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No specific requirements provided. Standard ministry requirements apply.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <CreditCard className="w-5 h-5 text-teal-600" />
                Fee Structure (Term 1)
              </CardTitle>
              {feeStructure && (
                <div className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                  TOTAL: KES {(feeStructure.tuitionFee + feeStructure.boardingFee + feeStructure.activityFee + feeStructure.admissionFee + (feeStructure.otherFees || 0)).toLocaleString()}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {feeLoading ? (
                <div className="p-6 text-slate-500 font-medium">Loading fee structure...</div>
              ) : feeStructure ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Fee Category</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Amount (KES)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900">Admission Fee</TableCell>
                      <TableCell className="text-right font-medium">{feeStructure.admissionFee.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900">Tuition Fee</TableCell>
                      <TableCell className="text-right font-medium">{feeStructure.tuitionFee.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900">Boarding Fee</TableCell>
                      <TableCell className="text-right font-medium">{feeStructure.boardingFee.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900">Activity Fee</TableCell>
                      <TableCell className="text-right font-medium">{feeStructure.activityFee.toLocaleString()}</TableCell>
                    </TableRow>
                    {feeStructure.otherFees > 0 && (
                      <TableRow>
                        <TableCell className="font-medium text-slate-900">Other Fees</TableCell>
                        <TableCell className="text-right font-medium">{feeStructure.otherFees.toLocaleString()}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-slate-500 italic">Fee structure is currently being updated.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Calendar className="w-5 h-5 text-teal-600" />
                Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex flex-col items-center justify-center shrink-0 border border-teal-100">
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest leading-none mt-1">Start</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Reporting Starts</p>
                    <p className="text-sm text-slate-500">{inst.reportingDateFrom ? new Date(inst.reportingDateFrom).toLocaleDateString() : 'To be announced'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex flex-col items-center justify-center shrink-0 border border-red-100">
                    <span className="text-[10px] font-bold text-red-800 uppercase tracking-widest leading-none mt-1">End</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Reporting Ends</p>
                    <p className="text-sm text-slate-500">{inst.reportingDateTo ? new Date(inst.reportingDateTo).toLocaleDateString() : 'To be announced'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-600 shadow-md bg-gradient-to-br from-teal-800 to-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Clock className="w-24 h-24" /></div>
            <CardContent className="p-6 relative z-10">
              <h3 className="text-lg font-bold mb-2">Ready to apply?</h3>
              <p className="text-teal-100 text-sm mb-6 max-w-[200px] font-medium leading-relaxed">Complete your admission process online in less than 30 minutes.</p>
              <Link href={`/portal/apply/${inst.id}`}>
                <Button className="w-full bg-white text-teal-900 hover:bg-slate-100 shadow-sm font-bold border-0">
                  Start Application
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
