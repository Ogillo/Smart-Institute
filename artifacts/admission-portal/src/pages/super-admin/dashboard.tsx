import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LayoutDashboard, Building2, Users, ClipboardList, TrendingUp, AlertTriangle, CheckCircle, School } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/core';
import { useGetSuperAdminDashboard, useGetApplicationPipeline, useGetRevenueSummary } from '@workspace/api-client-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const superAdminLinks = [
  { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super-admin/institutions', label: 'Institutions', icon: Building2 },
  { href: '/super-admin/users', label: 'User Management', icon: Users },
  { href: '/super-admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
];

const PIE_COLORS = ['#0d9488', '#1e3a5f', '#f59e0b', '#6366f1'];

export default function SuperAdminDashboard() {
  const { data: stats } = useGetSuperAdminDashboard();
  const { data: pipeline } = useGetApplicationPipeline({});
  const { data: revenue } = useGetRevenueSummary({});

  const statCards = [
    { label: 'Total Institutions', value: stats?.totalInstitutions ?? '—', color: 'text-slate-900', icon: Building2 },
    { label: 'Pending Approval', value: stats?.pendingInstitutions ?? '—', color: 'text-amber-600', icon: AlertTriangle },
    { label: 'Total Applications', value: stats?.totalApplications ?? '—', color: 'text-teal-700', icon: School },
    { label: 'Total Revenue', value: stats?.totalRevenue != null ? `KES ${Number(stats.totalRevenue).toLocaleString()}` : '—', color: 'text-indigo-700', icon: TrendingUp },
    { label: 'Total Students', value: stats?.totalStudents ?? '—', color: 'text-blue-700', icon: Users },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions ?? '—', color: 'text-green-700', icon: CheckCircle },
  ];

  return (
    <DashboardLayout title="Platform Admin" links={superAdminLinks}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Overview</h2>
        <p className="text-slate-500 font-medium">All institutions, applications, and revenue across the platform.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 mb-8">
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
                  <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">No application data yet</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Institutions by Level</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center">
            {stats?.institutionsByLevel?.length ? (
              <>
                <PieChart width={180} height={160}>
                  <Pie data={stats.institutionsByLevel} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {stats.institutionsByLevel.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                </PieChart>
                <div className="flex gap-4 mt-2">
                  {stats.institutionsByLevel.map((d: any, i: number) => (
                    <div key={d.label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs font-semibold text-slate-600 capitalize">{d.label} ({d.count})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {revenue?.length ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Platform Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(v: any) => `KES ${Number(v).toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={{ r: 3, fill: '#0d9488' }} />
                <Line type="monotone" dataKey="payments" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 3, fill: '#1e3a5f' }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}
    </DashboardLayout>
  );
}
