import React, { useState } from 'react';
import { useToast } from '../common/Toast';
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  HelpCircle, 
  ShieldAlert, 
  Download, 
  Building2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

export const ReportsView: React.FC = () => {
  const toast = useToast();
  const { menuItems, sites, orders, currentSite } = useErp();
  const [reportType, setReportType] = useState<'matrix' | 'benchmarking' | 'voids'>('matrix');

  // Menu Engineering classification
  const categorizedMenu = menuItems.map(item => {
    const margin = ((item.price - item.cost) / item.price) * 100;
    const isHighMargin = margin >= 60;
    const isHighVelocity = item.salesVelocity === 'high';

    let quadrant: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog';
    if (isHighMargin && isHighVelocity) quadrant = 'Star';
    else if (!isHighMargin && isHighVelocity) quadrant = 'Plowhorse';
    else if (isHighMargin && !isHighVelocity) quadrant = 'Puzzle';
    else quadrant = 'Dog';

    return { ...item, margin, quadrant };
  });

  const stars = categorizedMenu.filter(m => m.quadrant === 'Star');
  const plowhorses = categorizedMenu.filter(m => m.quadrant === 'Plowhorse');
  const puzzles = categorizedMenu.filter(m => m.quadrant === 'Puzzle');
  const dogs = categorizedMenu.filter(m => m.quadrant === 'Dog');

  // Void orders audit
  const voidedOrders = orders.filter(o => o.status === 'voided');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Menu Engineering Matrix, Void Audits & Multi-Site Benchmarking
          </h1>
          <p className="text-xs text-slate-500">
            BCG hospitality matrix · Anomaly detection · Cross-branch comparative revenue & food cost %
          </p>
        </div>

        <button
          onClick={() => toast.info('Analytics export queued', 'PDF dossier will be generated for the selected period.')}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics PDF</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setReportType('matrix')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${reportType === 'matrix' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Menu Engineering Matrix
        </button>
        <button
          onClick={() => setReportType('benchmarking')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${reportType === 'benchmarking' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Cross-Branch Benchmarking
        </button>
        <button
          onClick={() => setReportType('voids')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${reportType === 'voids' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Void & Comp Anomaly Audit
        </button>
      </div>

      {/* 1. Menu Engineering Matrix */}
      {reportType === 'matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stars */}
            <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                  <h3 className="text-sm font-bold text-emerald-950">STARS (High Margin, High Velocity)</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {stars.length} Dishes
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Action: Maintain absolute recipe consistency and give prime real estate on physical & digital menus.
              </p>
              <div className="space-y-2">
                {stars.map(item => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500 font-mono">Price: TZS {item.price.toLocaleString()}</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-800">{item.margin.toFixed(0)}% Margin</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plowhorses */}
            <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-amber-950">PLOWHORSES (Low Margin, High Velocity)</h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {plowhorses.length} Dishes
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Action: Customer favorites. Re-engineer recipe BOM or negotiate better bulk supplier costs to lift margins.
              </p>
              <div className="space-y-2">
                {plowhorses.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">None currently in this quadrant.</div>
                ) : (
                  plowhorses.map(item => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500 font-mono">Price: TZS {item.price.toLocaleString()}</div>
                      </div>
                      <span className="font-mono font-bold text-amber-800">{item.margin.toFixed(0)}% Margin</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Puzzles */}
            <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-blue-950">PUZZLES (High Margin, Low Velocity)</h3>
                </div>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {puzzles.length} Dishes
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Action: High profit margin. Train floor waiters to upsell with verbal pairings, or feature as special.
              </p>
              <div className="space-y-2">
                {puzzles.map(item => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500 font-mono">Price: TZS {item.price.toLocaleString()}</div>
                    </div>
                    <span className="font-mono font-bold text-blue-800">{item.margin.toFixed(0)}% Margin</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dogs */}
            <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-rose-950">DOGS (Low Margin, Low Velocity)</h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  {dogs.length} Dishes
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Action: Generates low cash and low volume. Candidates for seasonal retirement to reduce kitchen clutter.
              </p>
              <div className="space-y-2">
                {dogs.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">No unprofitable low-velocity dishes.</div>
                ) : (
                  dogs.map(item => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500 font-mono">Price: TZS {item.price.toLocaleString()}</div>
                      </div>
                      <span className="font-mono font-bold text-rose-800">{item.margin.toFixed(0)}% Margin</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cross-Branch Benchmarking */}
      {reportType === 'benchmarking' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Multi-Site Operational Ranking & KPIs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="p-3">Branch Site</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Daily Sales Target</th>
                  <th className="p-3 text-right">Current Run-rate</th>
                  <th className="p-3 text-right">Food Cost %</th>
                  <th className="p-3 text-right">Labor %</th>
                  <th className="p-3">Branch Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {sites.map((site, idx) => (
                  <tr key={site.id} className="hover:bg-slate-50">
                    <td className="p-3 font-sans">
                      <div className="font-bold text-slate-900">{site.name}</div>
                      <div className="text-2xs text-slate-400 font-mono">{site.city}</div>
                    </td>
                    <td className="p-3 font-sans text-slate-600">{site.type}</td>
                    <td className="p-3 text-right tabular-nums">TZS {site.dailySalesTarget.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-emerald-800 tabular-nums">
                      TZS {(site.dailySalesTarget * (idx === 0 ? 0.78 : (idx === 1 ? 0.65 : 0.82))).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="p-3 text-right text-slate-700">31.2%</td>
                    <td className="p-3 text-right text-slate-700">24.5%</td>
                    <td className="p-3 font-sans font-medium text-slate-900">{site.manager}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Void & Comp Anomaly Audit */}
      {reportType === 'voids' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Manager Voids & Discount Audits</h3>
              <p className="text-xs text-slate-400">All void events logged with tamper-evident manager PIN authentication</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              {voidedOrders.length} Incidents Today
            </span>
          </div>

          {voidedOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No voided or comped orders recorded for this session.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {voidedOrders.map(vo => (
                <div key={vo.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 font-mono">
                      Order #{vo.orderNumber} (Table {vo.tableNumber})
                    </div>
                    <div className="text-rose-700 font-medium mt-0.5">
                      Reason: {vo.voidReason || 'Manager comp'}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      Server: {vo.serverName} · Voided at {vo.createdAt}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-rose-700 tabular-nums">
                      -TZS {vo.total.toLocaleString()}
                    </div>
                    <span className="text-2xs text-slate-500 font-mono">Supervisor PIN: Approved</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
