import { Link, useLocation } from 'wouter';
import { useClerk, useUser } from '@clerk/react';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/core';

export function DashboardLayout({ 
  children, 
  title, 
  links 
}: { 
  children: React.ReactNode, 
  title: string, 
  links: { href: string; label: string; icon: any }[] 
}) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [location] = useLocation();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" className="w-7 h-7" />
          <span className="font-extrabold text-teal-800 tracking-tight text-lg">SmartAdmissions</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location === link.href || (link.href !== '/portal' && link.href !== '/admin' && link.href !== '/super-admin' && location.startsWith(link.href));
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  active 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500 font-medium truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5 text-slate-600" />
            </Button>
            <h1 className="font-bold text-xl text-slate-900 tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => signOut({ redirectUrl: basePath || "/" })} 
              className="font-semibold text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4 mr-2 text-slate-400" />
              Logout
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
