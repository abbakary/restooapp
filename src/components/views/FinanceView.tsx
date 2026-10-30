import React, { useState, useMemo } from 'react';
import { useToast } from '../common/Toast';
import { 
  Building2, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft,
  Download, 
  Filter, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Eye,
  CreditCard,
  FileText,
  Layers,
  Scale,
  RefreshCw,
  X,
  Printer,
  Calendar,
  Check,
  Package,
  Clock,
  Briefcase,
  Users,
  ShoppingBag,
  Coins,
  Sliders,
  ExternalLink,
  MessageSquare,
  Wrench
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { 
  OdooJournalType, 
  VendorBill, 
  JournalMove 
} from '../../types/erp';
import { 
  ODOO_TRIAL_BALANCE_ACCOUNTS,
  ODOO_GENERAL_LEDGER_DATA,
  ODOO_PARTNER_LEDGER_DATA,
  ODOO_AGED_RECEIVABLES,
  ODOO_CUSTOMER_INVOICES,
  ODOO_CREDIT_NOTES,
  ODOO_PAYMENTS_LIST,
  ODOO_PRODUCTS,
  ODOO_CUSTOMERS_LIST,
  OdooInvoice
} from '../../data/odoo19FullData';

type OdooNavSection = 
  | 'dashboard'
  // Customers
  | 'invoices'
  | 'credit_notes'
  | 'cust_payments'
  | 'products'
  | 'customers'
  // Vendors
  | 'vendor_bills'
  | 'vendor_refunds'
  | 'vendor_payments'
  | 'vendor_products'
  | 'vendors'
  // Accounting
  | 'journal_entries'
  | 'journal_items'
  | 'bank_cash'
  // Reporting
  | 'balance_sheet'
  | 'pnl'
  | 'cash_flow'
  | 'trial_balance'
  | 'general_ledger'
  | 'partner_ledger'
  | 'aged_receivable'
  | 'aged_payable'
  | 'tax_return'
  | 'invoices_analysis'
  // Configuration
  | 'coa'
  | 'taxes'
  | 'journals'
  | 'payment_terms'
  | 'currencies';

export const FinanceView: React.FC = () => {
  const toast = useToast();
  const { 
    currentSite, 
    sites, 
    accounts, 
    journalMoves, 
    bankStatements, 
    vendorBills, 
    addJournalMove, 
    addVendorBill, 
    payVendorBill, 
    reconcileBankStatement 
  } = useErp();

  // Active Odoo Navigation View
  const [currentView, setCurrentView] = useState<OdooNavSection>('trial_balance');
  const [activeMenuDropdown, setActiveMenuDropdown] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Oct 2026');
  const [showUnpostedWarning, setShowUnpostedWarning] = useState<boolean>(true);
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({
    '1011': true,
    '1031': true,
    '1900': true
  });
  const [expandedPartners, setExpandedPartners] = useState<Record<string, boolean>>({
    'Ashura Juma': true,
    'Zalongwa Technologies Limited': true
  });

  // Modals
  const [inspectingInvoice, setInspectingInvoice] = useState<OdooInvoice | null>(null);
  const [isNewMoveModalOpen, setIsNewMoveModalOpen] = useState<boolean>(false);
  const [isNewBillModalOpen, setIsNewBillModalOpen] = useState<boolean>(false);
  const [payingBill, setPayingBill] = useState<VendorBill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CRDB Bank' | 'M-Pesa / Mobile Money' | 'Cash'>('CRDB Bank');

  // New Journal Move form state
  const [moveDate, setMoveDate] = useState<string>('2026-10-27');
  const [moveJournal, setMoveJournal] = useState<OdooJournalType>('general');
  const [moveRef, setMoveRef] = useState<string>('');
  const [movePartner, setMovePartner] = useState<string>('');
  const [moveLines, setMoveLines] = useState<
    { accountId: string; name: string; debit: number; credit: number }[]
  >([
    { accountId: accounts[0]?.id || 'acc-1010', name: '', debit: 0, credit: 0 },
    { accountId: accounts[10]?.id || 'acc-2010', name: '', debit: 0, credit: 0 }
  ]);

  // New Bill form state
  const [billVendorName, setBillVendorName] = useState<string>('Tanzanian Prime Meats Ltd');
  const [billDate, setBillDate] = useState<string>('2026-10-27');
  const [billDueDate, setBillDueDate] = useState<string>('2026-11-15');
  const [billRef, setBillRef] = useState<string>('');
  const [billItems, setBillItems] = useState<
    { description: string; accountId: string; quantity: number; unitPrice: number; taxRate: number }[]
  >([
    { description: 'Butchery Fresh Prime Cuts', accountId: 'acc-1210', quantity: 20, unitPrice: 25000, taxRate: 0.18 }
  ]);

  // Form helpers
  const handleAddLineToMove = () => {
    setMoveLines(prev => [
      ...prev,
      { accountId: accounts[0]?.id || 'acc-1010', name: '', debit: 0, credit: 0 }
    ]);
  };

  const handleUpdateMoveLine = (idx: number, field: string, value: any) => {
    setMoveLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const handleRemoveMoveLine = (idx: number) => {
    if (moveLines.length <= 2) return;
    setMoveLines(prev => prev.filter((_, i) => i !== idx));
  };

  const moveDebitSum = moveLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const moveCreditSum = moveLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const moveIsBalanced = moveDebitSum === moveCreditSum && moveDebitSum > 0;

  const handleSaveMove = (status: 'draft' | 'posted') => {
    if (status === 'posted' && !moveIsBalanced) {
      toast.error('Cannot post an unbalanced entry', `Debits TZS ${moveDebitSum.toLocaleString()} must equal credits TZS ${moveCreditSum.toLocaleString()}.`);
      return;
    }
    const formattedLines = moveLines.map((l, idx) => {
      const acc = accounts.find(a => a.id === l.accountId);
      return {
        id: `ln-${Date.now()}-${idx}`,
        accountId: l.accountId,
        accountCode: acc?.code || '1010',
        accountName: acc?.name || 'Account',
        partner: movePartner,
        name: l.name || moveRef || 'Journal Move Item',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0
      };
    });
    addJournalMove({
      name: `MISC/2026/0${Math.floor(100 + Math.random() * 899)}`,
      date: moveDate,
      journalType: moveJournal,
      ref: moveRef,
      partnerName: movePartner,
      state: status,
      siteId: currentSite.id,
      amountTotal: moveDebitSum,
      lines: formattedLines
    });
    setIsNewMoveModalOpen(false);
  };

  const handleSaveBill = () => {
    const subtotal = billItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;
    addVendorBill({
      vendorId: `sup-${Math.floor(10 + Math.random() * 89)}`,
      vendorName: billVendorName,
      billDate,
      dueDate: billDueDate,
      siteId: currentSite.id,
      reference: billRef,
      items: billItems.map(i => ({
        description: i.description,
        accountId: i.accountId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        taxRate: i.taxRate,
        total: i.quantity * i.unitPrice
      })),
      subtotal,
      taxAmount,
      totalAmount,
      status: 'posted',
      paymentState: 'not_paid'
    });
    setIsNewBillModalOpen(false);
  };

  // Toggle account expansion in General Ledger
  const toggleAccount = (code: string) => {
    setExpandedAccounts(prev => ({ ...prev, [code]: !prev[code] }));
  };

  // Toggle partner expansion in Partner Ledger
  const togglePartner = (name: string) => {
    setExpandedPartners(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Export handlers
  const handleExport = (format: 'PDF' | 'XLSX') => {
    const filename = `Odoo_${currentView.toUpperCase()}_${selectedPeriod.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
    const dummyContent = `Odoo 19 Report: ${currentView}\nPeriod: ${selectedPeriod}\nGenerated: ${new Date().toISOString()}\nCompany: NGOME HOLDING GROUP LIMITED\nCurrency: TSh`;
    const blob = new Blob([dummyContent], { type: format === 'PDF' ? 'application/pdf' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format currency helper
  const fmt = (num: number, showSymbol = false) => {
    const s = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return showSymbol ? `${s} TSh` : s;
  };

  // Human view title
  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Accounting Dashboard';
      case 'invoices': return 'Invoices';
      case 'credit_notes': return 'Credit Notes';
      case 'cust_payments': return 'Payments';
      case 'products': return 'Products';
      case 'customers': return 'Customers';
      case 'vendor_bills': return 'Bills';
      case 'vendor_refunds': return 'Refunds';
      case 'vendor_payments': return 'Payments';
      case 'vendor_products': return 'Products';
      case 'vendors': return 'Vendors';
      case 'journal_entries': return 'Journal Entries';
      case 'journal_items': return 'Journal Items';
      case 'bank_cash': return 'Bank and Cash';
      case 'balance_sheet': return 'Balance Sheet';
      case 'pnl': return 'Profit and Loss';
      case 'cash_flow': return 'Cash Flow Statement';
      case 'trial_balance': return 'Trial Balance';
      case 'general_ledger': return 'General Ledger';
      case 'partner_ledger': return 'Partner Ledger';
      case 'aged_receivable': return 'Aged Receivable';
      case 'aged_payable': return 'Aged Payable';
      case 'tax_return': return 'Tax Return (TZ VAT Return)';
      case 'invoices_analysis': return 'Customer Invoices Analysis';
      case 'coa': return 'Chart of Accounts';
      case 'taxes': return 'Taxes';
      case 'journals': return 'Journals';
      case 'payment_terms': return 'Payment Terms';
      case 'currencies': return 'Currencies';
      default: return 'Accounting';
    }
  };

  return (
    <div className="font-sans text-slate-800 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col min-h-[850px]">
      
      {/* =========================================================================
          1. ODOO 19 ENTERPRISE TOP NAVIGATION BAR (Exact match to screenshots)
         ========================================================================= */}
      <header className="bg-[#1f2937] text-slate-200 border-b border-slate-700/80 px-4 py-2 flex items-center justify-between text-xs select-none relative z-30">
        
        {/* Left: Odoo Logo + Menus */}
        <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
          {/* Odoo Accounting Brand Badge */}
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <div className="w-5 h-5 rounded-md bg-[#e07a2a] flex items-center justify-center text-white font-black text-xs shadow-2xs">
              <span className="transform -rotate-12">✦</span>
            </div>
            <span className="font-bold text-white text-sm tracking-tight hidden sm:inline">Accounting</span>
          </div>

          {/* Menus */}
          {/* Dashboard */}
          <button
            onClick={() => { setCurrentView('dashboard'); setActiveMenuDropdown(null); }}
            className={`px-2.5 py-1.5 rounded hover:bg-slate-800 transition cursor-pointer font-medium ${
              currentView === 'dashboard' ? 'text-white bg-slate-800 font-bold' : 'text-slate-300'
            }`}
          >
            Dashboard
          </button>

          {/* Customers Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveMenuDropdown(activeMenuDropdown === 'customers' ? null : 'customers')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-slate-800 transition cursor-pointer font-medium ${
                ['invoices', 'credit_notes', 'cust_payments', 'products', 'customers'].includes(currentView)
                  ? 'text-white bg-slate-800 font-bold'
                  : 'text-slate-300'
              }`}
            >
              <span>Customers</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {activeMenuDropdown === 'customers' && (
              <div 
                className="absolute left-0 mt-1 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 text-xs z-50 animate-in fade-in duration-100"
                onClick={() => setActiveMenuDropdown(null)}
              >
                <button onClick={() => setCurrentView('invoices')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Invoices</button>
                <button onClick={() => setCurrentView('credit_notes')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Credit Notes</button>
                <button onClick={() => setCurrentView('cust_payments')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Payments</button>
                <div className="border-t border-slate-100 my-1" />
                <button onClick={() => setCurrentView('products')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Products</button>
                <button onClick={() => setCurrentView('customers')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Customers</button>
              </div>
            )}
          </div>

          {/* Vendors Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveMenuDropdown(activeMenuDropdown === 'vendors' ? null : 'vendors')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-slate-800 transition cursor-pointer font-medium ${
                ['vendor_bills', 'vendor_refunds', 'vendor_payments', 'vendor_products', 'vendors'].includes(currentView)
                  ? 'text-white bg-slate-800 font-bold'
                  : 'text-slate-300'
              }`}
            >
              <span>Vendors</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {activeMenuDropdown === 'vendors' && (
              <div 
                className="absolute left-0 mt-1 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 text-xs z-50 animate-in fade-in duration-100"
                onClick={() => setActiveMenuDropdown(null)}
              >
                <button onClick={() => setCurrentView('vendor_bills')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Bills</button>
                <button onClick={() => setCurrentView('vendor_refunds')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Refund / Credit Notes</button>
                <button onClick={() => setCurrentView('vendor_payments')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Payments</button>
                <div className="border-t border-slate-100 my-1" />
                <button onClick={() => setCurrentView('vendor_products')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Products</button>
                <button onClick={() => setCurrentView('vendors')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Vendors</button>
              </div>
            )}
          </div>

          {/* Accounting Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveMenuDropdown(activeMenuDropdown === 'accounting' ? null : 'accounting')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-slate-800 transition cursor-pointer font-medium ${
                ['journal_entries', 'journal_items', 'bank_cash'].includes(currentView)
                  ? 'text-white bg-slate-800 font-bold'
                  : 'text-slate-300'
              }`}
            >
              <span>Accounting</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {activeMenuDropdown === 'accounting' && (
              <div 
                className="absolute left-0 mt-1 w-52 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 text-xs z-50 animate-in fade-in duration-100"
                onClick={() => setActiveMenuDropdown(null)}
              >
                <button onClick={() => setCurrentView('journal_entries')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Journal Entries</button>
                <button onClick={() => setCurrentView('journal_items')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Journal Items</button>
                <button onClick={() => setCurrentView('bank_cash')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Bank and Cash</button>
              </div>
            )}
          </div>

          {/* Review */}
          <button
            onClick={() => { setCurrentView('journal_entries'); setActiveMenuDropdown(null); }}
            className="px-2.5 py-1.5 rounded hover:bg-slate-800 transition cursor-pointer font-medium text-slate-300 hidden md:inline"
          >
            Review
          </button>

          {/* Reporting Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveMenuDropdown(activeMenuDropdown === 'reporting' ? null : 'reporting')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-slate-800 transition cursor-pointer font-medium ${
                ['balance_sheet', 'pnl', 'cash_flow', 'trial_balance', 'general_ledger', 'partner_ledger', 'aged_receivable', 'aged_payable', 'tax_return', 'invoices_analysis'].includes(currentView)
                  ? 'text-white bg-slate-800 font-bold'
                  : 'text-slate-300'
              }`}
            >
              <span>Reporting</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {activeMenuDropdown === 'reporting' && (
              <div 
                className="absolute left-0 mt-1 w-64 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 text-xs z-50 animate-in fade-in duration-100"
                onClick={() => setActiveMenuDropdown(null)}
              >
                <div className="px-3 py-1 text-2xs font-bold text-slate-400 uppercase tracking-wider">Statement Reports</div>
                <button onClick={() => setCurrentView('balance_sheet')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium flex items-center justify-between">
                  <span>Balance Sheet</span>
                  <span className="text-2xs text-emerald-600 font-mono">10.2M TSh</span>
                </button>
                <button onClick={() => setCurrentView('pnl')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium flex items-center justify-between">
                  <span>Profit and Loss</span>
                  <span className="text-2xs text-slate-500 font-mono">FY2026</span>
                </button>
                <button onClick={() => setCurrentView('cash_flow')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Cash Flow Statement</button>
                <div className="border-t border-slate-100 my-1" />
                <div className="px-3 py-1 text-2xs font-bold text-slate-400 uppercase tracking-wider">Audit & Ledgers</div>
                <button onClick={() => setCurrentView('trial_balance')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium flex items-center justify-between">
                  <span>Trial Balance</span>
                  <span className="text-2xs text-amber-600 font-mono font-bold">405.5M TSh</span>
                </button>
                <button onClick={() => setCurrentView('general_ledger')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium flex items-center justify-between">
                  <span>General Ledger</span>
                  <span className="text-2xs text-amber-600 font-mono font-bold">422.4M TSh</span>
                </button>
                <button onClick={() => setCurrentView('partner_ledger')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium flex items-center justify-between">
                  <span>Partner Ledger</span>
                  <span className="text-2xs text-slate-500 font-mono">215.3M TSh</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <div className="px-3 py-1 text-2xs font-bold text-slate-400 uppercase tracking-wider">Partner Reports</div>
                <button onClick={() => setCurrentView('aged_receivable')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium flex items-center justify-between">
                  <span>Aged Receivable</span>
                  <span className="text-2xs text-rose-600 font-mono">4.97M TSh</span>
                </button>
                <button onClick={() => setCurrentView('aged_payable')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Aged Payable</button>
                <button onClick={() => setCurrentView('tax_return')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Tax Return (TZ VAT Return)</button>
                <button onClick={() => setCurrentView('invoices_analysis')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Customer Invoices Analysis</button>
              </div>
            )}
          </div>

          {/* Configuration Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveMenuDropdown(activeMenuDropdown === 'configuration' ? null : 'configuration')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded hover:bg-slate-800 transition cursor-pointer font-medium ${
                ['coa', 'taxes', 'journals', 'payment_terms', 'currencies'].includes(currentView)
                  ? 'text-white bg-slate-800 font-bold'
                  : 'text-slate-300'
              }`}
            >
              <span>Configuration</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {activeMenuDropdown === 'configuration' && (
              <div 
                className="absolute left-0 mt-1 w-52 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 text-xs z-50 animate-in fade-in duration-100"
                onClick={() => setActiveMenuDropdown(null)}
              >
                <button onClick={() => setCurrentView('coa')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Chart of Accounts</button>
                <button onClick={() => setCurrentView('taxes')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Taxes</button>
                <button onClick={() => setCurrentView('journals')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Journals</button>
                <button onClick={() => setCurrentView('payment_terms')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Payment Terms</button>
                <button onClick={() => setCurrentView('currencies')} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 font-medium">Currencies</button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications, Company name, Avatar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <button className="hover:text-white transition cursor-pointer relative" title="Messages & Activities">
              <MessageSquare className="w-4 h-4" />
              <span className="absolute -top-1.5 -right-1.5 bg-[#e07a2a] text-white text-2xs font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">4</span>
            </button>
            <button className="hover:text-white transition cursor-pointer" title="Scheduled Activities">
              <Clock className="w-4 h-4" />
            </button>
            <button className="hover:text-white transition cursor-pointer" title="Studio Customizer">
              <Wrench className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <span className="font-semibold text-slate-200 text-xs tracking-tight hidden lg:inline">
              NGOME HOLDING GROUP LIMITED
            </span>
            <div className="w-6 h-6 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-400/40">
              A
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. ODOO 19 SUBHEADER ACTION BAR (Exact match to screenshots)
         ========================================================================= */}
      <div className="bg-[#f8f9fa] border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Buttons & Title */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* PDF Export button in authentic Odoo orange */}
          <button
            onClick={() => handleExport('PDF')}
            className="px-3.5 py-1.5 rounded bg-[#e07a2a] hover:bg-[#cf6f23] text-white font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <span>PDF</span>
          </button>

          {/* XLSX Export button */}
          <button
            onClick={() => handleExport('XLSX')}
            className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <span>XLSX</span>
          </button>

          {/* Section Title */}
          <h2 className="text-base font-bold text-slate-900 tracking-tight ml-2">
            {getViewTitle()}
          </h2>

          {/* Create Button for Invoices / Bills / Entries */}
          {['invoices', 'vendor_bills', 'journal_entries'].includes(currentView) && (
            <button
              onClick={() => {
                if (currentView === 'vendor_bills') setIsNewBillModalOpen(true);
                else setIsNewMoveModalOpen(true);
              }}
              className="ml-2 px-3 py-1.5 rounded bg-[#714b67] hover:bg-[#5b3c53] text-white font-bold transition shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          )}
        </div>

        {/* Middle & Right: Search and Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-hidden focus:border-slate-500 w-40 sm:w-56"
            />
          </div>

          {/* Period Filter Chip */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-semibold text-slate-700 cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{selectedPeriod}</span>
          </div>

          {/* Comparison Filter Chip */}
          <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-700 cursor-pointer font-medium">
            <span>% Comparison</span>
          </div>

          {/* All Journals Chip */}
          <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-700 cursor-pointer font-medium hidden md:flex">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>All Journals</span>
          </div>

          {/* Analytic Chip */}
          <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-700 cursor-pointer font-medium hidden lg:flex">
            <Filter className="w-3 h-3 text-slate-500" />
            <span>Analytic</span>
          </div>

          {/* Posted Entries Chip */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-semibold text-slate-700 cursor-pointer hidden sm:flex">
            <span>Posted Entries, Accrual Basis</span>
          </div>

          {/* Currency Chip */}
          <div className="px-2 py-1.5 bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">
            <span>In .TSh</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. ODOO UNPOSTED ENTRIES WARNING BANNER (Exact text from screenshot)
         ========================================================================= */}
      {showUnpostedWarning && (
        <div className="bg-[#e0f2fe] border-b border-[#bae6fd] px-4 py-2 text-center text-xs text-[#0369a1] font-medium flex items-center justify-center gap-2">
          <span>There are</span>
          <button 
            onClick={() => setCurrentView('journal_entries')} 
            className="text-[#c2410c] hover:underline font-semibold cursor-pointer"
          >
            unposted Journal Entries
          </button>
          <span>prior or included in this period.</span>
          <button 
            onClick={() => setShowUnpostedWarning(false)}
            className="ml-3 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          4. MAIN VIEW CONTENTS
         ========================================================================= */}
      <div className="flex-1 p-4 sm:p-6 overflow-x-auto bg-slate-50/50">

        {/* -------------------------------------------------------------
            A. TRIAL BALANCE (Exact match to screenshot 2)
           ------------------------------------------------------------- */}
        {currentView === 'trial_balance' && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-4 font-semibold w-1/3"></th>
                  <th className="py-2.5 px-4 font-semibold text-right border-l border-slate-200">Initial Balance</th>
                  <th colSpan={2} className="py-2.5 px-4 font-semibold text-center border-l border-slate-200">
                    Oct 2026
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-right border-l border-slate-200">End Balance</th>
                </tr>
                <tr className="bg-slate-50/80 text-slate-500 text-xs border-b border-slate-200">
                  <th className="py-1.5 px-4 font-normal">Account</th>
                  <th className="py-1.5 px-4 font-normal text-right border-l border-slate-200">Balance</th>
                  <th className="py-1.5 px-4 font-normal text-right border-l border-slate-200">Debit</th>
                  <th className="py-1.5 px-4 font-normal text-right">Credit</th>
                  <th className="py-1.5 px-4 font-normal text-right border-l border-slate-200">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ODOO_TRIAL_BALANCE_ACCOUNTS
                  .filter(acc => !searchQuery || acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || acc.code.includes(searchQuery))
                  .map((acc) => (
                    <tr key={acc.code} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-2 px-4 font-sans text-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{acc.code}</span>
                          <span>{acc.name}</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-400">
                          <button 
                            onClick={() => { setCurrentView('general_ledger'); }}
                            title="Drilldown into General Ledger" 
                            className="hover:text-slate-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-right border-l border-slate-100 text-slate-600">
                        {fmt(acc.initialBalance)}
                      </td>
                      <td className="py-2 px-4 text-right border-l border-slate-100 text-slate-800">
                        {acc.debit > 0 ? fmt(acc.debit) : '0.00'}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-800">
                        {acc.credit > 0 ? fmt(acc.credit) : '0.00'}
                      </td>
                      <td className={`py-2 px-4 text-right border-l border-slate-100 font-bold ${
                        acc.endBalance < 0 ? 'text-[#c2410c]' : 'text-slate-900'
                      }`}>
                        {fmt(acc.endBalance)}
                      </td>
                    </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300 font-mono">
                  <td className="py-3 px-4 font-sans text-sm">Total</td>
                  <td className="py-3 px-4 text-right border-l border-slate-200">0.00</td>
                  <td className="py-3 px-4 text-right border-l border-slate-200 text-[#b45309]">405,529,199.12</td>
                  <td className="py-3 px-4 text-right text-[#b45309]">405,529,199.12</td>
                  <td className="py-3 px-4 text-right border-l border-slate-200 text-emerald-700 font-bold">0.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            B. GENERAL LEDGER (Exact match to screenshot 3)
           ------------------------------------------------------------- */}
        {currentView === 'general_ledger' && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th colSpan={3} className="py-2.5 px-4 font-semibold text-center">
                    Oct 2026
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-right">Debit</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Credit</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Balance</th>
                </tr>
                <tr className="bg-slate-50/80 text-slate-500 text-xs border-b border-slate-200">
                  <th className="py-1.5 px-4 font-normal">Date</th>
                  <th className="py-1.5 px-4 font-normal">Partner</th>
                  <th className="py-1.5 px-4 font-normal">Currency</th>
                  <th className="py-1.5 px-4 font-normal text-right"></th>
                  <th className="py-1.5 px-4 font-normal text-right"></th>
                  <th className="py-1.5 px-4 font-normal text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ODOO_GENERAL_LEDGER_DATA
                  .filter(acc => !searchQuery || acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || acc.code.includes(searchQuery))
                  .map((acc) => {
                    const isExpanded = !!expandedAccounts[acc.code];
                    return (
                      <React.Fragment key={acc.code}>
                        {/* Account Parent Row */}
                        <tr 
                          onClick={() => toggleAccount(acc.code)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer font-sans bg-slate-50/40"
                        >
                          <td colSpan={3} className="py-2.5 px-4">
                            <div className="flex items-center gap-2 text-slate-900 font-semibold">
                              <span className="text-slate-400">
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </span>
                              <span>{acc.code}</span>
                              <span>{acc.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-900">
                            {fmt(acc.debit, true)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-900">
                            {fmt(acc.credit, true)}
                          </td>
                          <td className={`py-2.5 px-4 text-right font-mono font-bold ${
                            acc.balance < 0 ? 'text-[#c2410c]' : 'text-slate-900'
                          }`}>
                            {fmt(acc.balance, true)}
                          </td>
                        </tr>

                        {/* Account Children Line Items */}
                        {isExpanded && acc.lines?.map((line, idx) => (
                          <tr key={idx} className="bg-white hover:bg-slate-50/80 text-xs text-slate-600">
                            <td className="py-1.5 px-8 font-sans">{line.date}</td>
                            <td className="py-1.5 px-4 font-sans text-slate-800">{line.partner} - <span className="text-slate-500 italic">{line.label}</span></td>
                            <td className="py-1.5 px-4 font-mono text-slate-400">TSh</td>
                            <td className="py-1.5 px-4 text-right font-mono">{line.debit > 0 ? fmt(line.debit) : '0.00'}</td>
                            <td className="py-1.5 px-4 text-right font-mono">{line.credit > 0 ? fmt(line.credit) : '0.00'}</td>
                            <td className="py-1.5 px-4 text-right font-mono">{fmt(line.balance)}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 font-mono text-xs">
                  <td colSpan={3} className="py-3 px-4 font-sans text-sm">Total General Ledger</td>
                  <td className="py-3 px-4 text-right text-slate-900">422,395,185.66 TSh</td>
                  <td className="py-3 px-4 text-right text-slate-900">422,395,185.66 TSh</td>
                  <td className="py-3 px-4 text-right text-emerald-700 font-bold">0.00 TSh</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            C. PARTNER LEDGER (Exact match to screenshot 4)
           ------------------------------------------------------------- */}
        {currentView === 'partner_ledger' && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th colSpan={5} className="py-2.5 px-4 font-semibold text-center">
                    2026
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-right">Debit</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Credit</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount Currency</th>
                </tr>
                <tr className="bg-slate-50/80 text-slate-500 text-xs border-b border-slate-200">
                  <th className="py-1.5 px-4 font-normal">Partner / Details</th>
                  <th className="py-1.5 px-4 font-normal">Journal</th>
                  <th className="py-1.5 px-4 font-normal">Account</th>
                  <th className="py-1.5 px-4 font-normal">Invoice Date</th>
                  <th className="py-1.5 px-4 font-normal">Matching</th>
                  <th className="py-1.5 px-4 font-normal text-right"></th>
                  <th className="py-1.5 px-4 font-normal text-right"></th>
                  <th className="py-1.5 px-4 font-normal text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ODOO_PARTNER_LEDGER_DATA
                  .filter(p => !searchQuery || p.partner.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => {
                    const isExpanded = !!expandedPartners[p.partner];
                    return (
                      <React.Fragment key={p.partner}>
                        {/* Partner Parent Row */}
                        <tr 
                          onClick={() => togglePartner(p.partner)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer font-sans bg-slate-50/40"
                        >
                          <td colSpan={5} className="py-2.5 px-4">
                            <div className="flex items-center gap-2 text-slate-900 font-semibold">
                              <span className="text-slate-400">
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </span>
                              <span>{p.partner}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-900">
                            {fmt(p.debit, true)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-900">
                            {fmt(p.credit, true)}
                          </td>
                          <td className={`py-2.5 px-4 text-right font-mono font-bold ${
                            p.balance > 0 ? 'text-[#c2410c]' : 'text-slate-900'
                          }`}>
                            {fmt(p.amountCurrency || p.balance, true)}
                          </td>
                        </tr>

                        {/* Partner Breakdown Subrows */}
                        {isExpanded && p.lines?.map((line, idx) => (
                          <tr key={idx} className="bg-white hover:bg-slate-50/80 text-xs text-slate-600">
                            <td className="py-1.5 px-8 font-sans">{line.moveName} - {line.label}</td>
                            <td className="py-1.5 px-4 font-sans text-slate-500">{p.journal}</td>
                            <td className="py-1.5 px-4 font-sans text-slate-500">{p.account}</td>
                            <td className="py-1.5 px-4 font-sans">{line.date}</td>
                            <td className="py-1.5 px-4 font-sans text-emerald-600 font-medium">{p.matching}</td>
                            <td className="py-1.5 px-4 text-right font-mono">{line.debit > 0 ? fmt(line.debit) : '0.00'}</td>
                            <td className="py-1.5 px-4 text-right font-mono">{line.credit > 0 ? fmt(line.credit) : '0.00'}</td>
                            <td className="py-1.5 px-4 text-right font-mono">{fmt(line.balance)}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 font-mono text-xs">
                  <td colSpan={5} className="py-3 px-4 font-sans text-sm">Total</td>
                  <td className="py-3 px-4 text-right text-slate-900">215,346,564.58 TSh</td>
                  <td className="py-3 px-4 text-right text-slate-900">211,986,989.12 TSh</td>
                  <td className="py-3 px-4 text-right text-emerald-700 font-bold">5,699,431.00 TSh</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            D. BALANCE SHEET (Exact figures from prompt)
           ------------------------------------------------------------- */}
        {currentView === 'balance_sheet' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Balance Sheet</h3>
                  <p className="text-xs text-slate-500">As of 10/27/2026 (Expressed in Tanzanian Shillings)</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold">
                    ✓ Perfectly Balanced (Variance: 0.00)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active / Assets */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-100/80 px-3.5 py-2 rounded-lg font-bold text-slate-900">
                    <span>Active (Assets)</span>
                    <span className="font-mono text-sm">10,208,186.54</span>
                  </div>

                  <div className="pl-2 space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 py-1 border-b border-slate-100">
                        <span>Non currents assets</span>
                        <span className="font-mono">0.00</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-500 flex justify-between">
                        <span>Property, plant & equipment</span>
                        <span className="font-mono">0.00</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-500 flex justify-between">
                        <span>Goodwill & Intangible assets</span>
                        <span className="font-mono">0.00</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 py-1 border-b border-slate-100">
                        <span>Currents assets</span>
                        <span className="font-mono text-slate-900 font-bold">10,208,186.54</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-600 flex justify-between">
                        <span>Inventories</span>
                        <span className="font-mono">0.00</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-800 flex justify-between font-medium">
                        <span>Trade receivables</span>
                        <span className="font-mono text-[#b45309]">4,979,004.42</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-800 flex justify-between font-medium">
                        <span>Cash and cash equivalents</span>
                        <span className="font-mono text-emerald-700">5,229,182.12</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-500 flex justify-between">
                        <span>Other current assets</span>
                        <span className="font-mono">0.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passive / Liabilities & Equity */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-100/80 px-3.5 py-2 rounded-lg font-bold text-slate-900">
                    <span>Passive (Equity & Liabilities)</span>
                    <span className="font-mono text-sm">10,208,186.54</span>
                  </div>

                  <div className="pl-2 space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 py-1 border-b border-slate-100">
                        <span>Equity</span>
                        <span className="font-mono text-[#c2410c]">-5,842,213.87</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-500 flex justify-between">
                        <span>Share capital</span>
                        <span className="font-mono">0.00</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-500 flex justify-between">
                        <span>Reserves & Retained earnings</span>
                        <span className="font-mono">0.00</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-800 flex justify-between font-medium">
                        <span>Current Year Earnings</span>
                        <span className="font-mono text-[#c2410c]">-5,842,213.87</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 py-1 border-b border-slate-100">
                        <span>Liabilities</span>
                        <span className="font-mono text-slate-900 font-bold">16,050,400.41</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-500 flex justify-between">
                        <span>Non current Liabilities</span>
                        <span className="font-mono">0.00</span>
                      </div>
                      <div className="pl-4 py-1 text-slate-700 flex justify-between font-medium">
                        <span>Current Liabilities</span>
                        <span className="font-mono">16,050,400.41</span>
                      </div>
                      <div className="pl-6 py-1 text-slate-600 flex justify-between">
                        <span>Trade payables</span>
                        <span className="font-mono">0.00</span>
                      </div>
                      <div className="pl-6 py-1 text-slate-800 flex justify-between font-medium">
                        <span>Other liabilities (TRA Tax Received)</span>
                        <span className="font-mono text-[#c2410c]">16,050,400.41</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            E. PROFIT AND LOSS (Exact figures from prompt)
           ------------------------------------------------------------- */}
        {currentView === 'pnl' && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Profit and Loss Statement</h3>
                <p className="text-xs text-slate-500">Period: FY2026 (Accrual Basis)</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#c2410c] bg-rose-50 border border-rose-200 px-3 py-1 rounded">
                Net Profit/Loss: -7,483,085.87 TSh
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex justify-between items-center font-bold text-slate-900 bg-slate-50/50 px-3 rounded">
                <span>Revenue</span>
                <span className="font-mono text-emerald-700">92,616,919.13</span>
              </div>
              <div className="py-2 pl-6 pr-3 flex justify-between text-slate-600">
                <span>Other income</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-2 pl-6 pr-3 flex justify-between text-slate-600">
                <span>Change in inventories</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-2 pl-6 pr-3 flex justify-between text-slate-600">
                <span>Costs of material</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-2 pl-6 pr-3 flex justify-between text-slate-600">
                <span>Employee benefits expense</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-3 flex justify-between items-center font-bold text-slate-900 bg-slate-50/50 px-3 rounded">
                <span>Other expenses (Reconciliation Adjustments)</span>
                <span className="font-mono text-rose-600">100,100,005.00</span>
              </div>
              <div className="py-3 flex justify-between items-center font-bold text-slate-900 px-3">
                <span>Operating profit</span>
                <span className="font-mono text-[#c2410c]">-7,483,085.87</span>
              </div>
              <div className="py-2 pl-6 pr-3 flex justify-between text-slate-600">
                <span>Finance costs & taxes</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-3.5 flex justify-between items-center font-black text-sm text-slate-900 bg-slate-100 px-3 rounded-lg border-t-2 border-slate-300">
                <span>Profit / Loss for the year</span>
                <span className="font-mono text-[#c2410c]">-7,483,085.87 TSh</span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            F. CASH FLOW STATEMENT
           ------------------------------------------------------------- */}
        {currentView === 'cash_flow' && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cash Flow Statement</h3>
                <p className="text-xs text-slate-500">Period: Oct 2026</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
                Closing Cash: 5,229,182.12 TSh
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs font-sans">
              <div className="py-2.5 flex justify-between font-semibold text-slate-700">
                <span>Cash and cash equivalents, beginning of period</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-2.5 flex justify-between font-semibold text-slate-700">
                <span>Cash flows from operating activities</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-1.5 pl-6 flex justify-between text-slate-500">
                <span>Advance Payments received from customers</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-1.5 pl-6 flex justify-between text-slate-500">
                <span>Cash paid for operating activities</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-2.5 flex justify-between font-semibold text-slate-700">
                <span>Cash flows from investing & extraordinary activities</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-2.5 flex justify-between font-semibold text-slate-700">
                <span>Cash flows from financing activities</span>
                <span className="font-mono">0.00</span>
              </div>
              <div className="py-2.5 flex justify-between font-semibold text-slate-700">
                <span>Cash flows from unclassified / bank settlement activities</span>
                <span className="font-mono text-emerald-700">5,229,182.12</span>
              </div>
              <div className="py-3 flex justify-between items-center font-bold text-sm text-slate-900 bg-slate-100 px-3 rounded-lg border-t-2 border-slate-300">
                <span>Cash and cash equivalents, closing balance</span>
                <span className="font-mono text-emerald-700">5,229,182.12 TSh</span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            G. AGED RECEIVABLE (Ashura Juma, Dr. Lungo, Zalongwa)
           ------------------------------------------------------------- */}
        {currentView === 'aged_receivable' && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Aged Receivable Report</h3>
                <p className="text-xs text-slate-500">Outstanding client customer balances grouped by aging buckets</p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded">
                Total Overdue: 4,979,004.42 TSh
              </span>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-4 font-semibold">Partner</th>
                  <th className="py-2 px-4 font-semibold text-right">At Date</th>
                  <th className="py-2 px-4 font-semibold text-right">1 - 30 Days</th>
                  <th className="py-2 px-4 font-semibold text-right">31 - 60 Days</th>
                  <th className="py-2 px-4 font-semibold text-right">61 - 90 Days</th>
                  <th className="py-2 px-4 font-semibold text-right">Older &gt; 120</th>
                  <th className="py-2 px-4 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ODOO_AGED_RECEIVABLES.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">{r.partner}</td>
                    <td className="py-2.5 px-4 text-right text-slate-600">{fmt(r.atDate)}</td>
                    <td className="py-2.5 px-4 text-right text-slate-600">{fmt(r.days1To30)}</td>
                    <td className="py-2.5 px-4 text-right text-slate-600">{fmt(r.days31To60)}</td>
                    <td className="py-2.5 px-4 text-right text-slate-600">{fmt(r.days61To90)}</td>
                    <td className="py-2.5 px-4 text-right text-rose-600 font-semibold">{fmt(r.older)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">{fmt(r.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 font-mono">
                <tr>
                  <td className="py-3 px-4 font-sans">Total Receivables</td>
                  <td className="py-3 px-4 text-right">610,531.00</td>
                  <td className="py-3 px-4 text-right">-720,426.58</td>
                  <td className="py-3 px-4 text-right">0.00</td>
                  <td className="py-3 px-4 text-right">3,328,900.00</td>
                  <td className="py-3 px-4 text-right text-rose-700">1,760,000.00</td>
                  <td className="py-3 px-4 text-right text-rose-700 font-bold">4,979,004.42 TSh</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            H. AGED PAYABLE
           ------------------------------------------------------------- */}
        {currentView === 'aged_payable' && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Aged Payable Summary</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All supplier obligations are current or settled. Total Outstanding Aged Payables: <span className="font-mono font-bold text-emerald-700">0.00 TSh</span>.
            </p>
          </div>
        )}

        {/* -------------------------------------------------------------
            I. CUSTOMERS -> INVOICES LIST (With view invoice modal)
           ------------------------------------------------------------- */}
        {currentView === 'invoices' && (
          <div className="max-w-6xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customer Invoices</h3>
                <p className="text-xs text-slate-500">Browse, filter and audit registered customer tax invoices</p>
              </div>
              <button
                onClick={() => setIsNewMoveModalOpen(true)}
                className="px-3 py-1.5 bg-[#e07a2a] text-white rounded font-bold text-xs hover:bg-[#cf6f23] transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Invoice</span>
              </button>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Number</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Invoice Date</th>
                  <th className="py-2.5 px-4 font-semibold">Due Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Untaxed</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Tax (18%)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Payment</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ODOO_CUSTOMER_INVOICES
                  .filter(inv => !searchQuery || inv.partner.toLowerCase().includes(searchQuery.toLowerCase()) || inv.number.includes(searchQuery))
                  .map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 font-mono">{inv.number}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{inv.partner}</td>
                      <td className="py-2.5 px-4 text-slate-500">{inv.invoiceDate}</td>
                      <td className="py-2.5 px-4 text-slate-500">{inv.dueDate}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600">{fmt(inv.untaxedAmount)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600">{fmt(inv.taxAmount)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{fmt(inv.total)}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-2xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {inv.state}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                          inv.paymentState === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {inv.paymentState}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => setInspectingInvoice(inv)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition cursor-pointer font-medium text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            J. CUSTOMERS -> CREDIT NOTES
           ------------------------------------------------------------- */}
        {currentView === 'credit_notes' && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Customer Credit Notes / Reversals</h3>
              <p className="text-xs text-slate-500">Issued credit notes offsetting customer accounts</p>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-4 font-semibold">Credit Note #</th>
                  <th className="py-2 px-4 font-semibold">Customer</th>
                  <th className="py-2 px-4 font-semibold">Date</th>
                  <th className="py-2 px-4 font-semibold">Reason</th>
                  <th className="py-2 px-4 font-semibold text-right">Untaxed</th>
                  <th className="py-2 px-4 font-semibold text-right">Total</th>
                  <th className="py-2 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ODOO_CREDIT_NOTES.map(cn => (
                  <tr key={cn.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{cn.number}</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-800">{cn.partner}</td>
                    <td className="py-2.5 px-4 text-slate-500">{cn.invoiceDate}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">{cn.reference}</td>
                    <td className="py-2.5 px-4 text-right">{fmt(cn.untaxedAmount)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-[#c2410c]">{fmt(cn.total)} TSh</td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cn.paymentState}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            K. PAYMENTS (Customers & Vendors)
           ------------------------------------------------------------- */}
        {(currentView === 'cust_payments' || currentView === 'vendor_payments') && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentView === 'cust_payments' ? 'Customer Receipts / Inward Payments' : 'Vendor Disbursements / Outward Payments'}
                </h3>
                <p className="text-xs text-slate-500">Track reconciled payments and bank settlements</p>
              </div>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-4 font-semibold">Payment Reference</th>
                  <th className="py-2 px-4 font-semibold">Date</th>
                  <th className="py-2 px-4 font-semibold">Partner</th>
                  <th className="py-2 px-4 font-semibold">Journal</th>
                  <th className="py-2 px-4 font-semibold">Method</th>
                  <th className="py-2 px-4 font-semibold text-right">Amount</th>
                  <th className="py-2 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ODOO_PAYMENTS_LIST.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold font-mono text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-4 text-slate-500">{p.paymentDate}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{p.partner}</td>
                    <td className="py-2.5 px-4 text-slate-600">{p.journal}</td>
                    <td className="py-2.5 px-4 text-slate-500">{p.paymentMethod}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{fmt(p.amount)} TSh</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            L. PRODUCTS (Customers / Vendors Catalog)
           ------------------------------------------------------------- */}
        {(currentView === 'products' || currentView === 'vendor_products') && (
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Products Catalog</h3>
                <p className="text-xs text-slate-500">Sales and inventory bill of items with sales price, cost and on-hand levels</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ODOO_PRODUCTS.map(prod => (
                <div key={prod.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 hover:border-slate-300 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xs font-mono text-slate-400 font-semibold">{prod.defaultCode}</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{prod.name}</h4>
                    </div>
                    <span className="text-2xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {prod.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-2xs text-slate-400 block">Sales Price</span>
                      <span className="font-mono font-bold text-slate-900">{fmt(prod.salesPrice)} TSh</span>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-400 block">Standard Cost</span>
                      <span className="font-mono text-slate-600">{fmt(prod.cost)} TSh</span>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-400 block">Gross Margin</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {Math.round(((prod.salesPrice - prod.cost) / prod.salesPrice) * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-400 block">On Hand</span>
                      <span className="font-mono font-semibold text-slate-800">{prod.qtyOnHand} {prod.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            M. CUSTOMERS DIRECTORY
           ------------------------------------------------------------- */}
        {currentView === 'customers' && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Customers Directory</h3>
              <p className="text-xs text-slate-500">Corporate clients, private dining guests & accounts</p>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Customer Name</th>
                  <th className="py-2.5 px-4 font-semibold">Phone</th>
                  <th className="py-2.5 px-4 font-semibold">Email</th>
                  <th className="py-2.5 px-4 font-semibold">City</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total Invoiced</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ODOO_CUSTOMERS_LIST.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono">{c.phone}</td>
                    <td className="py-2.5 px-4 text-slate-500">{c.email}</td>
                    <td className="py-2.5 px-4 text-slate-600">{c.city}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-800">{fmt(c.totalInvoiced)}</td>
                    <td className={`py-2.5 px-4 text-right font-mono font-bold ${
                      c.outstandingBalance > 0 ? 'text-[#c2410c]' : 'text-emerald-700'
                    }`}>
                      {fmt(c.outstandingBalance)} TSh
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            N. VENDORS -> BILLS (With Pay Bill Modal)
           ------------------------------------------------------------- */}
        {currentView === 'vendor_bills' && (
          <div className="max-w-6xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Vendor Bills</h3>
                <p className="text-xs text-slate-500">Procurement invoices, butcher cuts and dairy supplies</p>
              </div>
              <button
                onClick={() => setIsNewBillModalOpen(true)}
                className="px-3 py-1.5 bg-[#e07a2a] text-white rounded font-bold text-xs hover:bg-[#cf6f23] transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Bill</span>
              </button>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Bill #</th>
                  <th className="py-2.5 px-4 font-semibold">Vendor</th>
                  <th className="py-2.5 px-4 font-semibold">Bill Date</th>
                  <th className="py-2.5 px-4 font-semibold">Due Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
                  <th className="py-2.5 px-4 font-semibold text-right">VAT 18%</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Payment</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold font-mono text-slate-900">{bill.billNumber}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{bill.vendorName}</td>
                    <td className="py-2.5 px-4 text-slate-500">{bill.billDate}</td>
                    <td className="py-2.5 px-4 text-slate-500">{bill.dueDate}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">{fmt(bill.subtotal)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">{fmt(bill.taxAmount)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{fmt(bill.totalAmount)}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-2xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                        bill.paymentState === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {bill.paymentState}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {bill.paymentState !== 'paid' && (
                        <button
                          onClick={() => setPayingBill(bill)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition text-xs cursor-pointer"
                        >
                          Register Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            O. ACCOUNTING -> JOURNAL ENTRIES
           ------------------------------------------------------------- */}
        {currentView === 'journal_entries' && (
          <div className="max-w-6xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Journal Entries</h3>
                <p className="text-xs text-slate-500">General, Sales, Purchase and Bank double-entry moves</p>
              </div>
              <button
                onClick={() => setIsNewMoveModalOpen(true)}
                className="px-3 py-1.5 bg-[#e07a2a] text-white rounded font-bold text-xs hover:bg-[#cf6f23] transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Entry</span>
              </button>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-4 font-semibold">Number</th>
                  <th className="py-2 px-4 font-semibold">Date</th>
                  <th className="py-2 px-4 font-semibold">Journal</th>
                  <th className="py-2 px-4 font-semibold">Partner</th>
                  <th className="py-2 px-4 font-semibold">Reference</th>
                  <th className="py-2 px-4 font-semibold text-right">Total Debit</th>
                  <th className="py-2 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalMoves
                  .filter(m => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.partnerName?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold font-mono text-slate-900">{m.name}</td>
                      <td className="py-2.5 px-4 text-slate-500">{m.date}</td>
                      <td className="py-2.5 px-4 font-semibold uppercase text-slate-700">{m.journalType}</td>
                      <td className="py-2.5 px-4 text-slate-800">{m.partnerName || '-'}</td>
                      <td className="py-2.5 px-4 text-slate-500">{m.ref || '-'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{fmt(m.amountTotal)} TSh</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                          m.state === 'posted'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {m.state}
                        </span>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            P. CONFIGURATION -> CHART OF ACCOUNTS
           ------------------------------------------------------------- */}
        {currentView === 'coa' && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Chart of Accounts (General Ledger Accounts)</h3>
                <p className="text-xs text-slate-500">Odoo 19 double-entry ledger accounts</p>
              </div>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-4 font-semibold">Code</th>
                  <th className="py-2 px-4 font-semibold">Account Name</th>
                  <th className="py-2 px-4 font-semibold">Type</th>
                  <th className="py-2 px-4 font-semibold text-right">Debit</th>
                  <th className="py-2 px-4 font-semibold text-right">Credit</th>
                  <th className="py-2 px-4 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ODOO_TRIAL_BALANCE_ACCOUNTS.map(a => (
                  <tr key={a.code} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{a.code}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-800">{a.name}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">{a.type}</td>
                    <td className="py-2.5 px-4 text-right text-slate-700">{fmt(a.debit)}</td>
                    <td className="py-2.5 px-4 text-right text-slate-700">{fmt(a.credit)}</td>
                    <td className={`py-2.5 px-4 text-right font-bold ${a.endBalance < 0 ? 'text-[#c2410c]' : 'text-slate-900'}`}>
                      {fmt(a.endBalance)} TSh
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            Q. REPORTING -> TAX RETURN (TZ VAT Return)
           ------------------------------------------------------------- */}
        {currentView === 'tax_return' && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tanzania Revenue Authority (TRA) VAT Return</h3>
                <p className="text-xs text-slate-500">Tax Period: October 2026 • Standard Output VAT Rate: 18%</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#c2410c] bg-amber-50 border border-amber-200 px-3 py-1 rounded">
                Net VAT Payable: 16,050,400.41 TSh
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex justify-between items-center font-bold text-slate-900 bg-slate-50 px-3 rounded">
                <span>Output VAT (Sales & Dining Supplies)</span>
                <span className="font-mono text-slate-900">Rate 18%</span>
              </div>
              <div className="py-2 pl-6 pr-3 flex justify-between text-slate-700">
                <span>Taxable supplies in Tanzania (Standard Rated 18%)</span>
                <span className="font-mono font-semibold">92,616,919.13 TSh</span>
              </div>
              <div className="py-2 pl-6 pr-3 flex justify-between text-slate-700 font-bold">
                <span>Total Output Tax Charged</span>
                <span className="font-mono text-[#c2410c]">16,050,400.41 TSh</span>
              </div>
              <div className="py-3 flex justify-between items-center font-bold text-slate-900 bg-slate-50 px-3 rounded mt-4">
                <span>Input VAT (Allowable Purchases & Raw Material)</span>
                <span className="font-mono text-slate-900">Rate 18%</span>
              </div>
              <div className="py-2 pl-6 pr-3 flex justify-between text-slate-700">
                <span>Standard rated purchases of goods & services</span>
                <span className="font-mono">0.00 TSh</span>
              </div>
              <div className="py-2 pl-6 pr-3 flex justify-between text-slate-700 font-bold">
                <span>Total Deductible Input Tax</span>
                <span className="font-mono text-emerald-700">0.00 TSh</span>
              </div>
              <div className="py-3.5 flex justify-between items-center font-black text-sm text-slate-900 bg-slate-100 px-3 rounded-lg border-t-2 border-slate-300 mt-4">
                <span>Net VAT Payable to TRA (TIN 108-992-311)</span>
                <span className="font-mono text-[#c2410c]">16,050,400.41 TSh</span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            R. REPORTING -> CUSTOMER INVOICES ANALYSIS (Chart / BI)
           ------------------------------------------------------------- */}
        {currentView === 'invoices_analysis' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Customer Invoices Analysis</h3>
                  <p className="text-xs text-slate-500">Monthly billing volume, tax collections and settled balances</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded">Count: 5 Invoices</span>
                </div>
              </div>

              {/* Monthly billing bar visualization */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Invoiced Turnover by Month (TSh)</h4>
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>June 2026 (Dr. Lungo Annual Pass)</span>
                      <span>1,760,000.00 TSh</span>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded overflow-hidden">
                      <div className="bg-[#e07a2a] h-full rounded" style={{ width: '4%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>August 2026 (Zalongwa Technologies Cloud Services)</span>
                      <span>14,636,026.58 TSh</span>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded overflow-hidden">
                      <div className="bg-[#e07a2a] h-full rounded" style={{ width: '16%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>October 2026 (Corporate Events, Safari Camp & Oysterbay Dining)</span>
                      <span className="font-bold text-slate-900">76,220,892.55 TSh</span>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded" style={{ width: '82%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            S. CONFIGURATION VIEWS (Taxes, Journals, Currencies, Terms)
           ------------------------------------------------------------- */}
        {currentView === 'taxes' && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Tax Configurations</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-semibold">Tax Name</th>
                  <th className="py-2 px-3 font-semibold">Tax Scope</th>
                  <th className="py-2 px-3 font-semibold">Computation</th>
                  <th className="py-2 px-3 font-semibold text-right">Amount</th>
                  <th className="py-2 px-3 font-semibold">Tax Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900">TRA VAT 18%</td>
                  <td className="py-2 px-3 text-slate-600">Sales & Services</td>
                  <td className="py-2 px-3 text-slate-600">Percentage of Price</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">18.00%</td>
                  <td className="py-2 px-3 font-mono text-slate-600">3070 Tax received</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900">Tourism Levy 1.5%</td>
                  <td className="py-2 px-3 text-slate-600">Hotel & Dining</td>
                  <td className="py-2 px-3 text-slate-600">Percentage of Price</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">1.50%</td>
                  <td className="py-2 px-3 font-mono text-slate-600">3080 Tourism Levy</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900">Withholding Tax 5%</td>
                  <td className="py-2 px-3 text-slate-600">Professional Services</td>
                  <td className="py-2 px-3 text-slate-600">Percentage of Price</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">5.00%</td>
                  <td className="py-2 px-3 font-mono text-slate-600">3090 WHT Payable</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {currentView === 'journals' && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Journals Registry</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-semibold">Journal Name</th>
                  <th className="py-2 px-3 font-semibold">Type</th>
                  <th className="py-2 px-3 font-semibold">Short Code</th>
                  <th className="py-2 px-3 font-semibold">Default Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans font-bold text-slate-900">Customer Invoices</td>
                  <td className="py-2 px-3 font-sans text-slate-600">Sales</td>
                  <td className="py-2 px-3 font-bold text-slate-700">INV</td>
                  <td className="py-2 px-3 text-slate-600">4000 Revenue</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans font-bold text-slate-900">Vendor Bills</td>
                  <td className="py-2 px-3 font-sans text-slate-600">Purchase</td>
                  <td className="py-2 px-3 font-bold text-slate-700">BILL</td>
                  <td className="py-2 px-3 text-slate-600">2010 Payables</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans font-bold text-slate-900">CRDB Bank</td>
                  <td className="py-2 px-3 font-sans text-slate-600">Bank</td>
                  <td className="py-2 px-3 font-bold text-slate-700">BNK1</td>
                  <td className="py-2 px-3 text-slate-600">1031 Bank</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans font-bold text-slate-900">Cash Ngome Till</td>
                  <td className="py-2 px-3 font-sans text-slate-600">Cash</td>
                  <td className="py-2 px-3 font-bold text-slate-700">CSH1</td>
                  <td className="py-2 px-3 text-slate-600">1011 Cash Ngome</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans font-bold text-slate-900">Point of Sale Orders</td>
                  <td className="py-2 px-3 font-sans text-slate-600">POS</td>
                  <td className="py-2 px-3 font-bold text-slate-700">POS</td>
                  <td className="py-2 px-3 text-slate-600">1550 Trade receivables (PoS)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {currentView === 'currencies' && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Multi-Currency Rates</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-semibold">Currency</th>
                  <th className="py-2 px-3 font-semibold">Symbol</th>
                  <th className="py-2 px-3 font-semibold">Exchange Rate to Base (TSh)</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans font-bold text-slate-900">Tanzanian Shilling</td>
                  <td className="py-2 px-3 font-bold text-slate-700">TSh</td>
                  <td className="py-2 px-3 text-slate-600">1.0000 (Base Currency)</td>
                  <td className="py-2 px-3 font-sans text-emerald-600 font-bold">Active</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans font-bold text-slate-900">US Dollar</td>
                  <td className="py-2 px-3 font-bold text-slate-700">$</td>
                  <td className="py-2 px-3 text-slate-600">2,680.00 TSh</td>
                  <td className="py-2 px-3 font-sans text-emerald-600 font-bold">Active</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans font-bold text-slate-900">Euro</td>
                  <td className="py-2 px-3 font-bold text-slate-700">€</td>
                  <td className="py-2 px-3 text-slate-600">2,910.00 TSh</td>
                  <td className="py-2 px-3 font-sans text-emerald-600 font-bold">Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            T. DASHBOARD (Odoo Accounting Overview)
           ------------------------------------------------------------- */}
        {currentView === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Customer Invoices Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm">Customer Invoices</h4>
                  <button onClick={() => setCurrentView('invoices')} className="text-slate-400 hover:text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">Unpaid Customer Invoices</span>
                  <p className="text-lg font-black font-mono text-slate-900">4,979,004.42 TSh</p>
                </div>
                <div className="flex justify-between text-xs pt-2">
                  <span className="text-slate-500">3 Invoices to Validate</span>
                  <button onClick={() => setCurrentView('invoices')} className="text-[#e07a2a] font-bold hover:underline">
                    View Invoices
                  </button>
                </div>
              </div>

              {/* Vendor Bills Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm">Vendor Bills</h4>
                  <button onClick={() => setCurrentView('vendor_bills')} className="text-slate-400 hover:text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">Bills to Pay</span>
                  <p className="text-lg font-black font-mono text-slate-900">0.00 TSh</p>
                </div>
                <div className="flex justify-between text-xs pt-2">
                  <span className="text-slate-500">All current bills reconciled</span>
                  <button onClick={() => setCurrentView('vendor_bills')} className="text-[#e07a2a] font-bold hover:underline">
                    Upload Bill
                  </button>
                </div>
              </div>

              {/* Bank & Cash Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm">Bank (1031)</h4>
                  <button onClick={() => setCurrentView('general_ledger')} className="text-slate-400 hover:text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">Balance in General Ledger</span>
                  <p className="text-lg font-black font-mono text-emerald-700">5,229,182.12 TSh</p>
                </div>
                <div className="flex justify-between text-xs pt-2">
                  <span className="text-slate-500">Last Synced Today</span>
                  <button onClick={() => setCurrentView('general_ledger')} className="text-[#e07a2a] font-bold hover:underline">
                    Reconcile
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Financial Statement Summaries */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Key Financial Highlights</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-500 block">Total Revenue</span>
                  <span className="text-sm font-mono font-bold text-slate-900">92,616,919.13 TSh</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-500 block">Active Assets</span>
                  <span className="text-sm font-mono font-bold text-slate-900">10,208,186.54 TSh</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-500 block">Total Liabilities</span>
                  <span className="text-sm font-mono font-bold text-slate-900">16,050,400.41 TSh</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-500 block">Trial Balance Total</span>
                  <span className="text-sm font-mono font-bold text-amber-700">405,529,199.12 TSh</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* 1. Printable / Inspect Invoice Modal */}
      {inspectingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#e07a2a] text-white flex items-center justify-center font-bold text-xs">
                  INV
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{inspectingInvoice.number}</h3>
                  <p className="text-xs text-slate-500">Official Electronic Tax Invoice • TRA Certified</p>
                </div>
              </div>
              <button 
                onClick={() => setInspectingInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-2xs text-slate-400 block uppercase font-bold">Seller</span>
                  <p className="font-bold text-slate-900">NGOME HOLDING GROUP LIMITED</p>
                  <p className="text-slate-500">RestoERP Oysterbay Flagship</p>
                  <p className="text-slate-500">TIN: 108-992-311 | VRN: 40019283-Z</p>
                </div>
                <div>
                  <span className="text-2xs text-slate-400 block uppercase font-bold">Customer</span>
                  <p className="font-bold text-slate-900">{inspectingInvoice.partner}</p>
                  <p className="text-slate-500">Invoice Date: {inspectingInvoice.invoiceDate}</p>
                  <p className="text-slate-500">Due Date: {inspectingInvoice.dueDate}</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 text-xs">
                    <tr>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Tax</th>
                      <th className="py-2 px-3 text-right">Amount (TSh)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="py-2.5 px-3 font-sans">Corporate Hospitality & Dining Provisioning</td>
                      <td className="py-2.5 px-3 text-right font-sans text-slate-500">18% VAT</td>
                      <td className="py-2.5 px-3 text-right">{fmt(inspectingInvoice.untaxedAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-1 text-right pt-2 border-t border-slate-100 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Untaxed Amount:</span>
                  <span>{fmt(inspectingInvoice.untaxedAmount)} TSh</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">TRA VAT (18%):</span>
                  <span>{fmt(inspectingInvoice.taxAmount)} TSh</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span className="font-sans">Total Due:</span>
                  <span>{fmt(inspectingInvoice.total)} TSh</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setInspectingInvoice(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. New Journal Move Modal */}
      {isNewMoveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">New Journal Entry</h3>
              <button onClick={() => setIsNewMoveModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Accounting Date</label>
                <input
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Journal</label>
                <select
                  value={moveJournal}
                  onChange={(e) => setMoveJournal(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="general">Miscellaneous Operations</option>
                  <option value="bank">Bank (1031)</option>
                  <option value="cash">Cash Ngome (1011)</option>
                  <option value="sales">Customer Invoices</option>
                  <option value="purchase">Vendor Bills</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Partner</label>
                <input
                  type="text"
                  placeholder="e.g. Zalongwa Technologies"
                  value={movePartner}
                  onChange={(e) => setMovePartner(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {/* Move lines */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Journal Items (Debits & Credits)</span>
                <button
                  type="button"
                  onClick={handleAddLineToMove}
                  className="text-xs text-[#e07a2a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {moveLines.map((line, idx) => (
                  <div key={idx} className="p-2.5 flex items-center gap-2 bg-slate-50/50">
                    <select
                      value={line.accountId}
                      onChange={(e) => handleUpdateMoveLine(idx, 'accountId', e.target.value)}
                      className="w-1/3 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium"
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Label / Item"
                      value={line.name}
                      onChange={(e) => handleUpdateMoveLine(idx, 'name', e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Debit"
                      value={line.debit || ''}
                      onChange={(e) => handleUpdateMoveLine(idx, 'debit', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded text-right font-mono text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Credit"
                      value={line.credit || ''}
                      onChange={(e) => handleUpdateMoveLine(idx, 'credit', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded text-right font-mono text-xs"
                    />
                    {moveLines.length > 2 && (
                      <button onClick={() => handleRemoveMoveLine(idx)} className="text-slate-400 hover:text-rose-500 p-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Balance Verification */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl text-xs font-mono font-bold">
                <span className="font-sans text-slate-700">Total Move Verification:</span>
                <div className="flex items-center gap-4">
                  <span>Debits: {fmt(moveDebitSum)}</span>
                  <span>Credits: {fmt(moveCreditSum)}</span>
                  <span className={moveIsBalanced ? 'text-emerald-700' : 'text-rose-600'}>
                    {moveIsBalanced ? '✓ Balanced' : 'Unbalanced'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setIsNewMoveModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveMove('posted')}
                disabled={!moveIsBalanced}
                className="px-5 py-2 bg-[#e07a2a] hover:bg-[#cf6f23] disabled:opacity-40 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
              >
                Post Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. New Vendor Bill Modal */}
      {isNewBillModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">New Vendor Bill</h3>
              <button onClick={() => setIsNewBillModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Vendor / Supplier</label>
                <input
                  type="text"
                  value={billVendorName}
                  onChange={(e) => setBillVendorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Bill Reference</label>
                <input
                  type="text"
                  placeholder="e.g. INV-9902"
                  value={billRef}
                  onChange={(e) => setBillRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Bill Date</label>
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Due Date</label>
                <input
                  type="date"
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setIsNewBillModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBill}
                className="px-5 py-2 bg-[#e07a2a] hover:bg-[#cf6f23] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
              >
                Save & Post Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Pay Bill Modal */}
      {payingBill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Register Vendor Payment</h3>
              <button onClick={() => setPayingBill(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-2xs text-slate-400 block uppercase">Vendor & Reference</span>
                <p className="font-bold text-slate-900 text-sm">{payingBill.vendorName}</p>
                <p className="text-slate-500 font-mono">{payingBill.billNumber}</p>
                <p className="text-base font-black font-mono text-emerald-700 mt-2">
                  {fmt(payingBill.totalAmount)} TSh
                </p>
              </div>

              <div>
                <label className="text-slate-500 font-semibold block mb-1">Disbursement Journal / Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                >
                  <option value="CRDB Bank">CRDB Bank (1031)</option>
                  <option value="M-Pesa / Mobile Money">M-Pesa Corporate (Till)</option>
                  <option value="Cash">Cash Ngome (1011)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setPayingBill(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  payVendorBill(payingBill.id, paymentMethod);
                  setPayingBill(null);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
