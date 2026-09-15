import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Search, FileText, Bell, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui/core';
import { useListApplications } from '@workspace/api-client-react';
import { Link } from 'wouter';

export default function PortalDashboard() {
  const links = [
    { href: '/portal', label: 'Dashboard', icon: Home },
    { href: '/portal/institutions', label: 'Browse Institutions', icon: Search },
    { href: '/portal/applications', label: 'My Applications', icon: FileText },
    { href: '/portal/notifications', label: 'Notifications', icon: Bell },
  ];

  const { data: applications, isLoading } = useListApplications();

  return (
    <DashboardLayout title="Parent Dashboard" links={links}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-slate-600 font-medium">Manage your student admissions and applications.</p>
        </div>
        <Link href="/portal/institutions">
          <Button className="bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 font-semibold gap-2">
            <PlusCircle className="w-4 h-4" />
            New Application
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-teal-800">
              {isLoading ? '-' : (applications?.length || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-amber-600">0</div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">Recent Applications</h3>
      
      {isLoading ? (
        <div className="animate-pulse bg-white rounded-xl h-32 border border-slate-100"></div>
      ) : (!applications || applications.length === 0) ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">No applications yet</h4>
            <p className="text-slate-500 mb-6 font-medium max-w-sm">You haven't started any admission applications. Browse institutions to begin.</p>
            <Link href="/portal/institutions">
              <Button variant="outline" className="font-semibold">Browse Institutions</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Applications list will go here */}
        </div>
      )}
    </DashboardLayout>
  );
}
