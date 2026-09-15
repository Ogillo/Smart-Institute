import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui/core';
import { useListNotifications, useSendNotification, useGetCurrentUser } from '@workspace/api-client-react';
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

const TYPES = ['registration', 'verification', 'documents', 'payment', 'allocation', 'reminder', 'announcement', 'emergency'];

export default function AdminNotifications() {
  const { data: me } = useGetCurrentUser();
  const sendNotif = useSendNotification();
  const { toast } = useToast();
  const [form, setForm] = useState({ userIds: '', type: 'announcement', title: '', message: '' });

  const handleSend = () => {
    const userIds = form.userIds.split(',').map(s => Number(s.trim())).filter(n => n > 0);
    if (!userIds.length || !form.title || !form.message) { toast({ title: 'Fill in all fields', variant: 'destructive' }); return; }
    sendNotif.mutate({ data: { userIds, type: form.type as any, title: form.title, message: form.message } }, {
      onSuccess: () => { toast({ title: 'Notification sent' }); setForm({ userIds: '', type: 'announcement', title: '', message: '' }); }
    });
  };

  const typeColors: Record<string, string> = { emergency: 'bg-red-50 text-red-700', announcement: 'bg-blue-50 text-blue-700', reminder: 'bg-amber-50 text-amber-700', payment: 'bg-teal-50 text-teal-700' };

  return (
    <DashboardLayout title="Notifications" links={adminLinks}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Send Notifications</h2>
        <p className="text-slate-500 font-medium">Broadcast messages to parents and students.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader><CardTitle className="text-base font-bold text-slate-900">Compose Notification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Recipient User IDs (comma-separated)</label>
              <Input value={form.userIds} onChange={e => setForm({ ...form, userIds: e.target.value })} placeholder="e.g. 1, 2, 5, 10" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Title *</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Reporting Day Reminder" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Message *</label>
              <textarea className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm min-h-[100px] resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Type your notification message here..." />
            </div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700 font-bold" onClick={handleSend} disabled={sendNotif.isPending}>
              <Send className="w-4 h-4 mr-2" /> {sendNotif.isPending ? 'Sending...' : 'Send Notification'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900">Notification Types Guide</h3>
          {TYPES.map(t => (
            <div key={t} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
              <Badge className={`${typeColors[t] || 'bg-slate-50 text-slate-600'} shadow-none border-0 text-xs font-bold uppercase tracking-wider w-24 justify-center`}>{t}</Badge>
              <p className="text-sm text-slate-600">
                {t === 'emergency' && 'Urgent alerts — sent immediately with high priority.'}
                {t === 'announcement' && 'General school-wide information or updates.'}
                {t === 'reminder' && 'Scheduled reminders for deadlines and reporting.'}
                {t === 'payment' && 'Fee payment receipts and transaction confirmations.'}
                {t === 'registration' && 'Account creation and onboarding messages.'}
                {t === 'verification' && 'Document and admission code verification results.'}
                {t === 'documents' && 'Document upload requests and status updates.'}
                {t === 'allocation' && 'Stream, dormitory, and reporting day details.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
