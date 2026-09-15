import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Search, FileText, Bell, Clock, CheckCircle2, XCircle, AlertCircle, Eye } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui/core';
import { useListApplications } from '@workspace/api-client-react';
import { Link } from 'wouter';

export default function PortalApplications() {
  const links = [
    { href: '/portal', label: 'Dashboard', icon: Home },
    { href: '/portal/institutions', label: 'Browse Institutions', icon: Search },
    { href: '/portal/applications', label: 'My Applications', icon: FileText },
    { href: '/portal/notifications', label: 'Notifications', icon: Bell },
  ];

  const { data: applications, isLoading } = useListApplications();

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return Clock;
      case 'pending': return Clock;
      case 'under_review': return AlertCircle;
      case 'approved': return CheckCircle2;
      case 'rejected': return XCircle;
      case 'checked_in': return CheckCircle2;
      default: return Clock;
    }
  };

  return (
    <DashboardLayout title="My Applications" links={links}>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application History</h2>
        <p className="text-slate-600 mt-1">Track the status of your admission applications.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-xl h-24 border border-slate-100 shadow-sm"></div>
          ))}
        </div>
      ) : (!applications || applications.length === 0) ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No applications found</h3>
            <p className="text-slate-500 mb-8 max-w-md">You haven't applied to any institutions yet. Start by browsing the directory.</p>
            <Link href="/portal/institutions">
              <Button className="bg-teal-600 hover:bg-teal-700 font-bold px-8 py-6 rounded-xl shadow-md">
                Browse Institutions
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const StatusIcon = getStatusIcon(app.status);
            return (
              <Card key={app.id} className="border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-6">
                    {app.institution?.logoUrl ? (
                      <div className="w-16 h-16 bg-white border border-slate-100 rounded-xl p-2 shrink-0 flex items-center justify-center">
                        <img src={app.institution.logoUrl} alt={app.institution.name} className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center shrink-0">
                        <span className="font-bold text-teal-700 text-xl">{app.institution?.name?.charAt(0) || 'I'}</span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{app.institution?.name || 'Unknown Institution'}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="text-sm text-slate-500 font-medium">
                          Student: <span className="text-slate-700">{app.student?.fullName || 'Not provided'}</span>
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                          Applied: <span className="text-slate-700">{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                      <Badge className={`${getStatusColor(app.status)} shadow-none border-0 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {app.status.replace('_', ' ')}
                      </Badge>
                      
                      {app.status === 'draft' || app.status === 'pending' ? (
                        <Link href={`/portal/apply/${app.institutionId}`}>
                          <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800 font-semibold shadow-sm">
                            Continue Setup
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full font-semibold border-slate-200">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
