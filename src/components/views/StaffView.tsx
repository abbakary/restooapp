import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Employee, UserRole } from '../../types/erp';
import { FullWidthFormModal, ActionButtonConfig } from '../common/FullWidthFormModal';

export const StaffView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, toggleEmployeeClockIn, currentRole, currentSite, orders } = useErp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    role: 'Waiter',
    employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    phone: '+255 754 000 000',
    email: '',
    siteId: currentSite.id,
    hourlyRate: 7000,
    weeklyHours: 40,
    healthCertExpiry: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    certStatus: 'Valid'
  });

  const roles: UserRole[] = ['Owner', 'Site Mgr', 'Area Mgr', 'Cashier', 'Waiter', 'Chef', 'Storekeeper', 'Finance'];

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const clockedInCount = employees.filter(e => e.clockedIn).length;
  const expiringCertsCount = employees.filter(e => e.certStatus === 'Expiring Soon' || e.certStatus === 'Expired').length;

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      name: '',
      role: 'Waiter',
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      phone: '+255 7',
      email: '',
      siteId: currentSite.id,
      hourlyRate: 7500,
      weeklyHours: 40,
      healthCertExpiry: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      certStatus: 'Valid'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData(emp);
    setModalOpen(true);
  };

  const handleSaveEmp = () => {
    if (!formData.name || !formData.role) return;

    if (editingEmp) {
      updateEmployee({
        ...(formData as Employee),
        id: editingEmp.id
      });
    } else {
      addEmployee({
        name: formData.name || 'Staff Member',
        role: formData.role || 'Waiter',
        employeeId: formData.employeeId || 'EMP-999',
        phone: formData.phone || '+255 700 000 000',
        email: formData.email || 'staff@safari-resto.com',
        siteId: currentSite.id,
        hourlyRate: Number(formData.hourlyRate) || 7000,
        weeklyHours: Number(formData.weeklyHours) || 40,
        healthCertExpiry: formData.healthCertExpiry || '2027-01-01',
        certStatus: formData.certStatus || 'Valid'
      });
    }
    setModalOpen(false);
  };

  const actionButtons: ActionButtonConfig[] = [
    {
      label: 'Cancel',
      onClick: () => setModalOpen(false),
      variant: 'secondary'
    },
    {
      label: editingEmp ? 'Update Employee Record' : 'Enroll Staff Member',
      onClick: handleSaveEmp,
      variant: 'primary',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      requiredRole: ['Owner', 'Site Mgr', 'Finance']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Staff Directory, Time & Attendance, and Health Certification Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Real-time biometric/PIN clock-in · Food handler regulatory certifications · Labor cost % optimization
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Currently Clocked-In on Floor</div>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
            {clockedInCount} / {employees.length} Staff
          </div>
          <div className="text-xs text-emerald-600 mt-1">Ready for shift peak rush</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Food-Handler Health Certifications</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {expiringCertsCount} Expiry Alerts
          </div>
          <div className="text-xs text-amber-600 mt-1">Municipal health compliance check pending</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Weekly Payroll Budget Burn</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            TZS {employees.reduce((sum, e) => sum + (e.hourlyRate * e.weeklyHours), 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Based on approved roster schedule</div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Staff Rostering & Time Tracking</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Role</th>
                <th className="p-3">Contact</th>
                <th className="p-3 text-right">Hourly Rate</th>
                <th className="p-3">Shift Status</th>
                <th className="p-3">Health Cert Expiry</th>
                <th className="p-3 text-center">Clock Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="p-3 font-sans">
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-2xs text-slate-400 font-mono">{emp.employeeId}</div>
                  </td>
                  <td className="p-3 font-sans font-medium text-slate-700">{emp.role}</td>
                  <td className="p-3 text-slate-500">{emp.phone}</td>
                  <td className="p-3 text-right tabular-nums">TZS {emp.hourlyRate.toLocaleString()}</td>
                  <td className="p-3 font-sans">
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded ${emp.clockedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {emp.clockedIn ? `In @ ${emp.clockInTime}` : 'Off-Duty'}
                    </span>
                  </td>
                  <td className="p-3 font-sans">
                    <span className={`text-2xs font-semibold px-2 py-0.5 rounded ${emp.certStatus === 'Valid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800 font-bold'}`}>
                      {emp.healthCertExpiry} ({emp.certStatus})
                    </span>
                  </td>
                  <td className="p-3 text-center font-sans">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleEmployeeClockIn(emp.id)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${emp.clockedIn ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
                      >
                        {emp.clockedIn ? 'Clock Out' : 'Clock In'}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Width 12 Grid Add/Edit Staff Modal */}
      <FullWidthFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEmp ? `Edit Staff Member: ${editingEmp.name}` : 'Enroll New Restaurant Team Member'}
        subtitle="12-column employee enrollment with regulatory food handler health tracking"
        currentRole={currentRole}
        actionButtons={actionButtons}
      >
        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID</label>
          <input
            type="text"
            value={formData.employeeId || ''}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono uppercase"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Role / Persona</label>
          <select
            value={formData.role || 'Waiter'}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Wage (TZS)</label>
          <input
            type="number"
            value={formData.hourlyRate || 7000}
            onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono font-bold"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Rostered Weekly Hours</label>
          <input
            type="number"
            value={formData.weeklyHours || 40}
            onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Food Handler Medical Cert Expiry</label>
          <input
            type="date"
            value={formData.healthCertExpiry}
            onChange={(e) => setFormData({ ...formData, healthCertExpiry: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>
      </FullWidthFormModal>
    </div>
  );
};
