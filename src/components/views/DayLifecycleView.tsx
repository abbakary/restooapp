import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Clock, 
  Lock, 
  Unlock, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Calendar,
  FileText
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { DayEndReport } from '../../types/erp';
import { FullWidthFormModal, ActionButtonConfig } from '../common/FullWidthFormModal';

export const DayLifecycleView: React.FC = () => {
  const { 
    checklists, 
    toggleChecklist, 
    executeDayEndClose, 
    reopenDay, 
    dayStatus, 
    dayEndReports, 
    orders, 
    currentSite, 
    currentRole 
  } = useErp();

  const [closeWizardOpen, setCloseWizardOpen] = useState(false);
  const [countedCash, setCountedCash] = useState<number>(1450000);
  const [currentZReport, setCurrentZReport] = useState<DayEndReport | null>(null);

  const phases = ['Opening', 'HACCP Temperature', 'Closing'] as const;

  const handleRunDayClose = () => {
    const report = executeDayEndClose(countedCash);
    setCurrentZReport(report);
    setCloseWizardOpen(false);
  };

  const closeActionButtons: ActionButtonConfig[] = [
    {
      label: 'Cancel',
      onClick: () => setCloseWizardOpen(false),
      variant: 'secondary'
    },
    {
      label: 'Lock Business Day & Generate Official Z-Report',
      onClick: handleRunDayClose,
      variant: 'danger',
      icon: <Lock className="w-3.5 h-3.5" />,
      requiredRole: ['Owner', 'Site Mgr']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Site Day Lifecycle Automation & Compliance Checklists
          </h1>
          <p className="text-xs text-slate-500">
            Shift opening verification → Midday HACCP temperature probes → Day-end blind cash count & Z-Report lock
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dayStatus === 'CLOSED' ? (
            <button
              onClick={reopenDay}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Unlock className="w-4 h-4" />
              <span>Reopen Business Day (Emergency)</span>
            </button>
          ) : (
            <button
              onClick={() => setCloseWizardOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Initiate Day-End Closing & Z-Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Phase Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {phases.map(phase => {
          const items = checklists.filter(c => c.phase === phase);
          const completedCount = items.filter(c => c.completed).length;

          return (
            <div key={phase} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">{phase} Routine</h3>
                  <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {completedCount} / {items.length} Done
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {items.map(chk => (
                    <div 
                      key={chk.id} 
                      onClick={() => toggleChecklist(chk.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${chk.completed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={chk.completed}
                          onChange={() => {}} // handled by parent div
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold ${chk.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {chk.task}
                          </div>
                          {chk.recordedValue && (
                            <div className="text-xs font-mono text-emerald-700 font-bold mt-1">
                              Recorded: {chk.recordedValue}
                            </div>
                          )}
                          {chk.signedBy && (
                            <div className="text-2xs text-slate-400 mt-0.5">
                              Signed: {chk.signedBy}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
                Phase sign-off logged with tamper-evident timestamp.
              </div>
            </div>
          );
        })}
      </div>

      {/* Z-Report Archive / Active Preview */}
      {(currentZReport || dayEndReports.length > 0) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 max-w-3xl mx-auto space-y-4">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Official Fiscal Z-Report (End of Day Close)</h3>
                <p className="text-xs text-slate-500">Business Date: {(currentZReport || dayEndReports[0]).date}</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer inline-flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Z-Report</span>
            </button>
          </div>

          {(() => {
            const report = currentZReport || dayEndReports[0];
            return (
              <div className="space-y-2 text-xs font-mono divide-y divide-slate-100">
                <div className="pt-2 flex justify-between">
                  <span className="font-sans text-slate-600">Site Outlet:</span>
                  <span className="font-bold text-slate-900">{report.siteName}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="font-sans text-slate-600">Day Closed By:</span>
                  <span className="text-slate-900">{report.closedBy}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="font-sans text-slate-600">Opening Cash Float:</span>
                  <span className="text-slate-900">TZS {report.openingFloat.toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between font-bold text-slate-900">
                  <span className="font-sans text-slate-900">Net Sales Revenue:</span>
                  <span className="text-emerald-800">TZS {report.netSales.toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between text-slate-700">
                  <span className="font-sans">VAT (18%) EFD Collected:</span>
                  <span>TZS {report.taxCollected.toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between text-slate-700">
                  <span className="font-sans">Service Charge (5%):</span>
                  <span>TZS {report.serviceCharge.toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between font-bold">
                  <span className="font-sans text-slate-800">Expected Cash on Hand:</span>
                  <span>TZS {report.cashCollectedExpected.toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between font-bold">
                  <span className="font-sans text-slate-800">Actual Blind Cash Counted:</span>
                  <span className="text-slate-900">TZS {report.cashCountedActual.toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between font-bold">
                  <span className="font-sans">Cash Over / (Short) Variance:</span>
                  <span className={report.cashOverShort >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    TZS {report.cashOverShort.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 flex justify-between text-slate-700">
                  <span className="font-sans">M-Pesa / Mobile Money Settlement:</span>
                  <span>TZS {report.mobileMoneyPayments.toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between text-slate-700">
                  <span className="font-sans">Card Batch Total:</span>
                  <span>TZS {report.cardPayments.toLocaleString()}</span>
                </div>
                <div className="pt-2 flex justify-between text-slate-700">
                  <span className="font-sans">Total Guest Covers:</span>
                  <span>{report.totalCovers} Covers</span>
                </div>
                <div className="pt-2 flex justify-between text-rose-700">
                  <span className="font-sans">Voids / Comps Count:</span>
                  <span>{report.voidCount} (TZS {report.voidTotal.toLocaleString()})</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Full Width 12 Day Close Wizard Modal */}
      <FullWidthFormModal
        isOpen={closeWizardOpen}
        onClose={() => setCloseWizardOpen(false)}
        title="Execute Business Day-End Closing & Cash Reconciliation"
        subtitle="12-column daily closing wizard: blind cash count, open tab auto-closure, and finance ledger lock"
        currentRole={currentRole}
        actionButtons={closeActionButtons}
      >
        <div className="col-span-12 md:col-span-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-900">Automated Day Audit Checks</div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Open table checks automatically reconciled</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Theoretical inventory depletion snapshot locked</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>EFD fiscal audit trail transmitted to HQ</span>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
          <label className="block font-bold text-amber-950">Blind Cash Count Verification (TZS)</label>
          <input
            type="number"
            value={countedCash}
            onChange={(e) => setCountedCash(Number(e.target.value) || 0)}
            placeholder="Count physical notes and coins in safe"
            className="w-full px-3 py-2 text-base font-bold font-mono rounded-lg border border-amber-300 bg-white"
          />
          <p className="text-xs text-amber-800">
            Manager PIN authorization required to proceed. Cash variances will be posted to Account 5040 (Cash Over/Short).
          </p>
        </div>
      </FullWidthFormModal>
    </div>
  );
};
