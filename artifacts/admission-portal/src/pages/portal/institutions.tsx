import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Search, FileText, Bell, MapPin, GraduationCap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@/components/ui/core';
import { useListInstitutions } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { useState } from 'react';

export default function PortalInstitutions() {
  const links = [
    { href: '/portal', label: 'Dashboard', icon: Home },
    { href: '/portal/institutions', label: 'Browse Institutions', icon: Search },
    { href: '/portal/applications', label: 'My Applications', icon: FileText },
    { href: '/portal/notifications', label: 'Notifications', icon: Bell },
  ];

  const [search, setSearch] = useState("");
  const { data: institutions, isLoading } = useListInstitutions({ search: search || undefined });

  return (
    <DashboardLayout title="Browse Institutions" links={links}>
      <div className="mb-8">
        <div className="max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search by school name, county, or category..." 
            className="pl-10 h-12 text-base rounded-xl border-slate-200 shadow-sm focus-visible:ring-teal-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-64 border border-slate-100 shadow-sm"></div>
          ))}
        </div>
      ) : (!institutions || institutions.length === 0) ? (
        <div className="py-12 text-center text-slate-500 font-medium">
          No institutions found matching your search.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutions.map(inst => (
            <Card key={inst.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="h-32 bg-slate-100 relative">
                {/* Fallback pattern for header */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:16px_16px]"></div>
                {inst.logoUrl && (
                  <div className="absolute -bottom-6 left-6 w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex items-center justify-center">
                    <img src={inst.logoUrl} alt={inst.name} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                {!inst.logoUrl && (
                  <div className="absolute -bottom-6 left-6 w-16 h-16 bg-teal-50 rounded-xl shadow-sm border border-slate-100 p-2 flex items-center justify-center text-teal-700">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                )}
              </div>
              <CardContent className="pt-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{inst.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mb-4">
                  <MapPin className="w-4 h-4" />
                  {inst.county}
                </div>
                <div className="flex gap-2 mb-6 flex-wrap">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 capitalize tracking-wider text-[10px]">
                    {inst.level}
                  </Badge>
                  {inst.category && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 capitalize tracking-wider text-[10px]">
                      {inst.category}
                    </Badge>
                  )}
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <Link href={`/portal/institutions/${inst.id}`}>
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 font-semibold">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
