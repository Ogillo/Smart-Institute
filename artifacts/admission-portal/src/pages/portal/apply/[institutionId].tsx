import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, Search, FileText, Bell, CheckCircle2, Circle, ChevronRight, UploadCloud, CreditCard, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/core';
import { useParams, useLocation, Link } from 'wouter';
import { 
  useGetInstitution, 
  useCreateApplication, 
  useUpdateApplication,
  useListApplications,
  useVerifyAdmissionCode,
  useCreateStudent,
  useGetInstitutionFeeStructure
} from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

const STEPS = [
  { id: 1, title: 'Confirm Institution', icon: CheckCircle2 },
  { id: 2, title: 'Verify Admission', icon: ShieldCheck },
  { id: 3, title: 'Student Details', icon: FileText },
  { id: 4, title: 'Guardian Info', icon: FileText },
  { id: 5, title: 'Upload Documents', icon: UploadCloud },
  { id: 6, title: 'Fee Payment', icon: CreditCard },
  { id: 7, title: 'Completion', icon: CheckCircle2 },
];

export default function ApplyWizard() {
  const { institutionId } = useParams();
  const instId = institutionId ? parseInt(institutionId, 10) : 0;
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: inst } = useGetInstitution(instId, { query: { enabled: !!instId } });
  
  // Find or create application
  const { data: applications, refetch: refetchApps } = useListApplications({ institutionId: instId });
  const createApplication = useCreateApplication();
  const updateApplication = useUpdateApplication();
  const verifyCode = useVerifyAdmissionCode();
  const createStudent = useCreateStudent();
  const { data: feeStructure } = useGetInstitutionFeeStructure(instId, { query: { enabled: !!instId } });

  const app = applications?.[0]; // Get the first one for this institution if exists
  const currentStep = app?.step || 1;

  const [admissionCode, setAdmissionCode] = useState('');
  
  // Student form state
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    gender: 'male',
    dateOfBirth: '',
    assessmentNumber: '',
    religion: '',
    county: '',
    previousSchool: ''
  });

  const links = [
    { href: '/portal', label: 'Dashboard', icon: Home },
    { href: '/portal/institutions', label: 'Browse Institutions', icon: Search },
    { href: '/portal/applications', label: 'My Applications', icon: FileText },
  ];

  const handleCreateApplication = () => {
    if (!app) {
      createApplication.mutate({ data: { institutionId: instId } }, {
        onSuccess: () => {
          refetchApps();
          toast({ title: "Application started" });
        }
      });
    } else {
      handleNextStep();
    }
  };

  const handleNextStep = () => {
    if (app) {
      updateApplication.mutate({ id: app.id, data: { step: currentStep + 1 } }, {
        onSuccess: () => { refetchApps(); }
      });
    }
  };

  const handleVerifyCode = () => {
    if (app && admissionCode) {
      verifyCode.mutate({ id: app.id, data: { code: admissionCode, institutionId: instId } }, {
        onSuccess: (res) => {
          if (res.valid) {
            toast({ title: "Admission Verified!" });
            updateApplication.mutate({ id: app.id, data: { admissionCode, step: 3 } }, {
              onSuccess: () => refetchApps()
            });
          } else {
            toast({ title: "Verification failed", description: res.message || "Invalid code", variant: "destructive" });
          }
        }
      });
    }
  };

  const handleStudentSubmit = () => {
    if (app) {
      createStudent.mutate({
        data: {
          applicationId: app.id,
          fullName: studentForm.fullName,
          gender: studentForm.gender as any,
          dateOfBirth: studentForm.dateOfBirth,
          assessmentNumber: studentForm.assessmentNumber,
          religion: studentForm.religion,
          county: studentForm.county,
          previousSchool: studentForm.previousSchool
        }
      }, {
        onSuccess: () => {
          handleNextStep();
        }
      });
    }
  };

  return (
    <DashboardLayout title="Admission Application" links={links}>
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Progress */}
        <div className="w-full md:w-64 shrink-0">
          <Card className="border-slate-200 shadow-sm sticky top-24">
            <CardContent className="p-4 py-6">
              <h3 className="font-bold text-slate-900 mb-6 px-2">Application Steps</h3>
              <div className="space-y-4">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = currentStep > step.id;
                  const isActive = currentStep === step.id;
                  const isPending = currentStep < step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center gap-3 px-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        isCompleted ? 'bg-teal-600 border-teal-600 text-white' : 
                        isActive ? 'bg-white border-teal-600 text-teal-600' : 
                        'bg-white border-slate-200 text-slate-300'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-bold">{step.id}</span>}
                      </div>
                      <span className={`text-sm font-semibold ${
                        isCompleted ? 'text-slate-900' : 
                        isActive ? 'text-teal-700' : 
                        'text-slate-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <Card className="border-slate-200 shadow-sm min-h-[500px]">
            {currentStep === 1 && (
              <div className="p-8 flex flex-col h-full">
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Confirm Institution</h2>
                  <p className="text-slate-600 mt-1">You are starting an application for the following institution.</p>
                </div>
                
                {inst && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 flex items-center gap-6">
                    {inst.logoUrl ? (
                      <img src={inst.logoUrl} alt={inst.name} className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                        <span className="font-bold text-teal-700 text-xl">{inst.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{inst.name}</h3>
                      <p className="text-slate-600 font-medium text-sm">{inst.county} • {inst.level}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-auto pt-6 border-t border-slate-100 flex justify-end">
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 shadow-md px-8" 
                    onClick={handleCreateApplication}
                    disabled={createApplication.isPending}
                  >
                    Confirm & Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="p-8 flex flex-col h-full">
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verify Admission Letter</h2>
                  <p className="text-slate-600 mt-1">Enter the admission code printed on your official calling letter.</p>
                </div>
                
                <div className="max-w-md mx-auto w-full my-auto py-8">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Admission Code</label>
                  <Input 
                    value={admissionCode} 
                    onChange={e => setAdmissionCode(e.target.value)} 
                    placeholder="e.g. ADM-2024-XXXX" 
                    className="h-12 text-lg text-center tracking-widest font-mono border-slate-300"
                  />
                  <Button 
                    className="w-full mt-6 bg-slate-900 hover:bg-slate-800" 
                    onClick={handleVerifyCode}
                    disabled={!admissionCode || verifyCode.isPending}
                  >
                    Verify Code
                  </Button>
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between">
                  <Button variant="ghost" onClick={() => {}}>Back</Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="p-8 flex flex-col h-full">
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Details</h2>
                  <p className="text-slate-600 mt-1">Provide the student's personal information.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <Input value={studentForm.fullName} onChange={e => setStudentForm({...studentForm, fullName: e.target.value})} placeholder="As per birth certificate" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={studentForm.gender} 
                      onChange={e => setStudentForm({...studentForm, gender: e.target.value})}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Date of Birth</label>
                    <Input type="date" value={studentForm.dateOfBirth} onChange={e => setStudentForm({...studentForm, dateOfBirth: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Assessment Number (KCPE/KPSEA)</label>
                    <Input value={studentForm.assessmentNumber} onChange={e => setStudentForm({...studentForm, assessmentNumber: e.target.value})} placeholder="Index number" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">County of Residence</label>
                    <Input value={studentForm.county} onChange={e => setStudentForm({...studentForm, county: e.target.value})} placeholder="e.g. Nairobi" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Previous School</label>
                    <Input value={studentForm.previousSchool} onChange={e => setStudentForm({...studentForm, previousSchool: e.target.value})} placeholder="Name of primary school" />
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between">
                  <Button variant="ghost">Back</Button>
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 px-8" 
                    onClick={handleStudentSubmit}
                    disabled={!studentForm.fullName || !studentForm.assessmentNumber}
                  >
                    Save & Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="p-8 flex flex-col h-full items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Guardian Information</h2>
                <p className="text-slate-500 mb-8 max-w-md">The next steps will ask for guardian details, document uploads, and fee payments. For this demo, we'll fast forward.</p>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => updateApplication.mutate({ id: app!.id, data: { step: 6 } }, { onSuccess: () => refetchApps() })}>
                  Fast-forward to Payment
                </Button>
              </div>
            )}

            {currentStep === 6 && (
              <div className="p-8 flex flex-col h-full">
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fee Payment</h2>
                  <p className="text-slate-600 mt-1">Complete your initial fee payment to confirm admission.</p>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                  <h3 className="font-bold text-slate-900 mb-4">Amount Due</h3>
                  <div className="text-4xl font-extrabold text-slate-900 mb-2">
                    KES {feeStructure ? (feeStructure.tuitionFee + feeStructure.boardingFee + feeStructure.admissionFee).toLocaleString() : '...'}
                  </div>
                  <p className="text-sm text-slate-500">Includes admission, tuition, and boarding for Term 1.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="border-2 border-teal-600 bg-teal-50 rounded-xl p-4 cursor-pointer relative">
                    <div className="absolute top-4 right-4"><div className="w-4 h-4 rounded-full bg-teal-600 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div></div>
                    <h4 className="font-bold text-slate-900 mb-1">M-Pesa</h4>
                    <p className="text-sm text-slate-600">Paybill 123456</p>
                  </div>
                  <div className="border border-slate-200 bg-white rounded-xl p-4 cursor-pointer hover:border-slate-300">
                    <h4 className="font-bold text-slate-900 mb-1">Bank Transfer</h4>
                    <p className="text-sm text-slate-600">Direct deposit to institution account</p>
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between">
                  <Button variant="ghost">Back</Button>
                  <Button 
                    className="bg-slate-900 hover:bg-slate-800 px-8" 
                    onClick={() => updateApplication.mutate({ id: app!.id, data: { step: 7, status: 'approved' } }, { onSuccess: () => refetchApps() })}
                  >
                    Simulate Payment & Complete <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="p-12 flex flex-col h-full items-center justify-center text-center">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Application Complete!</h2>
                <p className="text-lg text-slate-600 mb-8 max-w-lg">
                  Your admission to {inst?.name} is confirmed. Your stream and dormitory allocation will be available on reporting day.
                </p>
                <div className="flex gap-4">
                  <Link href="/portal/applications">
                    <Button variant="outline" className="px-6 font-bold border-slate-300">View Status</Button>
                  </Link>
                  <Link href="/portal">
                    <Button className="bg-teal-600 hover:bg-teal-700 px-6 font-bold">Go to Dashboard</Button>
                  </Link>
                </div>
              </div>
            )}

          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}

// Dummy icon to satisfy import if not used
function Users(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>; }
