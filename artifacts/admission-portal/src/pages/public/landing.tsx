import { Link } from 'wouter';
import { Button } from '@/components/ui/core';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
          <span className="font-bold text-xl tracking-tight text-teal-800">SmartAdmissions</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors">Sign In</Link>
          <Link href="/sign-up" className="bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-800 transition-colors shadow-sm">Get Started</Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-sm font-semibold mb-8">
          <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
          Now admitting for 2024 Academic Year
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 text-slate-900">
          The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-700">Institution Admissions</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium">
          A civic-grade platform digitalizing the entire admission process in Kenya. From application to check-in, reducing the physical reporting process to under 30 minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/sign-up" className="bg-teal-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 flex-1 sm:flex-none text-center">
            Parent / Student Portal
          </Link>
          <Link href="/sign-in" className="bg-white border border-slate-200 text-slate-800 px-8 py-4 rounded-xl text-base font-semibold hover:bg-slate-50 transition-all shadow-sm flex-1 sm:flex-none text-center">
            Institution Staff Portal
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Documents</h3>
            <p className="text-slate-600">Upload and verify admission letters, birth certificates, and NEMIS data securely online.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Integrated Payments</h3>
            <p className="text-slate-600">Pay tuition, boarding, and activity fees seamlessly via M-Pesa, Airtel Money, or Bank Transfer.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Streamlined Check-in</h3>
            <p className="text-slate-600">Arrive on reporting day with stream and dormitory allocations already assigned.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
