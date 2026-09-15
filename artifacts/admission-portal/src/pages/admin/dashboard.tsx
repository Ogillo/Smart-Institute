import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell, ClipboardList, TrendingUp, UserCheck, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/core';
import { useGetCurrentUser, useGetInstitutionDashboard, useGetApplicationPipeline, useGetRecentActivity, useGetRevenueSummary } from '@workspace/api-client-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

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
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
];

export default function AdminDashboard() {
  const { data: me } = useGetCurrentUser();
  const institutionId = me?.institutionId;

  const { data: stats } = useGetInstitutionDashboard(institutionId!, { query: { enabled: !!institutionId } });
  const { data: pipeline } = useGetApplicationPipeline({ institutionId: institutionId }, { query: { enabled: !!institutionId } });
  const { data: revenue } = useGetRevenueSummary({}, { query: { enabled: !!institutionId } });
  const { data: activity } = useGetRecentActivity({ limit: 8 });

  const statCards = [
    { label: 'Total Applications', value: stats?.totalApplications ?? '—', color: 'text-teal-700', icon: FileText },
    { label: 'Pending Documents', value: stats?.pendingDocuments ?? '—', color: 'text-amber-600', icon: AlertTriangle },
    { label: 'Checked In Today', value: stats?.checkedInToday ?? '—', color: 'text-blue-600', icon: UserCheck },
    { label: 'Revenue', value: stats?.totalRevenue != null ? `KES ${Number(stats.totalRevenue).toLocaleString()}` : '—', color: 'text-slate-900', icon: TrendingUp },
    { label: 'Inventory Alerts', value: stats?.inventoryAlerts ?? '—', color: 'text-red-600', icon: Package },
    { label: 'Dorm Occupancy', value: stats?.dormitoryOccupancy != null ? `${stats.dormitoryOccupancy}%` : '—', color: 'text-indigo-600', icon: BedDouble },
    { label: 'Pending Payments', value: stats?.pendingPayments ?? '—', color: 'text-amber-700', icon: CreditCard },
    { label: 'Approved', value: stats?.approvedApplications ?? '—', color: 'text-green-700', icon: CheckSquare },
  ];

  return (
    <DashboardLayout title="Institution Dashboard" links={adminLinks}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {me?.institution?.name ? `${me.institution.name}` : 'Overview'}
        </h2>
        <p className="text-slate-500 font-medium">Institution performance at a glance.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">{label}</p>
              </div>
              <p className={`text-2xl font-extrabold ${color}`}>{String(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {pipeline?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">No application data yet</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto max-h-60">
            {activity?.length ? (
              <div className="space-y-3">
                {(activity as any[]).map((item: any) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{item.description}</p>
                      <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-400 font-medium text-sm">No activity yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {revenue?.length ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(v: any) => `KES ${Number(v).toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={{ r: 3, fill: '#0d9488' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}
    </DashboardLayout>
  );
}
