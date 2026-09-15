import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Users, FileText, Package, LayoutDashboard, BedDouble, CheckSquare, CreditCard, Bell, Plus, AlertCircle, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button, Input } from '@/components/ui/core';
import { useListInventory, useCreateInventoryItem, useUpdateInventoryItem, useGetCurrentUser } from '@workspace/api-client-react';
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

const emptyForm = { name: '', description: '', category: '', requiredQuantity: '1', unitCost: '', quantityAvailable: '0' };

export default function AdminInventory() {
  const { data: me } = useGetCurrentUser();
  const institutionId = me?.institutionId;
  const { data: items, isLoading, refetch } = useListInventory({ institutionId: institutionId! }, { query: { enabled: !!institutionId } });
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!form.name || !form.unitCost || !institutionId) return;
    const data = { ...form, institutionId, requiredQuantity: Number(form.requiredQuantity), unitCost: form.unitCost, quantityAvailable: Number(form.quantityAvailable) };
    if (editId) {
      updateItem.mutate({ id: editId, data }, { onSuccess: () => { toast({ title: 'Item updated' }); setShowForm(false); setEditId(null); setForm(emptyForm); refetch(); } });
    } else {
      createItem.mutate({ data }, { onSuccess: () => { toast({ title: 'Item added' }); setShowForm(false); setForm(emptyForm); refetch(); } });
    }
  };

  const startEdit = (item: any) => {
    setForm({ name: item.name, description: item.description || '', category: item.category || '', requiredQuantity: String(item.requiredQuantity), unitCost: String(item.unitCost), quantityAvailable: String(item.quantityAvailable) });
    setEditId(item.id);
    setShowForm(true);
  };

  return (
    <DashboardLayout title="Inventory" links={adminLinks}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Items</h2>
          <p className="text-slate-500 font-medium">Manage school requirement items and stock levels.</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 font-bold" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {showForm && (
        <Card className="border-teal-200 bg-teal-50/30 shadow-sm mb-6">
          <CardHeader><CardTitle className="text-base font-bold text-slate-900">{editId ? 'Edit Item' : 'New Item'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Name *</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. School Uniform" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Category</label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Uniform" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Unit Cost (KES) *</label><Input type="number" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: e.target.value })} placeholder="1500" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Required Qty</label><Input type="number" value={form.requiredQuantity} onChange={e => setForm({ ...form, requiredQuantity: e.target.value })} /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Stock Available</label><Input type="number" value={form.quantityAvailable} onChange={e => setForm({ ...form, quantityAvailable: e.target.value })} /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Description</label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional" /></div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSubmit} disabled={createItem.isPending || updateItem.isPending}>{editId ? 'Update' : 'Add'} Item</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Req. Qty</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-slate-500">Loading...</TableCell></TableRow>
              ) : !items?.length ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-slate-500">No inventory items yet.</TableCell></TableRow>
              ) : items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    {item.description && <div className="text-xs text-slate-400">{item.description}</div>}
                  </TableCell>
                  <TableCell><Badge className="bg-slate-100 text-slate-600 shadow-none border-0 text-xs font-semibold">{item.category || '—'}</Badge></TableCell>
                  <TableCell className="text-right font-mono font-semibold text-slate-700">KES {Number(item.unitCost).toLocaleString()}</TableCell>
                  <TableCell className="text-right text-slate-600">{item.requiredQuantity}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold ${item.isLowStock ? 'text-red-600' : 'text-teal-700'}`}>{item.quantityAvailable}</span>
                    {item.isLowStock && <AlertCircle className="inline w-3 h-3 ml-1 text-red-500" />}
                  </TableCell>
                  <TableCell className="text-right text-slate-600">{item.quantitySold}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => startEdit(item)} className="font-semibold text-slate-600">
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
