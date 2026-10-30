import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Site, 
  UserRole, 
  RestaurantTable, 
  MenuItem, 
  Order, 
  InventoryItem, 
  WasteEntry, 
  Supplier, 
  PurchaseOrder, 
  ProductionOrder, 
  JournalEntry, 
  Employee, 
  ChecklistItem, 
  DayEndReport,
  OrderStatus,
  TableStatus,
  CustomerProfile,
  CashDrawerTransaction,
  ServiceMode,
  OrderItem,
  Account,
  JournalMove,
  BankStatementItem,
  VendorBill,
  WaiterProfile,
  CommissionPolicy,
  CommissionTier,
  CommissionPolicySnapshot,
  CommissionLedgerEntry,
  CommissionPayout,
  BillRequest,
  WaiterCashSettlement,
  AuditLogEntry,
  OrderSource
} from '../types/erp';
import { 
  INITIAL_SITES, 
  INITIAL_TABLES, 
  INITIAL_MENU_ITEMS, 
  INITIAL_ORDERS, 
  INITIAL_INVENTORY, 
  INITIAL_SUPPLIERS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_PRODUCTION_ORDERS, 
  INITIAL_JOURNAL_ENTRIES, 
  INITIAL_EMPLOYEES, 
  INITIAL_CHECKLISTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_CASH_DRAWER_TRANSACTIONS 
} from '../data/mockData';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_JOURNAL_MOVES, 
  INITIAL_BANK_STATEMENTS, 
  INITIAL_VENDOR_BILLS 
} from '../data/odooAccountingData';
import {
  INITIAL_WAITER_PROFILES,
  INITIAL_COMMISSION_POLICIES,
  INITIAL_COMMISSION_LEDGER,
  INITIAL_COMMISSION_PAYOUTS,
  INITIAL_BILL_REQUESTS,
  INITIAL_CASH_SETTLEMENTS,
  INITIAL_AUDIT_LOGS
} from '../data/commissionData';

import { landingTabForRole, SELF_REGISTER_ROLES } from '../config/navigation';

const SESSION_KEY = 'restoerp.session.v1';

