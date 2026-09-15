import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Search, FileText, Bell } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui/core';
import { useListNotifications, useMarkNotificationRead } from '@workspace/api-client-react';
import { useState } from 'react';

const portalLinks = [
  { href: '/portal', label: 'Dashboard', icon: Home },
  { href: '/portal/institutions', label: 'Browse Institutions', icon: Search },
  { href: '/portal/applications', label: 'My Applications', icon: FileText },
  { href: '/portal/notifications', label: 'Notifications', icon: Bell },
];

const typeColors: Record<string, string> = {
  emergency: 'bg-red-50 border-red-200 text-red-900',
  announcement: 'bg-blue-50 border-blue-200 text-blue-900',
  payment: 'bg-teal-50 border-teal-200 text-teal-900',
  allocation: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  reminder: 'bg-amber-50 border-amber-200 text-amber-900',
  verification: 'bg-green-50 border-green-200 text-green-900',
  documents: 'bg-purple-50 border-purple-200 text-purple-900',
  registration: 'bg-slate-50 border-slate-200 text-slate-900',
};
const typeBadgeColors: Record<string, string> = {
  emergency: 'bg-red-100 text-red-700',
  announcement: 'bg-blue-100 text-blue-700',
  payment: 'bg-teal-100 text-teal-700',
  allocation: 'bg-indigo-100 text-indigo-700',
  reminder: 'bg-amber-100 text-amber-700',
  verification: 'bg-green-100 text-green-700',
  documents: 'bg-purple-100 text-purple-700',
  registration: 'bg-slate-100 text-slate-600',
};

export default function PortalNotifications() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data: notifications, isLoading, refetch } = useListNotifications({ unreadOnly: unreadOnly ? 'true' : undefined });
  const markRead = useMarkNotificationRead();

  const unreadCount = (notifications as any[] | undefined)?.filter((n: any) => !n.isRead).length ?? 0;

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, { onSuccess: () => refetch() });
  };

  return (
    <DashboardLayout title="Notifications" links={portalLinks}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h2>
          <p className="text-slate-500 font-medium">{unreadCount > 0 ? `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}.` : 'All caught up.'}</p>
        </div>
        <Button variant={unreadOnly ? 'default' : 'outline'} className={unreadOnly ? 'bg-teal-600 hover:bg-teal-700 font-bold' : 'font-semibold border-slate-200'} onClick={() => setUnreadOnly(v => !v)}>
          <Bell className="w-4 h-4 mr-2" /> {unreadOnly ? 'Showing Unread' : 'Show Unread Only'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">Loading...</div>
      ) : !(notifications as any[])?.length ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold">{unreadOnly ? 'No unread notifications' : 'No notifications yet'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(notifications as any[]).map((n: any) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition-all ${typeColors[n.type] || 'bg-white border-slate-200'} ${!n.isRead ? 'shadow-sm' : 'opacity-70'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />}
                    <span className="font-bold text-sm">{n.title}</span>
                    <Badge className={`${typeBadgeColors[n.type] || 'bg-slate-100 text-slate-600'} shadow-none border-0 text-[10px] font-bold uppercase tracking-wider`}>{n.type}</Badge>
                  </div>
                  <p className="text-sm leading-relaxed">{n.message}</p>
                  <p className="text-xs mt-2 opacity-60">{new Date(n.createdAt).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {!n.isRead && (
                  <Button size="sm" variant="outline" className="shrink-0 font-semibold text-xs border-current/20 bg-white/50 hover:bg-white/80" onClick={() => handleMarkRead(n.id)} disabled={markRead.isPending}>
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
