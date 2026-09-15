import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/react';
import { useLocation, Route, Switch, Redirect } from 'wouter';
import { useSyncUser, useGetCurrentUser } from '@workspace/api-client-react';

// Portal (Parent)
import PortalDashboard from '@/pages/portal/dashboard';
import PortalInstitutions from '@/pages/portal/institutions';
import InstitutionDetail from '@/pages/portal/institution-detail';
import ApplyWizard from '@/pages/portal/apply/[institutionId]';
import PortalApplications from '@/pages/portal/applications';
import PortalNotifications from '@/pages/portal/notifications';

// Admin (Staff)
import AdminDashboard from '@/pages/admin/dashboard';
import AdminApplications from '@/pages/admin/applications';
import AdminStudents from '@/pages/admin/students';
import AdminDocuments from '@/pages/admin/documents';
import AdminInventory from '@/pages/admin/inventory';
import AdminClasses from '@/pages/admin/classes';
import AdminDormitories from '@/pages/admin/dormitories';
import AdminAllocations from '@/pages/admin/allocations';
import AdminPayments from '@/pages/admin/payments';
import AdminNotifications from '@/pages/admin/notifications';
import AdminAuditLogs from '@/pages/admin/audit-logs';

// Super Admin
import SuperAdminDashboard from '@/pages/super-admin/dashboard';
import SuperAdminInstitutions from '@/pages/super-admin/institutions';
import SuperAdminUsers from '@/pages/super-admin/users';
import SuperAdminAuditLogs from '@/pages/super-admin/audit-logs';

export default function DashboardRouter() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { data: dbUser, isLoading: dbUserLoading, refetch } = useGetCurrentUser({ query: { enabled: !!user } });

  const syncUser = useSyncUser();
  const syncUserRef = useRef(syncUser.mutate);
  syncUserRef.current = syncUser.mutate;

  const [location, setLocation] = useLocation();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (user && !dbUserLoading && !dbUser && !hasSynced.current) {
      hasSynced.current = true;
      syncUserRef.current({
        data: {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? '',
          fullName: user.fullName,
        }
      }, {
        onSuccess: () => { refetch(); }
      });
    }
  }, [user, dbUser, dbUserLoading, refetch]);

  if (!clerkLoaded || (user && (dbUserLoading || (!dbUser && hasSynced.current)))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Redirect to="/" />;

  if (!dbUser) {
    return (
      <div className="flex h-screen w-full flex-col gap-4 items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
        <p className="text-sm text-slate-500 font-medium">Setting up your account...</p>
      </div>
    );
  }

  const role = dbUser.role;

  if (location === '/dashboard-router') {
    if (role === 'parent') return <Redirect to="/portal" />;
    if (role === 'super_admin') return <Redirect to="/super-admin" />;
    return <Redirect to="/admin" />;
  }

  return (
    <Switch>
      {/* Portal Routes */}
      <Route path="/portal" component={PortalDashboard} />
      <Route path="/portal/institutions" component={PortalInstitutions} />
      <Route path="/portal/institutions/:id" component={InstitutionDetail} />
      <Route path="/portal/apply/:institutionId" component={ApplyWizard} />
      <Route path="/portal/applications" component={PortalApplications} />
      <Route path="/portal/notifications" component={PortalNotifications} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/applications" component={AdminApplications} />
      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/documents" component={AdminDocuments} />
      <Route path="/admin/inventory" component={AdminInventory} />
      <Route path="/admin/classes" component={AdminClasses} />
      <Route path="/admin/dormitories" component={AdminDormitories} />
      <Route path="/admin/allocations" component={AdminAllocations} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route path="/admin/audit-logs" component={AdminAuditLogs} />

      {/* Super Admin Routes */}
      <Route path="/super-admin" component={SuperAdminDashboard} />
      <Route path="/super-admin/institutions" component={SuperAdminInstitutions} />
      <Route path="/super-admin/users" component={SuperAdminUsers} />
      <Route path="/super-admin/audit-logs" component={SuperAdminAuditLogs} />

      <Route>
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
          <p className="text-slate-500 mb-6">This page doesn't exist or you lack permission to view it.</p>
          <button onClick={() => setLocation('/dashboard-router')} className="text-teal-600 font-semibold hover:underline">
            Return to Dashboard
          </button>
        </div>
      </Route>
    </Switch>
  );
}