interface ErpContextType {
  currentSite: Site;
  setCurrentSite: (site: Site) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewMode: 'landing' | 'auth' | 'erp';
  setViewMode: (mode: 'landing' | 'auth' | 'erp') => void;
  isOffline: boolean;
  toggleOffline: () => void;
  sidebarDrawerOpen: boolean;
  setSidebarDrawerOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  sites: Site[];
  tables: RestaurantTable[];
  menuItems: MenuItem[];
  orders: Order[];
  inventory: InventoryItem[];
  wasteEntries: WasteEntry[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  productionOrders: ProductionOrder[];
  journalEntries: JournalEntry[];
  employees: Employee[];
  checklists: ChecklistItem[];
  dayEndReports: DayEndReport[];
  dayStatus: 'OPEN' | 'CLOSING' | 'CLOSED';
  customers: CustomerProfile[];
  cashDrawerTransactions: CashDrawerTransaction[];
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;
  
  // Handlers
  addOrder: (orderData: Partial<Order> & { items: Order['items'] }) => Order;
  addItemsToOrder: (orderId: string, newItems: OrderItem[]) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  requestBill: (orderId: string) => void;
  addCustomer: (cust: Omit<CustomerProfile, 'id' | 'totalOrders' | 'totalSpend' | 'loyaltyPoints' | 'lastVisit'>) => CustomerProfile;
  updateCustomer: (cust: CustomerProfile) => void;
  addCashDrawerTransaction: (tx: Omit<CashDrawerTransaction, 'id' | 'timestamp'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, extraMeta?: { runnerName?: string; riderName?: string }) => void;
  bumpKDSTicket: (orderId: string, itemId?: string) => void;
  toggle86: (menuItemId: string) => void;
  payOrder: (orderId: string, method: 'Cash' | 'Credit Card' | 'M-Pesa / Mobile Money' | 'House Account' | 'Mixed', options?: { collectedBy?: 'waiter' | 'cashier' | 'online'; providerRef?: string; settledBy?: string }) => void;
  voidOrder: (orderId: string, reason: string) => void;
  applyOrderDiscount: (orderId: string, discount: number) => void;
  updateTableStatus: (tableId: string, status: TableStatus, currentOrderId?: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'theoreticalDepletedToday'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  logWaste: (entry: Omit<WasteEntry, 'id' | 'date'>) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status'>) => void;
  approvePurchaseOrder: (poId: string, approverName: string) => void;
  receivePurchaseOrder: (poId: string, tempCelsius: number, qualityPassed: boolean) => void;
  createProductionOrder: (batch: Omit<ProductionOrder, 'id' | 'batchNumber' | 'status'>) => void;
  updateProductionStatus: (id: string, status: ProductionOrder['status']) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  toggleChecklist: (id: string, recordedValue?: string) => void;
  toggleEmployeeClockIn: (empId: string) => void;
  addEmployee: (emp: Omit<Employee, 'id' | 'clockedIn'>) => void;
  updateEmployee: (emp: Employee) => void;
  // Authentication & Staff Session
  isAuthenticated: boolean;
  currentUser: Employee | null;
  loginWithPin: (pin: string, siteId?: string) => { success: boolean; message?: string };
  loginWithCredentials: (username: string, pass: string, siteId?: string) => { success: boolean; message?: string };
  registerUser: (data: { name: string; username: string; password?: string; role: UserRole; siteId: string; pin: string; email?: string; phone?: string }) => { success: boolean; message?: string };
  logout: () => void;
  setCurrentUser: (emp: Employee | null) => void;

  // Odoo 19 Accounting Module
  accounts: Account[];
  journalMoves: JournalMove[];
  bankStatements: BankStatementItem[];
  vendorBills: VendorBill[];
  addJournalMove: (moveData: Omit<JournalMove, 'id'>) => JournalMove;
  postJournalMove: (moveId: string) => void;
  cancelJournalMove: (moveId: string) => void;
  addVendorBill: (billData: Omit<VendorBill, 'id' | 'billNumber'>) => VendorBill;
  payVendorBill: (billId: string, paymentMethod: string) => void;
  reconcileBankStatement: (statementId: string, moveLineId?: string) => void;

  executeDayEndClose: (countedCash: number) => DayEndReport;
  reopenDay: () => void;
  resetToDemo: () => void;

  // Waiter Commissions & Customer Portal Routing Module
  waiterProfiles: WaiterProfile[];
  commissionPolicies: CommissionPolicy[];
  commissionLedger: CommissionLedgerEntry[];
  commissionPayouts: CommissionPayout[];
  billRequests: BillRequest[];
  cashSettlements: WaiterCashSettlement[];
  auditLogs: AuditLogEntry[];
  activeCustomerWaiterCode: string | null;
  setActiveCustomerWaiterCode: (code: string | null) => void;
  getEffectivePolicyForWaiter: (waiterId?: string, siteId?: string) => CommissionPolicy;
  calculateOrderCommission: (
    orderData: Partial<Order> & { items: Order['items']; total?: number; subtotal?: number; discount?: number },
    policy: CommissionPolicy
  ) => { eligibleAmount: number; commissionAmount: number; snapshot: CommissionPolicySnapshot };
  rotateWaiterLink: (waiterId: string) => { token: string; link: string };
  recordWaiterDirectPayment: (orderId: string, method: 'Cash' | 'M-Pesa / Mobile Money', amount: number, providerRef?: string) => void;
  submitBillRequest: (orderId: string, waiterId?: string) => BillRequest;
  settleBillRequest: (billRequestId: string, cashierName?: string, paymentMethod?: 'Cash' | 'Credit Card' | 'M-Pesa / Mobile Money') => void;
  updateCommissionPolicy: (policy: CommissionPolicy, actorName?: string) => void;
  approveCommissionEntries: (entryIds: string[], approverName?: string) => void;
  payoutCommissions: (waiterId: string, entryIds: string[], paymentMethod: 'Cash' | 'Bank Transfer' | 'M-Pesa / Mobile Money', paymentRef: string, approverName?: string) => CommissionPayout;
  recordCashHandover: (waiterId: string, actualCash: number, notes?: string, managerName?: string) => WaiterCashSettlement;
  reverseCommissionEntry: (entryId: string, reason: string, actorName?: string) => void;
}

const ErpContext = createContext<ErpContextType | null>(null);

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sites] = useState<Site[]>(INITIAL_SITES);
  const [currentSite, setCurrentSite] = useState<Site>(INITIAL_SITES[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>('Owner');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [viewMode, setViewMode] = useState<'landing' | 'auth' | 'erp'>('landing');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  
  const [tables, setTables] = useState<RestaurantTable[]>(INITIAL_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([
    {
      id: 'w-1',
      stockItemId: 'inv-6',
      itemName: 'Iringa Highland Russet Potatoes',
      quantity: 3.5,
      unit: 'kg',
      totalCost: 8750,
      reason: 'Prep Spoilage',
      loggedBy: 'Chef Rashid Makange',
      date: '2026-10-23',
      notes: 'Bruised batch during delivery handling'
    }
  ]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(INITIAL_PRODUCTION_ORDERS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [checklists, setChecklists] = useState<ChecklistItem[]>(INITIAL_CHECKLISTS);
  const [dayEndReports, setDayEndReports] = useState<DayEndReport[]>([]);
  const [dayStatus, setDayStatus] = useState<'OPEN' | 'CLOSING' | 'CLOSED'>('OPEN');
  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    try { return localStorage.getItem('restoerp.sidebarCollapsed') === '1'; } catch { return false; }
  });
  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try { localStorage.setItem('restoerp.sidebarCollapsed', collapsed ? '1' : '0'); } catch { /* ignore */ }
  };
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [cashDrawerTransactions, setCashDrawerTransactions] = useState<CashDrawerTransaction[]>(INITIAL_CASH_DRAWER_TRANSACTIONS);
  const [serviceMode, setServiceMode] = useState<ServiceMode>('full_service_waiter');

  // Waiter Commissions & Customer Portal Routing Module States
  const [waiterProfiles, setWaiterProfiles] = useState<WaiterProfile[]>(INITIAL_WAITER_PROFILES);
  const [commissionPolicies, setCommissionPolicies] = useState<CommissionPolicy[]>(INITIAL_COMMISSION_POLICIES);
  const [commissionLedger, setCommissionLedger] = useState<CommissionLedgerEntry[]>(INITIAL_COMMISSION_LEDGER);
  const [commissionPayouts, setCommissionPayouts] = useState<CommissionPayout[]>(INITIAL_COMMISSION_PAYOUTS);
  const [billRequests, setBillRequests] = useState<BillRequest[]>(INITIAL_BILL_REQUESTS);
  const [cashSettlements, setCashSettlements] = useState<WaiterCashSettlement[]>(INITIAL_CASH_SETTLEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [activeCustomerWaiterCode, setActiveCustomerWaiterCode] = useState<string | null>('W-101');

  // Odoo 19 Accounting States
  const [accounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [journalMoves, setJournalMoves] = useState<JournalMove[]>(INITIAL_JOURNAL_MOVES);
  const [bankStatements, setBankStatements] = useState<BankStatementItem[]>(INITIAL_BANK_STATEMENTS);
  const [vendorBills, setVendorBills] = useState<VendorBill[]>(INITIAL_VENDOR_BILLS);

  const addJournalMove = (moveData: Omit<JournalMove, 'id'>): JournalMove => {
    const newMove: JournalMove = {
      ...moveData,
      id: `mov-${Date.now()}`
    };
    setJournalMoves(prev => [newMove, ...prev]);

    // Mirror to classic journal entry for compatibility
    const debitLine = newMove.lines.find(l => l.debit > 0);
    const creditLine = newMove.lines.find(l => l.credit > 0);
    if (debitLine && creditLine) {
      const je: JournalEntry = {
        id: `je-${Date.now()}`,
        entryNumber: newMove.name,
        date: newMove.date,
        source: 'Manual Journal',
        description: newMove.ref || debitLine.name,
        debitAccount: `${debitLine.accountCode} - ${debitLine.accountName}`,
        creditAccount: `${creditLine.accountCode} - ${creditLine.accountName}`,
        amount: newMove.amountTotal,
        siteId: newMove.siteId
      };
      setJournalEntries(prev => [je, ...prev]);
    }
    return newMove;
  };

  const postJournalMove = (moveId: string) => {
    setJournalMoves(prev => prev.map(m => m.id === moveId ? { ...m, state: 'posted' } : m));
  };

  const cancelJournalMove = (moveId: string) => {
    setJournalMoves(prev => prev.map(m => m.id === moveId ? { ...m, state: 'cancelled' } : m));
  };

  const addVendorBill = (billData: Omit<VendorBill, 'id' | 'billNumber'>): VendorBill => {
    const billNum = `BILL/2026/0${vendorBills.length + 95}`;
    const newBill: VendorBill = {
      ...billData,
      id: `bill-${Date.now()}`,
      billNumber: billNum,
      status: 'posted',
      paymentState: 'not_paid'
    };
    setVendorBills(prev => [newBill, ...prev]);

    // Create corresponding Odoo journal move
    const newMove: JournalMove = {
      id: `mov-${Date.now()}`,
      name: billNum,
      date: billData.billDate,
      journalType: 'vendor_bills',
      ref: billData.reference || `Vendor Bill - ${billData.vendorName}`,
      partnerName: billData.vendorName,
      state: 'posted',
      siteId: billData.siteId,
      amountTotal: billData.totalAmount,
      lines: [
        {
          id: `ln-${Date.now()}-1`,
          accountId: 'acc-1210',
          accountCode: '1210',
          accountName: 'Food & Beverage Inventory Asset',
          name: billData.items.map(i => i.description).join(', '),
          debit: billData.subtotal,
          credit: 0
        },
        {
          id: `ln-${Date.now()}-2`,
          accountId: 'acc-2021',
          accountCode: '2021',
          accountName: 'VAT Input Tax Deductible (18%)',
          name: 'Input VAT on Bill',
          debit: billData.taxAmount,
          credit: 0
        },
        {
          id: `ln-${Date.now()}-3`,
          accountId: 'acc-2010',
          accountCode: '2010',
          accountName: 'Accounts Payable (Trade Food Suppliers)',
          partner: billData.vendorName,
          name: `Payable to ${billData.vendorName}`,
          debit: 0,
          credit: billData.totalAmount
        }
      ]
    };
    setJournalMoves(prev => [newMove, ...prev]);

    return newBill;
  };

  const payVendorBill = (billId: string, paymentMethod: string) => {
    setVendorBills(prev => prev.map(b => {
      if (b.id !== billId) return b;
      
      const payMove: JournalMove = {
        id: `mov-${Date.now()}`,
        name: `PAY/2026/0${Math.floor(100 + Math.random() * 899)}`,
        date: new Date().toISOString().split('T')[0],
        journalType: paymentMethod === 'Cash' ? 'cash' : paymentMethod === 'M-Pesa / Mobile Money' ? 'mpesa' : 'bank',
        ref: `Payment for ${b.billNumber} via ${paymentMethod}`,
        partnerName: b.vendorName,
        state: 'posted',
        siteId: b.siteId,
        amountTotal: b.totalAmount,
        lines: [
          {
            id: `ln-${Date.now()}-1`,
            accountId: 'acc-2010',
            accountCode: '2010',
            accountName: 'Accounts Payable (Trade Food Suppliers)',
            partner: b.vendorName,
            name: `Settlement of ${b.billNumber}`,
            debit: b.totalAmount,
            credit: 0,
            reconciled: true
          },
          {
            id: `ln-${Date.now()}-2`,
            accountId: paymentMethod === 'Cash' ? 'acc-1010' : paymentMethod === 'M-Pesa / Mobile Money' ? 'acc-1020' : 'acc-1030',
            accountCode: paymentMethod === 'Cash' ? '1010' : paymentMethod === 'M-Pesa / Mobile Money' ? '1020' : '1030',
            accountName: paymentMethod === 'Cash' ? 'Cash on Hand (POS Drawer Till)' : paymentMethod === 'M-Pesa / Mobile Money' ? 'M-Pesa Merchant Settlement Account' : 'CRDB Bank Main Operating Account',
            name: `Payout via ${paymentMethod}`,
            debit: 0,
            credit: b.totalAmount,
            reconciled: true
          }
        ]
      };
      setJournalMoves(moves => [payMove, ...moves]);

      return {
        ...b,
        paymentState: 'paid'
      };
    }));
  };

  const reconcileBankStatement = (statementId: string, moveLineId?: string) => {
    setBankStatements(prev => prev.map(bs => {
      if (bs.id === statementId) {
        return {
          ...bs,
          isReconciled: true,
          matchedMoveLineId: moveLineId || bs.matchedMoveLineId || `ln-matched-${Date.now()}`
        };
      }
      return bs;
    }));
  };

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  /** Shared by every sign-in path so role → landing screen routing lives in one place. */
  const startSession = (emp: Employee, siteId?: string) => {
    setCurrentUser(emp);
    setCurrentRole(emp.role);
    const assignedSite = sites.find(x => x.id === emp.siteId) || sites.find(x => x.id === siteId) || currentSite;
    if (assignedSite) setCurrentSite(assignedSite);
    setIsAuthenticated(true);
    setViewMode('erp');
    setActiveTab(landingTabForRole(emp.role));
  };

  const loginWithPin = (pin: string, siteId?: string): { success: boolean; message?: string } => {
    const cleanPin = pin.trim();
    // Prefer an employee at the selected branch; fall back to any branch (staff can be cross-assigned).
    const match = employees.find(e => e.pin === cleanPin && (!siteId || e.siteId === siteId))
               || employees.find(e => e.pin === cleanPin);
    if (match) {
      startSession(match, siteId);
      return { success: true };
    }
    return { success: false, message: 'Invalid 4-digit PIN. Please try again.' };
  };

  const loginWithCredentials = (username: string, pass: string, siteId?: string): { success: boolean; message?: string } => {
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || !pass) {
      return { success: false, message: 'Enter both your username and password.' };
    }
    // Strict match only. (Previously an empty password, "admin" or "password123" opened ANY account.)
    const match = employees.find(e =>
      (e.username?.toLowerCase() === cleanUser || e.email.toLowerCase() === cleanUser) && e.password === pass
    );
    if (match) {
      startSession(match, siteId);
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password.' };
  };

  const registerUser = (data: { name: string; username: string; password?: string; role: UserRole; siteId: string; pin: string; email?: string; phone?: string }): { success: boolean; message?: string } => {
    if (!SELF_REGISTER_ROLES.includes(data.role)) {
      return { success: false, message: 'Owner, manager and finance accounts are created by HQ. Choose a frontline role or ask your manager.' };
    }
    if (data.username.trim().length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }
    if (!/^\d{4}$/.test(data.pin || '')) {
      return { success: false, message: 'Choose a 4-digit numeric PIN.' };
    }
    if (employees.some(e => e.pin === data.pin)) {
      return { success: false, message: 'That PIN is already in use. Pick a different 4-digit PIN.' };
    }
    if (employees.some(e => e.username?.toLowerCase() === data.username.toLowerCase())) {
      return { success: false, message: 'Username is already taken. Please choose another.' };
    }
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: data.name,
      role: data.role,
      employeeId: `EMP-0${employees.length + 1}`,
      phone: data.phone || '+255 700 000 000',
      email: data.email || `${data.username.toLowerCase()}@restoerp.com`,
      siteId: data.siteId,
      hourlyRate: 8500,
      weeklyHours: 40,
      clockedIn: true,
      clockInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      healthCertExpiry: '2028-12-31',
      certStatus: 'Valid',
      pin: data.pin,
      username: data.username,
      password: data.password || 'password123',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };
    setEmployees(prev => [newEmp, ...prev]);
    setCurrentUser(newEmp);
    setCurrentRole(newEmp.role);
    const targetSite = sites.find(s => s.id === data.siteId);
    if (targetSite) setCurrentSite(targetSite);
    setIsAuthenticated(true);
    setViewMode('erp');
    setActiveTab(landingTabForRole(newEmp.role));
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setViewMode('auth');
    setSidebarDrawerOpen(false);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* storage unavailable */ }
  };

  // Restore the signed-in session after a browser refresh (declared BEFORE the save effect on purpose).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { empId: string; siteId?: string; tab?: string; role?: UserRole };
      const emp = employees.find(e => e.id === saved.empId);
      if (!emp) return;
      setCurrentUser(emp);
      setCurrentRole(saved.role || emp.role);
      const site = sites.find(x => x.id === (saved.siteId || emp.siteId));
      if (site) setCurrentSite(site);
      if (saved.tab) setActiveTab(saved.tab);
      setIsAuthenticated(true);
      setViewMode('erp');
    } catch { /* corrupt or unavailable storage – start fresh */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (isAuthenticated && currentUser) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
          empId: currentUser.id, siteId: currentSite.id, tab: activeTab, role: currentRole,
        }));
      }
    } catch { /* ignore */ }
  }, [isAuthenticated, currentUser, currentSite.id, activeTab, currentRole]);

  const toggleOffline = () => setIsOffline(prev => !prev);

  // Helper for unique IDs
  const uid = () => Math.random().toString(36).substring(2, 9);

  const addCashDrawerTransaction = (tx: Omit<CashDrawerTransaction, 'id' | 'timestamp'>) => {
    const newTx: CashDrawerTransaction = {
      ...tx,
      id: `cdt-${uid()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setCashDrawerTransactions(prev => [newTx, ...prev]);
  };

  const addCustomer = (cust: Omit<CustomerProfile, 'id' | 'totalOrders' | 'totalSpend' | 'loyaltyPoints' | 'lastVisit'>): CustomerProfile => {
    const newCust: CustomerProfile = {
      ...cust,
      id: `cust-${uid()}`,
      totalOrders: 0,
      totalSpend: 0,
      loyaltyPoints: 0,
      lastVisit: 'Just registered'
    };
    setCustomers(prev => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (cust: CustomerProfile) => {
    setCustomers(prev => prev.map(c => c.id === cust.id ? cust : c));
  };

  // Commission & Waiter Routing Helper Functions
  const getEffectivePolicyForWaiter = (waiterId?: string, siteId?: string): CommissionPolicy => {
    const targetSiteId = siteId || currentSite.id;
    if (waiterId) {
      const override = commissionPolicies.find(p => p.siteId === targetSiteId && p.waiterId === waiterId && p.active);
      if (override) return override;
    }
    const defaultPol = commissionPolicies.find(p => p.siteId === targetSiteId && p.isDefault && p.active);
    if (defaultPol) return defaultPol;
    return {
      id: 'pol-standard-fallback',
      siteId: targetSiteId,
      name: 'Standard Commission (5% Net)',
      isDefault: true,
      method: 'percentage',
      rate: 0.05,
      fixedAmount: 0,
      tiers: [],
      basis: 'net',
      qualifyCondition: 'payment_confirmed',
      effectiveFrom: '2026-01-01',
      active: true,
      updatedBy: 'System',
      updatedAt: '2026-01-01 00:00'
    };
  };

  const calculateOrderCommission = (
    orderData: Partial<Order> & { items: Order['items']; total?: number; subtotal?: number; discount?: number },
    policy: CommissionPolicy
  ): { eligibleAmount: number; commissionAmount: number; snapshot: CommissionPolicySnapshot } => {
    const subtotal = orderData.subtotal ?? orderData.items.reduce((s, it) => s + it.price * it.quantity, 0);
    const discount = orderData.discount ?? 0;
    const netSales = Math.max(0, subtotal - discount);
    const grossSales = orderData.total ?? Math.max(0, subtotal - discount + Math.round(subtotal * (currentSite.taxRate + (orderData.type === 'Dine-in' ? currentSite.serviceChargeRate : 0))));

    const eligibleAmount = policy.basis === 'gross' ? grossSales : netSales;
    let commissionAmount = 0;
    let formulaDesc = '';

    if (policy.method === 'percentage') {
      commissionAmount = Math.round(eligibleAmount * policy.rate);
      formulaDesc = `${Math.round(policy.rate * 100)}% of ${policy.basis === 'gross' ? 'Gross' : 'Net'} (${eligibleAmount.toLocaleString()} ${currentSite.currency}) = ${commissionAmount.toLocaleString()} ${currentSite.currency}`;
    } else if (policy.method === 'fixed') {
      commissionAmount = policy.fixedAmount;
      formulaDesc = `Fixed reward of ${policy.fixedAmount.toLocaleString()} ${currentSite.currency} per order`;
    } else if (policy.method === 'tiered') {
      const matchedTier = policy.tiers.find(t => eligibleAmount >= t.minSales && eligibleAmount < t.maxSales) || policy.tiers[policy.tiers.length - 1];
      const appliedRate = matchedTier ? matchedTier.rate : policy.rate;
      commissionAmount = Math.round(eligibleAmount * appliedRate);
      formulaDesc = `Tiered (${Math.round(appliedRate * 100)}%) on ${policy.basis === 'gross' ? 'Gross' : 'Net'} (${eligibleAmount.toLocaleString()} ${currentSite.currency}) = ${commissionAmount.toLocaleString()} ${currentSite.currency}`;
    }

    const snapshot: CommissionPolicySnapshot = {
      policyId: policy.id,
      policyName: policy.name,
      method: policy.method,
      rate: policy.rate,
      fixedAmount: policy.fixedAmount,
      basis: policy.basis,
      qualifyCondition: policy.qualifyCondition,
      appliedFormula: formulaDesc
    };

    return { eligibleAmount, commissionAmount, snapshot };
  };

  const rotateWaiterLink = (waiterId: string) => {
    const newRand = Math.random().toString(36).substring(2, 6);
    let updatedToken = '';
    let waiterName = '';
    setWaiterProfiles(prev => prev.map(w => {
      if (w.id === waiterId) {
        const baseName = w.name.toLowerCase().replace(/[^a-z]/g, '_');
        updatedToken = `w_${baseName}_${newRand}`;
        waiterName = w.name;
        return {
          ...w,
          publicToken: updatedToken,
          linkRotatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return w;
    }));

    const newLog: AuditLogEntry = {
      id: `aud-${uid()}`,
      siteId: currentSite.id,
      actorName: currentUser?.name || 'Manager',
      actorRole: currentRole,
      action: 'WAITER_LINK_ROTATED',
      entityType: 'WAITER_PROFILE',
      entityId: waiterId,
      details: `Rotated customer ordering link token for waiter ${waiterName}. Previous token revoked.`,
      timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [newLog, ...prev]);

    const generatedLink = `https://order.dukadigital.co.tz/restaurant/${currentSite.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}/w/${updatedToken}`;
    return { token: updatedToken, link: generatedLink };
  };

  const submitBillRequest = (orderId: string, waiterId?: string): BillRequest => {
    const order = orders.find(o => o.id === orderId);
    const waiter = waiterProfiles.find(w => w.id === waiterId) || 
                   waiterProfiles.find(w => order?.assignedWaiterId === w.id) ||
                   waiterProfiles[0];
    const newReq: BillRequest = {
      id: `br-${uid()}`,
      siteId: order?.siteId || currentSite.id,
      orderId,
      orderNumber: order?.orderNumber || `ORD-${orderId}`,
      tableNumber: order?.tableNumber,
      waiterId: waiter.id,
      waiterName: waiter.name,
      totalAmount: order?.total || 0,
      status: 'pending',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setBillRequests(prev => [newReq, ...prev.filter(r => r.orderId !== orderId)]);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, billRequested: true, billRequestId: newReq.id } : o));
    if (order && order.tableNumber) {
      setTables(prev => prev.map(tbl => tbl.number === order.tableNumber ? { ...tbl, status: 'bill_requested' } : tbl));
    }
    return newReq;
  };

  const settleBillRequest = (billRequestId: string, cashierName?: string, paymentMethod: 'Cash' | 'Credit Card' | 'M-Pesa / Mobile Money' = 'Cash') => {
    const req = billRequests.find(r => r.id === billRequestId);
    if (!req) return;
    setBillRequests(prev => prev.map(r => r.id === billRequestId ? {
      ...r,
      status: 'settled',
      settledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      settledBy: cashierName || currentRole
    } : r));
    
    payOrder(req.orderId, paymentMethod, { collectedBy: 'cashier', settledBy: cashierName });
  };

  const recordWaiterDirectPayment = (orderId: string, method: 'Cash' | 'M-Pesa / Mobile Money', amount: number, providerRef?: string) => {
    payOrder(orderId, method, { collectedBy: 'waiter', providerRef });
  };

  const updateCommissionPolicy = (policy: CommissionPolicy, actorName?: string) => {
    const isNew = !commissionPolicies.some(p => p.id === policy.id);
    const updatedPolicy: CommissionPolicy = {
      ...policy,
      updatedBy: actorName || currentUser?.name || `${currentRole}`,
      updatedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (isNew) {
      setCommissionPolicies(prev => [...prev, updatedPolicy]);
    } else {
      setCommissionPolicies(prev => prev.map(p => p.id === policy.id ? updatedPolicy : p));
    }

    const log: AuditLogEntry = {
      id: `aud-${uid()}`,
      siteId: currentSite.id,
      actorName: actorName || currentUser?.name || `${currentRole}`,
      actorRole: currentRole,
      action: isNew ? 'POLICY_CREATED' : 'POLICY_UPDATED',
      entityType: 'COMMISSION_POLICY',
      entityId: policy.id,
      details: `${isNew ? 'Created' : 'Updated'} policy "${policy.name}": method=${policy.method}, rate=${Math.round(policy.rate * 100)}%, basis=${policy.basis}, condition=${policy.qualifyCondition}. Existing ledger records remain untouched.`,
      timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const approveCommissionEntries = (entryIds: string[], approverName?: string) => {
    const approver = approverName || currentUser?.name || `${currentRole}`;
    const timeNow = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCommissionLedger(prev => prev.map(entry => {
      if (entryIds.includes(entry.id) && entry.status === 'pending') {
        return {
          ...entry,
          status: 'approved',
          approvedAt: timeNow,
          approvedBy: approver
        };
      }
      return entry;
    }));

    const log: AuditLogEntry = {
      id: `aud-${uid()}`,
      siteId: currentSite.id,
      actorName: approver,
      actorRole: currentRole,
      action: 'COMMISSIONS_APPROVED',
      entityType: 'COMMISSION_LEDGER',
      entityId: entryIds.join(','),
      details: `Approved ${entryIds.length} commission entries for payout eligibility`,
      timestamp: timeNow
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const payoutCommissions = (
    waiterId: string,
    entryIds: string[],
    paymentMethod: 'Cash' | 'Bank Transfer' | 'M-Pesa / Mobile Money',
    paymentRef: string,
    approverName?: string
  ): CommissionPayout => {
    const waiter = waiterProfiles.find(w => w.id === waiterId) || waiterProfiles[0];
    const eligibleEntries = commissionLedger.filter(e => entryIds.includes(e.id));
    const totalAmount = eligibleEntries.reduce((sum, e) => sum + e.commissionAmount, 0);
    const timeNow = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const payoutNum = `PAY-2026-0${commissionPayouts.length + 42}`;

    const newPayout: CommissionPayout = {
      id: `payout-${uid()}`,
      siteId: currentSite.id,
      payoutNumber: payoutNum,
      waiterId,
      waiterName: waiter.name,
      waiterCode: waiter.code,
      amount: totalAmount,
      orderCount: eligibleEntries.length,
      entryIds,
      periodStart: eligibleEntries[eligibleEntries.length - 1]?.createdAt.split(' ')[0] || new Date().toISOString().split('T')[0],
      periodEnd: eligibleEntries[0]?.createdAt.split(' ')[0] || new Date().toISOString().split('T')[0],
      paymentMethod,
      paymentReference: paymentRef,
      approvedBy: approverName || currentUser?.name || `${currentRole}`,
      paidAt: timeNow
    };

    setCommissionPayouts(prev => [newPayout, ...prev]);

    setCommissionLedger(prev => prev.map(entry => {
      if (entryIds.includes(entry.id)) {
        return {
          ...entry,
          status: 'paid',
          paidAt: timeNow,
          payoutId: newPayout.id
        };
      }
      return entry;
    }));

    const log: AuditLogEntry = {
      id: `aud-${uid()}`,
      siteId: currentSite.id,
      actorName: approverName || currentUser?.name || `${currentRole}`,
      actorRole: currentRole,
      action: 'COMMISSION_PAYOUT_RECORDED',
      entityType: 'COMMISSION_PAYOUT',
      entityId: newPayout.id,
      details: `Disbursed ${totalAmount.toLocaleString()} ${currentSite.currency} to ${waiter.name} (${waiter.code}) via ${paymentMethod} (Ref: ${paymentRef}) covering ${eligibleEntries.length} orders`,
      timestamp: timeNow
    };
    setAuditLogs(prev => [log, ...prev]);

    return newPayout;
  };

  const recordCashHandover = (waiterId: string, actualCash: number, notes?: string, managerName?: string): WaiterCashSettlement => {
    const waiter = waiterProfiles.find(w => w.id === waiterId) || waiterProfiles[0];
    const waiterCashOrders = orders.filter(o => 
      (o.assignedWaiterId === waiterId || o.serverName.includes(waiter.name.split(' ')[0])) &&
      o.status === 'paid' &&
      o.paymentMethod === 'Cash' &&
      o.collectedBy === 'waiter'
    );
    const expectedCash = waiterCashOrders.reduce((sum, o) => sum + o.total, 0);
    const variance = actualCash - expectedCash;
    const timeNow = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const settlement: WaiterCashSettlement = {
      id: `wcs-${uid()}`,
      siteId: currentSite.id,
      waiterId,
      waiterName: waiter.name,
      shiftDate: new Date().toISOString().split('T')[0],
      expectedCash,
      actualCash,
      variance,
      notes: notes || (variance === 0 ? 'Balanced shift handover' : (variance > 0 ? `Over by ${variance.toLocaleString()} ${currentSite.currency}` : `Short by ${Math.abs(variance).toLocaleString()} ${currentSite.currency}`)),
      reconciledBy: managerName || currentUser?.name || `${currentRole}`,
      reconciledAt: timeNow
    };

    setCashSettlements(prev => [settlement, ...prev]);

    const log: AuditLogEntry = {
      id: `aud-${uid()}`,
      siteId: currentSite.id,
      actorName: managerName || currentUser?.name || `${currentRole}`,
      actorRole: currentRole,
      action: 'CASH_HANDOVER_RECONCILED',
      entityType: 'WAITER_CASH_SETTLEMENT',
      entityId: settlement.id,
      details: `Reconciled shift cash handover for ${waiter.name}: expected ${expectedCash.toLocaleString()} ${currentSite.currency}, counted ${actualCash.toLocaleString()} ${currentSite.currency}, variance ${variance.toLocaleString()} ${currentSite.currency}`,
      timestamp: timeNow
    };
    setAuditLogs(prev => [log, ...prev]);

    return settlement;
  };

  const reverseCommissionEntry = (entryId: string, reason: string, actorName?: string) => {
    const original = commissionLedger.find(e => e.id === entryId);
    if (!original || original.status === 'reversed') return;

    const timeNow = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const reversalEntry: CommissionLedgerEntry = {
      id: `cme-rev-${uid()}`,
      siteId: original.siteId,
      orderId: original.orderId,
      orderNumber: original.orderNumber,
      orderTotal: -original.orderTotal,
      waiterId: original.waiterId,
      waiterName: original.waiterName,
      waiterCode: original.waiterCode,
      source: original.source,
      policySnapshot: original.policySnapshot,
      eligibleAmount: -original.eligibleAmount,
      commissionAmount: -original.commissionAmount,
      status: 'reversed',
      createdAt: timeNow,
      reversalOfId: original.id,
      reversalReason: reason
    };

    setCommissionLedger(prev => [
      reversalEntry,
      ...prev.map(e => e.id === entryId ? { ...e, status: 'reversed' as const, reversalReason: reason } : e)
    ]);

    const log: AuditLogEntry = {
      id: `aud-${uid()}`,
      siteId: currentSite.id,
      actorName: actorName || currentUser?.name || `${currentRole}`,
      actorRole: currentRole,
      action: 'COMMISSION_REVERSED',
      entityType: 'COMMISSION_LEDGER',
      entityId: entryId,
      details: `Reversed commission of ${original.commissionAmount.toLocaleString()} ${currentSite.currency} for order ${original.orderNumber}. Reason: ${reason}`,
      timestamp: timeNow
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // 1. Add Order (with automatic source attribution, waiter routing & commission snapshot)
  const addOrder = (orderData: Partial<Order> & { items: Order['items'] }): Order => {
    const deliveryFee = orderData.deliveryFee || 0;
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * currentSite.taxRate);
    const serviceCharge = orderData.type === 'Dine-in' ? Math.round(subtotal * currentSite.serviceChargeRate) : 0;
    const discount = orderData.discount || 0;
    const total = Math.max(0, subtotal + tax + serviceCharge + deliveryFee - discount);
    
    const isTakeaway = orderData.type === 'Takeaway';
    const isDelivery = orderData.type === 'Delivery';
    const autoToken = isTakeaway 
      ? (orderData.pickupToken || `TK-${Math.floor(100 + Math.random() * 900)}`)
      : (isDelivery ? (orderData.pickupToken || `DEL-${Math.floor(100 + Math.random() * 900)}`) : undefined);

    // Waiter Attribution Resolution
    let assignedProfile = waiterProfiles.find(w => 
      (orderData.assignedWaiterId && w.id === orderData.assignedWaiterId) ||
      (orderData.assignedWaiterCode && w.code === orderData.assignedWaiterCode) ||
      (orderData.waiterLinkToken && (w.publicToken === orderData.waiterLinkToken || w.code === orderData.waiterLinkToken))
    );

    // If customer portal opened with waiter link:
    if (!assignedProfile && activeCustomerWaiterCode) {
      assignedProfile = waiterProfiles.find(w => w.code === activeCustomerWaiterCode || w.publicToken === activeCustomerWaiterCode);
    }

    // If dine-in with table assigned server:
    if (!assignedProfile && orderData.type === 'Dine-in' && orderData.tableNumber) {
      const table = tables.find(t => t.number === orderData.tableNumber);
      if (table && table.serverName) {
        assignedProfile = waiterProfiles.find(w => table.serverName?.toLowerCase().includes(w.name.split(' ')[0].toLowerCase()));
      }
    }

    // If current logged-in role is waiter:
    if (!assignedProfile && currentRole === 'Waiter') {
      assignedProfile = waiterProfiles.find(w => w.employeeId === currentUser?.id) || waiterProfiles[0];
    }

    // Determine Order Source
    const orderSource: OrderSource = orderData.source || (
      orderData.waiterLinkToken || (activeTab === 'customer-portal' && activeCustomerWaiterCode)
        ? 'WAITER_LINK'
        : (orderData.tableNumber && activeTab === 'customer-portal' ? 'TABLE_QR' : (activeTab === 'customer-portal' ? 'CUSTOMER_PORTAL' : 'POS'))
    );

    const assignedWaiterId = assignedProfile?.id;
    const assignedWaiterCode = assignedProfile?.code;
    const assignedWaiterName = assignedProfile?.name;
    const waiterToken = assignedProfile?.publicToken;

    // Snapshot commission calculation
    let commissionSnapshot: CommissionPolicySnapshot | undefined;
    let calculatedCommissionAmount = 0;
    if (assignedWaiterId) {
      const policy = getEffectivePolicyForWaiter(assignedWaiterId, currentSite.id);
      const calc = calculateOrderCommission({ subtotal, discount, total, items: orderData.items, type: orderData.type }, policy);
      commissionSnapshot = calc.snapshot;
      calculatedCommissionAmount = calc.commissionAmount;
    }

    const newOrder: Order = {
      id: `ord-${uid()}`,
      orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
      siteId: currentSite.id,
      type: orderData.type || 'Dine-in',
      source: orderSource,
      tableNumber: orderData.type === 'Dine-in' ? orderData.tableNumber : undefined,
      customerName: orderData.customerName || (isTakeaway ? 'Counter Guest' : (isDelivery ? 'Delivery Client' : undefined)),
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      deliveryFee,
      pickupToken: autoToken,
      guestCount: orderData.guestCount || 1,
      serverName: assignedWaiterName || orderData.serverName || (currentRole === 'Waiter' ? 'Emmanuel K.' : (serviceMode === 'counter_qr_no_waiter' ? 'Self-Service QR' : 'Cashier Counter')),
      assignedWaiterId,
      assignedWaiterCode,
      assignedWaiterName,
      waiterLinkToken: waiterToken,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: orderData.items,
      subtotal,
      tax,
      serviceCharge,
      discount,
      total,
      status: 'in_kitchen',
      serviceMode: orderData.serviceMode || serviceMode,
      commissionSnapshot,
      commissionAmount: calculatedCommissionAmount,
      commissionStatus: assignedWaiterId ? 'pending' : 'none'
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update table status ONLY if dine-in and tableNumber specified
    if (orderData.type === 'Dine-in' && orderData.tableNumber) {
      setTables(prev => prev.map(tbl => 
        tbl.number === orderData.tableNumber 
          ? { ...tbl, status: 'occupied', currentOrderId: newOrder.id, seatedAt: newOrder.createdAt } 
          : tbl
      ));
    }

    // Deplete inventory theoretical usage
    orderData.items.forEach(orderItem => {
      const menu = menuItems.find(m => m.id === orderItem.menuItemId);
      if (menu && menu.recipe) {
        menu.recipe.forEach(ing => {
          setInventory(prevInv => prevInv.map(invItem => {
            if (invItem.id === ing.stockItemId) {
              const consumed = ing.quantity * orderItem.quantity;
              const newCurrent = Math.max(0, invItem.currentStock - consumed);
              return {
                ...invItem,
                currentStock: Math.round(newCurrent * 100) / 100,
                theoreticalDepletedToday: Math.round((invItem.theoreticalDepletedToday + consumed) * 100) / 100,
                status: newCurrent <= invItem.reorderPoint ? (newCurrent <= 5 ? 'Critical' : 'Low Stock') : 'In Stock'
              };
            }
            return invItem;
          }));
        });
      }
    });

    return newOrder;
  };

  // 2. Update Order Status
  const updateOrderStatus = (orderId: string, status: OrderStatus, extraMeta?: { runnerName?: string; riderName?: string }) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const updated: Order = {
        ...o,
        status,
        readyAt: status === 'ready' ? (o.readyAt || timeNow) : o.readyAt,
        dispatchedAt: status === 'dispatched' ? (o.dispatchedAt || timeNow) : o.dispatchedAt,
        servedAt: status === 'served' ? (o.servedAt || timeNow) : o.servedAt,
        runnerName: extraMeta?.runnerName || o.runnerName,
        riderName: extraMeta?.riderName || o.riderName
      };
      return updated;
    }));
    
    // If served, and table exists, update table
    const order = orders.find(o => o.id === orderId);
    if (order && order.tableNumber) {
      if (status === 'served') {
        // remains occupied
      } else if (status === 'voided') {
        setTables(prev => prev.map(tbl => 
          tbl.number === order.tableNumber 
            ? { ...tbl, status: 'vacant', currentOrderId: undefined, seatedAt: undefined } 
            : tbl
        ));
      }
    }
  };

  // 3. Bump KDS Ticket
  const bumpKDSTicket = (orderId: string, itemId?: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      let updatedItems = [...order.items];
      if (itemId) {
        updatedItems = updatedItems.map(it => 
          it.id === itemId 
            ? { ...it, status: it.status === 'cooking' ? 'ready' : (it.status === 'ready' ? 'served' : 'cooking') } 
            : it
        );
      } else {
        // Bump all items to ready or served
        const allReady = updatedItems.every(i => i.status === 'ready' || i.status === 'served');
        updatedItems = updatedItems.map(it => ({
          ...it,
          status: allReady ? 'served' : 'ready'
        }));
      }

      const allServed = updatedItems.every(i => i.status === 'served');
      const allReady = updatedItems.every(i => i.status === 'ready' || i.status === 'served');

      return {
        ...order,
        items: updatedItems,
        status: allServed ? 'served' : (allReady ? 'ready' : 'in_kitchen')
      };
    }));
  };

  // Add items to existing open order (re-order by customer or waiter)
  const addItemsToOrder = (orderId: string, newItems: OrderItem[]) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const updatedItems = [...order.items, ...newItems];
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = Math.round(subtotal * currentSite.taxRate);
      const serviceCharge = order.type === 'Dine-in' ? Math.round(subtotal * currentSite.serviceChargeRate) : 0;
      const total = Math.max(0, subtotal + tax + serviceCharge + (order.deliveryFee || 0) - (order.discount || 0));

      return {
        ...order,
        items: updatedItems,
        subtotal,
        tax,
        serviceCharge,
        total,
        status: 'in_kitchen' // Re-mark in kitchen for new items to be cooked
      };
    }));

    // Deplete inventory for new items
    newItems.forEach(orderItem => {
      const menu = menuItems.find(m => m.id === orderItem.menuItemId);
      if (menu && menu.recipe) {
        menu.recipe.forEach(ing => {
          setInventory(prevInv => prevInv.map(invItem => {
            if (invItem.id === ing.stockItemId) {
              const consumed = ing.quantity * orderItem.quantity;
              const newCurrent = Math.max(0, invItem.currentStock - consumed);
              return {
                ...invItem,
                currentStock: Math.round(newCurrent * 100) / 100,
                theoreticalDepletedToday: Math.round((invItem.theoreticalDepletedToday + consumed) * 100) / 100,
                status: newCurrent <= invItem.reorderPoint ? (newCurrent <= 5 ? 'Critical' : 'Low Stock') : 'In Stock'
              };
            }
            return invItem;
          }));
        });
      }
    });
  };

  // Update specific item status in an order (e.g. chips ready while steak cooking)
  const updateOrderItemStatus = (orderId: string, itemId: string, status: OrderItem['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const updatedItems = order.items.map(it => it.id === itemId ? { ...it, status } : it);
      const allServed = updatedItems.every(i => i.status === 'served');
      const allReady = updatedItems.every(i => i.status === 'ready' || i.status === 'served');
      return {
        ...order,
        items: updatedItems,
        status: allServed ? 'served' : (allReady ? 'ready' : (updatedItems.some(i => i.status === 'cooking' || i.status === 'pending') ? 'in_kitchen' : order.status))
      };
    }));
  };

  // Request bill preparation (by Waiter or Customer Portal)
  const requestBill = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, billRequested: true } : o));
    if (order && order.tableNumber) {
      setTables(prev => prev.map(tbl => 
        tbl.number === order.tableNumber ? { ...tbl, status: 'bill_requested' } : tbl
      ));
    }
  };

  // 4. Toggle 86 (Out of Stock)
  const toggle86 = (menuItemId: string) => {
    setMenuItems(prev => prev.map(m => 
      m.id === menuItemId ? { ...m, is86: !m.is86 } : m
    ));
  };

  // 5. Pay Order (Direct Waiter Collection or Cashier Collection)
  const payOrder = (
    orderId: string, 
    method: 'Cash' | 'Credit Card' | 'M-Pesa / Mobile Money' | 'House Account' | 'Mixed',
    options?: { collectedBy?: 'waiter' | 'cashier' | 'online'; providerRef?: string; settledBy?: string }
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const collectedBy = options?.collectedBy || (currentRole === 'Waiter' ? 'waiter' : (currentRole === 'Cashier' ? 'cashier' : 'online'));
    const paymentProviderRef = options?.providerRef;

    // Check if commission already calculated/posted for this order (IDEMPOTENCY)
    const existingLedger = commissionLedger.find(c => c.orderId === orderId && c.status !== 'reversed');
    let postedCommissionAmount = order.commissionAmount || 0;
    let finalSnapshot = order.commissionSnapshot;

    if (!existingLedger && order.assignedWaiterId) {
      const policy = getEffectivePolicyForWaiter(order.assignedWaiterId, order.siteId);
      const calc = calculateOrderCommission(order, policy);
      postedCommissionAmount = calc.commissionAmount;
      finalSnapshot = calc.snapshot;

      const newEntry: CommissionLedgerEntry = {
        id: `cme-${uid()}`,
        siteId: order.siteId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderTotal: order.total,
        waiterId: order.assignedWaiterId,
        waiterName: order.assignedWaiterName || 'Assigned Waiter',
        waiterCode: order.assignedWaiterCode || 'W-000',
        source: order.source || 'POS',
        policySnapshot: calc.snapshot,
        eligibleAmount: calc.eligibleAmount,
        commissionAmount: calc.commissionAmount,
        status: 'pending', // Eligible, pending manager batch approval
        createdAt: new Date().toLocaleDateString('en-GB') + ' ' + timeNow
      };
      setCommissionLedger(prev => [newEntry, ...prev]);
    }

    setOrders(prev => prev.map(o => 
      o.id === orderId 
        ? { 
            ...o, 
            status: 'paid', 
            paymentMethod: method, 
            paidAt: timeNow,
            collectedBy,
            paymentProviderRef,
            billRequested: false,
            commissionAmount: postedCommissionAmount,
            commissionSnapshot: finalSnapshot,
            commissionStatus: 'pending'
          } 
        : o
    ));

    // Resolve any associated bill requests
    setBillRequests(prev => prev.map(br => 
      br.orderId === orderId ? { ...br, status: 'settled', settledAt: timeNow, settledBy: options?.settledBy || currentRole } : br
    ));

    // Free the table
    if (order.tableNumber) {
      setTables(prev => prev.map(tbl => 
        tbl.number === order.tableNumber 
          ? { ...tbl, status: 'dirty', currentOrderId: undefined } 
          : tbl
      ));
    }

    // If paid by cash directly at cashier till, record in cashier drawer
    if (method === 'Cash' && collectedBy === 'cashier') {
      addCashDrawerTransaction({
        type: 'sale',
        amount: order.total,
        reason: `Cashier Settlement Order #${order.orderNumber} (${order.type})`,
        cashierName: `${options?.settledBy || currentRole}`,
        receiptNumber: `REC-${order.orderNumber}`
      });
    }

    // Update customer stats if customer details match
    if (order.customerPhone || order.customerName) {
      setCustomers(prev => prev.map(c => {
        const matches = (order.customerPhone && c.phone === order.customerPhone) || 
                        (order.customerName && c.name.toLowerCase() === order.customerName.toLowerCase());
        if (matches) {
          return {
            ...c,
            totalOrders: c.totalOrders + 1,
            totalSpend: c.totalSpend + order.total,
            loyaltyPoints: c.loyaltyPoints + Math.floor(order.total / 1000),
            lastVisit: `Today, ${timeNow}`
          };
        }
        return c;
      }));
    }

    // Auto journal entry
    const newJe: JournalEntry = {
      id: `je-${uid()}`,
      entryNumber: `JE-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      source: 'POS Sales',
      description: `Settlement Order #${order.orderNumber} via ${method} (${collectedBy})`,
      debitAccount: method.includes('M-Pesa') ? '1020 - Mobile Money Escrow' : (method === 'Cash' ? '1010 - Cash on Hand' : '1030 - Card Merchant Account'),
      creditAccount: '4010 - Food & Beverage Revenue',
      amount: order.total,
      siteId: order.siteId
    };
    setJournalEntries(prev => [newJe, ...prev]);
  };

  // Apply a money discount (TZS) to an open order and recompute its total
  const applyOrderDiscount = (orderId: string, discount: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const gross = o.subtotal + o.tax + o.serviceCharge + (o.deliveryFee || 0);
      const d = Math.max(0, Math.min(Math.round(discount), gross));
      return { ...o, discount: d, total: Math.max(0, gross - d) };
    }));
  };

  // Void / Cancel order with immutable audit record and commission reversal
  const voidOrder = (orderId: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'voided', voidReason: reason, commissionStatus: 'reversed' } : o
    ));
    if (order && order.tableNumber) {
      setTables(prev => prev.map(tbl => 
        tbl.number === order.tableNumber ? { ...tbl, status: 'vacant', currentOrderId: undefined } : tbl
      ));
    }

    // Automatically reverse any existing commission entry
    const matchingLedger = commissionLedger.find(e => e.orderId === orderId && e.status !== 'reversed');
    if (matchingLedger) {
      reverseCommissionEntry(matchingLedger.id, `Order voided: ${reason}`, currentUser?.name || `${currentRole}`);
    }

    const log: AuditLogEntry = {
      id: `aud-${uid()}`,
      siteId: order?.siteId || currentSite.id,
      actorName: currentUser?.name || `${currentRole}`,
      actorRole: currentRole,
      action: 'ORDER_VOIDED',
      entityType: 'ORDER',
      entityId: orderId,
      details: `Voided order ${order?.orderNumber || orderId}. Reason: ${reason}. Commission reversed if previously booked.`,
      timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // Table status
  const updateTableStatus = (tableId: string, status: TableStatus, currentOrderId?: string) => {
    setTables(prev => prev.map(tbl => 
      tbl.id === tableId 
        ? { ...tbl, status, currentOrderId: status === 'vacant' ? undefined : (currentOrderId || tbl.currentOrderId) } 
        : tbl
    ));
  };

  // Inventory
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'theoreticalDepletedToday'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${uid()}`,
      theoreticalDepletedToday: 0
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const updateInventoryItem = (item: InventoryItem) => {
    setInventory(prev => prev.map(i => i.id === item.id ? item : i));
  };

  // Log Waste
  const logWaste = (entryData: Omit<WasteEntry, 'id' | 'date'>) => {
    const newWaste: WasteEntry = {
      ...entryData,
      id: `waste-${uid()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setWasteEntries(prev => [newWaste, ...prev]);

    // Deplete stock
    setInventory(prev => prev.map(inv => {
      if (inv.id === entryData.stockItemId) {
        const updated = Math.max(0, inv.currentStock - entryData.quantity);
        return { ...inv, currentStock: Math.round(updated * 100) / 100 };
      }
      return inv;
    }));

    // Post to accounting
    const newJe: JournalEntry = {
      id: `je-${uid()}`,
      entryNumber: `JE-WST-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      source: 'Waste Write-off',
      description: `Inventory Waste write-off: ${entryData.itemName} (${entryData.reason})`,
      debitAccount: '5020 - Spoilage & Waste Loss Expense',
      creditAccount: '1210 - Food Inventory Asset',
      amount: entryData.totalCost,
      siteId: currentSite.id
    };
    setJournalEntries(prev => [newJe, ...prev]);
  };

  // Purchase Order
  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status'>) => {
    const newPo: PurchaseOrder = {
      ...poData,
      id: `po-${uid()}`,
      poNumber: `PO-${Date.now().toString().slice(-4)}`,
      status: poData.totalAmount > poData.approvalLimitRequired ? 'Submitted' : 'Approved'
    };
    setPurchaseOrders(prev => [newPo, ...prev]);
  };

  const approvePurchaseOrder = (poId: string, approverName: string) => {
    setPurchaseOrders(prev => prev.map(po => 
      po.id === poId 
        ? { ...po, status: 'Approved', approvedBy: `${approverName} (${currentRole})` } 
        : po
    ));
  };

  const receivePurchaseOrder = (poId: string, tempCelsius: number, qualityPassed: boolean) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    setPurchaseOrders(prev => prev.map(p => 
      p.id === poId 
        ? { 
            ...p, 
            status: 'Delivered', 
            temperatureLoggedCelsius: tempCelsius, 
            qualityPassed,
            items: p.items.map(it => ({ ...it, receivedQuantity: it.quantity }))
          } 
        : p
    ));

    // Increase stock in inventory
    po.items.forEach(poItem => {
      setInventory(prevInv => prevInv.map(invItem => {
        if (invItem.id === poItem.stockItemId) {
          const updated = invItem.currentStock + poItem.quantity;
          return {
            ...invItem,
            currentStock: Math.round(updated * 100) / 100,
            status: updated <= invItem.reorderPoint ? 'Low Stock' : 'In Stock'
          };
        }
        return invItem;
      }));
    });

    // Accounting posting
    const newJe: JournalEntry = {
      id: `je-${uid()}`,
      entryNumber: `JE-GRN-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      source: 'PO Receiving',
      description: `GRN Received from ${po.supplierName} (${po.poNumber}) - Passed Temp ${tempCelsius}°C`,
      debitAccount: '1210 - Food Inventory Asset',
      creditAccount: '2010 - Accounts Payable (Trade)',
      amount: po.totalAmount,
      siteId: po.siteId
    };
    setJournalEntries(prev => [newJe, ...prev]);
  };

  // Production Orders (Central Kitchen)
  const createProductionOrder = (batchData: Omit<ProductionOrder, 'id' | 'batchNumber' | 'status'>) => {
    const newBatch: ProductionOrder = {
      ...batchData,
      id: `prod-${uid()}`,
      batchNumber: `CK-BCH-${Date.now().toString().slice(-4)}`,
      status: 'Planned'
    };
    setProductionOrders(prev => [newBatch, ...prev]);
  };

  const updateProductionStatus = (id: string, status: ProductionOrder['status']) => {
    setProductionOrders(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // Menu Items
  const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `menu-${uid()}`
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(prev => prev.map(m => m.id === item.id ? item : m));
  };

  // Checklist
  const toggleChecklist = (id: string, recordedValue?: string) => {
    setChecklists(prev => prev.map(chk => {
      if (chk.id === id) {
        const nextCompleted = !chk.completed;
        return {
          ...chk,
          completed: nextCompleted,
          signedBy: nextCompleted ? `${currentRole} - Staff` : undefined,
          recordedValue: recordedValue || chk.recordedValue
        };
      }
      return chk;
    }));
  };

  // Employee
  const toggleEmployeeClockIn = (empId: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const nextClock = !emp.clockedIn;
        return {
          ...emp,
          clockedIn: nextClock,
          clockInTime: nextClock ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      }
      return emp;
    }));
  };

  const addEmployee = (empData: Omit<Employee, 'id' | 'clockedIn'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${uid()}`,
      clockedIn: false
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
  };

  // Execute Day End Close
  const executeDayEndClose = (countedCash: number): DayEndReport => {
    const paidOrders = orders.filter(o => o.status === 'paid' && o.siteId === currentSite.id);
    const grossSales = paidOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const discounts = paidOrders.reduce((sum, o) => sum + o.discount, 0);
    const netSales = grossSales - discounts;
    const taxCollected = paidOrders.reduce((sum, o) => sum + o.tax, 0);
    const serviceCharge = paidOrders.reduce((sum, o) => sum + o.serviceCharge, 0);

    const cashOrders = paidOrders.filter(o => o.paymentMethod === 'Cash');
    const openingFloat = 500000;
    const cashCollectedExpected = openingFloat + cashOrders.reduce((sum, o) => sum + o.total, 0);
    const cashOverShort = countedCash - cashCollectedExpected;

    const cardPayments = paidOrders.filter(o => o.paymentMethod === 'Credit Card').reduce((sum, o) => sum + o.total, 0);
    const mobileMoneyPayments = paidOrders.filter(o => o.paymentMethod === 'M-Pesa / Mobile Money').reduce((sum, o) => sum + o.total, 0);
    const totalCovers = paidOrders.reduce((sum, o) => sum + o.guestCount, 0);

    const voidOrders = orders.filter(o => o.status === 'voided' && o.siteId === currentSite.id);
    const voidCount = voidOrders.length;
    const voidTotal = voidOrders.reduce((sum, o) => sum + o.total, 0);
    const wasteTotalCost = wasteEntries.reduce((sum, w) => sum + w.totalCost, 0);

    const report: DayEndReport = {
      date: new Date().toISOString().split('T')[0],
      siteName: currentSite.name,
      openingFloat,
      grossSales,
      discounts,
      netSales,
      taxCollected,
      serviceCharge,
      cashCollectedExpected,
      cashCountedActual: countedCash,
      cashOverShort,
      cardPayments,
      mobileMoneyPayments,
      totalCovers,
      voidCount,
      voidTotal,
      wasteTotalCost,
      closedBy: `${currentRole} - ${currentSite.manager}`,
      timestamp: new Date().toLocaleString()
    };

    setDayEndReports(prev => [report, ...prev]);
    setDayStatus('CLOSED');
    return report;
  };

  const reopenDay = () => setDayStatus('OPEN');

  const resetToDemo = () => {
    setTables(INITIAL_TABLES);
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders(INITIAL_ORDERS);
    setInventory(INITIAL_INVENTORY);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setProductionOrders(INITIAL_PRODUCTION_ORDERS);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    setEmployees(INITIAL_EMPLOYEES);
    setChecklists(INITIAL_CHECKLISTS);
    setCustomers(INITIAL_CUSTOMERS);
    setCashDrawerTransactions(INITIAL_CASH_DRAWER_TRANSACTIONS);
    setWaiterProfiles(INITIAL_WAITER_PROFILES);
    setCommissionPolicies(INITIAL_COMMISSION_POLICIES);
    setCommissionLedger(INITIAL_COMMISSION_LEDGER);
    setCommissionPayouts(INITIAL_COMMISSION_PAYOUTS);
    setBillRequests(INITIAL_BILL_REQUESTS);
    setCashSettlements(INITIAL_CASH_SETTLEMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveCustomerWaiterCode('W-101');
    setDayStatus('OPEN');
  };

  return (
    <ErpContext.Provider
      value={{
        currentSite,
        setCurrentSite,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        isOffline,
        toggleOffline,
        sidebarDrawerOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        commandPaletteOpen,
        setCommandPaletteOpen,
        setSidebarDrawerOpen,
        sites,
        tables,
        menuItems,
        orders,
        inventory,
        wasteEntries,
        suppliers,
        purchaseOrders,
        productionOrders,
        journalEntries,
        employees,
        checklists,
        dayEndReports,
        dayStatus,
        customers,
        cashDrawerTransactions,
        serviceMode,
        setServiceMode,
        addOrder,
        addItemsToOrder,
        updateOrderItemStatus,
        requestBill,
        addCustomer,
        updateCustomer,
        addCashDrawerTransaction,
        updateOrderStatus,
        bumpKDSTicket,
        toggle86,
        payOrder,
        voidOrder,
        applyOrderDiscount,
        updateTableStatus,
        addInventoryItem,
        updateInventoryItem,
        logWaste,
        createPurchaseOrder,
        approvePurchaseOrder,
        receivePurchaseOrder,
        createProductionOrder,
        updateProductionStatus,
        addMenuItem,
        updateMenuItem,
        toggleChecklist,
        toggleEmployeeClockIn,
        addEmployee,
        updateEmployee,
        executeDayEndClose,
        reopenDay,
        resetToDemo,
        isAuthenticated,
        currentUser,
        setCurrentUser,
        loginWithPin,
        loginWithCredentials,
        registerUser,
        logout,
        accounts,
        journalMoves,
        bankStatements,
        vendorBills,
        addJournalMove,
        postJournalMove,
        cancelJournalMove,
        addVendorBill,
        payVendorBill,
        reconcileBankStatement,
        // Waiter Commissions & Customer Portal Routing Module
        waiterProfiles,
        commissionPolicies,
        commissionLedger,
        commissionPayouts,
        billRequests,
        cashSettlements,
        auditLogs,
        activeCustomerWaiterCode,
        setActiveCustomerWaiterCode,
        getEffectivePolicyForWaiter,
        calculateOrderCommission,
        rotateWaiterLink,
        recordWaiterDirectPayment,
        submitBillRequest,
        settleBillRequest,
        updateCommissionPolicy,
        approveCommissionEntries,
        payoutCommissions,
        recordCashHandover,
        reverseCommissionEntry
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const ctx = useContext(ErpContext);
  if (!ctx) throw new Error('useErp must be used within an ErpProvider');
  return ctx;
};
