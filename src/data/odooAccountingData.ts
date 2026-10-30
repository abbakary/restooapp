import { 
  Account, 
  JournalMove, 
  BankStatementItem, 
  VendorBill 
} from '../types/erp';

export const INITIAL_ACCOUNTS: Account[] = [
  // Current Assets - Cash & Bank
  { id: 'acc-1010', code: '1010', name: 'Cash on Hand (POS Drawer Till)', type: 'asset_cash_bank', reconcile: true },
  { id: 'acc-1020', code: '1020', name: 'M-Pesa Merchant Settlement Account', type: 'asset_cash_bank', reconcile: true },
  { id: 'acc-1030', code: '1030', name: 'CRDB Bank Main Operating Account', type: 'asset_cash_bank', reconcile: true },
  { id: 'acc-1050', code: '1050', name: 'Accounts Receivable (House Accounts)', type: 'asset_receivable', reconcile: true },
  
  // Current Assets - Inventory
  { id: 'acc-1210', code: '1210', name: 'Food & Beverage Inventory Asset', type: 'asset_current' },
  { id: 'acc-1220', code: '1220', name: 'Central Kitchen Batch In-Transit', type: 'asset_current' },

  // Non-Current Assets - Fixed
  { id: 'acc-1500', code: '1500', name: 'Kitchen Machinery, Grills & Ovens', type: 'asset_non_current' },
  { id: 'acc-1510', code: '1510', name: 'Dining Furniture & Ambience Fixtures', type: 'asset_non_current' },
  { id: 'acc-1520', code: '1520', name: 'POS Hardware & KDS Tablets', type: 'asset_non_current' },
  { id: 'acc-1590', code: '1590', name: 'Accumulated Depreciation - Plant & Equip', type: 'asset_non_current' },

  // Current Liabilities - Payables & Taxes
  { id: 'acc-2010', code: '2010', name: 'Accounts Payable (Trade Food Suppliers)', type: 'liability_payable', reconcile: true },
  { id: 'acc-2020', code: '2020', name: 'VAT Output Tax Payable (18% TRA)', type: 'liability_current' },
  { id: 'acc-2021', code: '2021', name: 'VAT Input Tax Deductible (18%)', type: 'liability_current' },
  { id: 'acc-2030', code: '2030', name: 'Service Charge Payable to Staff Pool (5%)', type: 'liability_current' },
  { id: 'acc-2040', code: '2040', name: 'Accrued Kitchen & Floor Staff Payroll', type: 'liability_current' },

  // Equity
  { id: 'acc-3010', code: '3010', name: 'Owner Paid-In Capital', type: 'equity' },
  { id: 'acc-3020', code: '3020', name: 'Retained Earnings (Previous Years)', type: 'equity' },

  // Operating Revenue
  { id: 'acc-4010', code: '4010', name: 'Food Dining Sales Revenue', type: 'income_operating' },
  { id: 'acc-4020', code: '4020', name: 'Beverage, Wine & Bar Revenue', type: 'income_operating' },
  { id: 'acc-4030', code: '4030', name: 'Catering & Event Booking Income', type: 'income_operating' },
  { id: 'acc-4040', code: '4040', name: 'Delivery Surcharge & Packaging Fee', type: 'income_operating' },

  // Cost of Goods Sold (COGS)
  { id: 'acc-5010', code: '5010', name: 'COGS - Prime Beef, Seafood & Poultry', type: 'cogs' },
  { id: 'acc-5020', code: '5020', name: 'COGS - Fresh Produce, Dairy & Bakery', type: 'cogs' },
  { id: 'acc-5030', code: '5030', name: 'COGS - Bar Spirits, Mixers & Beverages', type: 'cogs' },
  { id: 'acc-5040', code: '5040', name: 'Inventory Spoilage & Prep Wastage', type: 'cogs' },

  // Operating Expenses (OPEX)
  { id: 'acc-6010', code: '6010', name: 'Head Chef & Kitchen Staff Wages', type: 'expense_operating' },
  { id: 'acc-6020', code: '6020', name: 'Floor Waiter & Cashier Payroll', type: 'expense_operating' },
  { id: 'acc-6030', code: '6030', name: 'Restaurant Utilities (Gas, Water & Power)', type: 'expense_operating' },
  { id: 'acc-6040', code: '6040', name: 'Branch Property Lease & Rent', type: 'expense_operating' },
  { id: 'acc-6050', code: '6050', name: 'M-Pesa Merchant & Card Interchange Fees', type: 'expense_operating' },
  { id: 'acc-6060', code: '6060', name: 'Kitchen Sanitation, Chemicals & Laundry', type: 'expense_operating' },
  { id: 'acc-6070', code: '6070', name: 'Equipment Maintenance & Chiller Servicing', type: 'expense_operating' }
];

export const INITIAL_JOURNAL_MOVES: JournalMove[] = [
  // 1. POS Dining Sales Move
  {
    id: 'mov-101',
    name: 'POS/2026/101',
    date: '2026-10-23',
    journalType: 'customer_invoices',
    ref: 'Midday Lunch Shift Settlement - Safari Grill',
    partnerName: 'Walk-In & Reserved Guests',
    state: 'posted',
    siteId: 'site-1',
    amountTotal: 3840000,
    lines: [
      {
        id: 'ln-101-1',
        accountId: 'acc-1020',
        accountCode: '1020',
        accountName: 'M-Pesa Merchant Settlement Account',
        name: 'M-Pesa customer payments batch',
        debit: 2540000,
        credit: 0
      },
      {
        id: 'ln-101-2',
        accountId: 'acc-1010',
        accountCode: '1010',
        accountName: 'Cash on Hand (POS Drawer Till)',
        name: 'Physical cash received in drawer',
        debit: 1300000,
        credit: 0
      },
      {
        id: 'ln-101-3',
        accountId: 'acc-4010',
        accountCode: '4010',
        accountName: 'Food Dining Sales Revenue',
        name: 'Net Food Sales (Lunch Shift)',
        debit: 0,
        credit: 3000000
      },
      {
        id: 'ln-101-4',
        accountId: 'acc-2020',
        accountCode: '2020',
        accountName: 'VAT Output Tax Payable (18% TRA)',
        name: 'TRA EFD Fiscal Output VAT (18%)',
        debit: 0,
        credit: 576000
      },
      {
        id: 'ln-101-5',
        accountId: 'acc-2030',
        accountCode: '2030',
        accountName: 'Service Charge Payable to Staff Pool (5%)',
        name: 'Service charge 5% staff pool',
        debit: 0,
        credit: 264000
      }
    ]
  },

  // 2. Butcher Vendor Bill
  {
    id: 'mov-102',
    name: 'BILL/2026/0088',
    date: '2026-10-22',
    journalType: 'vendor_bills',
    ref: 'PO-2026-088 Prime Beef Delivery',
    partnerName: 'Tanzanian Prime Meats Ltd',
    state: 'posted',
    siteId: 'site-1',
    amountTotal: 1652000,
    lines: [
      {
        id: 'ln-102-1',
        accountId: 'acc-1210',
        accountCode: '1210',
        accountName: 'Food & Beverage Inventory Asset',
        name: '50kg Beef Tenderloin A-Grade',
        debit: 1400000,
        credit: 0
      },
      {
        id: 'ln-102-2',
        accountId: 'acc-2021',
        accountCode: '2021',
        accountName: 'VAT Input Tax Deductible (18%)',
        name: 'Deductible Input VAT on Butcher PO',
        debit: 252000,
        credit: 0
      },
      {
        id: 'ln-102-3',
        accountId: 'acc-2010',
        accountCode: '2010',
        accountName: 'Accounts Payable (Trade Food Suppliers)',
        partner: 'Tanzanian Prime Meats Ltd',
        name: 'Vendor Invoice Trade Liability',
        debit: 0,
        credit: 1652000
      }
    ]
  },

  // 3. Farm Produce Vendor Bill
  {
    id: 'mov-103',
    name: 'BILL/2026/0089',
    date: '2026-10-23',
    journalType: 'vendor_bills',
    ref: 'PO-2026-089 Organic Russet Potatoes',
    partnerName: 'Southern Highlands Organic Cooperative',
    state: 'posted',
    siteId: 'site-1',
    amountTotal: 413000,
    lines: [
      {
        id: 'ln-103-1',
        accountId: 'acc-1210',
        accountCode: '1210',
        accountName: 'Food & Beverage Inventory Asset',
        name: '140kg Iringa Potatoes',
        debit: 350000,
        credit: 0
      },
      {
        id: 'ln-103-2',
        accountId: 'acc-2021',
        accountCode: '2021',
        accountName: 'VAT Input Tax Deductible (18%)',
        name: 'Input VAT on Highland Farm',
        debit: 63000,
        credit: 0
      },
      {
        id: 'ln-103-3',
        accountId: 'acc-2010',
        accountCode: '2010',
        accountName: 'Accounts Payable (Trade Food Suppliers)',
        partner: 'Southern Highlands Organic Cooperative',
        name: 'Farm Cooperative invoice payable',
        debit: 0,
        credit: 413000
      }
    ]
  },

  // 4. Inventory BOM Recipe Depletion (COGS)
  {
    id: 'mov-104',
    name: 'STK/2026/0044',
    date: '2026-10-23',
    journalType: 'inventory_valuation',
    ref: 'Auto Recipe Cost Depletion - Lunch Shift',
    partnerName: 'Kitchen Inventory Engine',
    state: 'posted',
    siteId: 'site-1',
    amountTotal: 1152000,
    lines: [
      {
        id: 'ln-104-1',
        accountId: 'acc-5010',
        accountCode: '5010',
        accountName: 'COGS - Prime Beef, Seafood & Poultry',
        name: 'Recipe meat ingredient depletion',
        debit: 820000,
        credit: 0
      },
      {
        id: 'ln-104-2',
        accountId: 'acc-5020',
        accountCode: '5020',
        accountName: 'COGS - Fresh Produce, Dairy & Bakery',
        name: 'Sides, fries & veg recipe depletion',
        debit: 332000,
        credit: 0
      },
      {
        id: 'ln-104-3',
        accountId: 'acc-1210',
        accountCode: '1210',
        accountName: 'Food & Beverage Inventory Asset',
        name: 'Raw stock asset deduction',
        debit: 0,
        credit: 1152000
      }
    ]
  },

  // 5. Bank Settlement to Meat Supplier
  {
    id: 'mov-105',
    name: 'BNK/2026/0012',
    date: '2026-10-24',
    journalType: 'bank',
    ref: 'CRDB EFT Transfer to Tanzanian Prime Meats',
    partnerName: 'Tanzanian Prime Meats Ltd',
    state: 'posted',
    siteId: 'site-1',
    amountTotal: 1652000,
    lines: [
      {
        id: 'ln-105-1',
        accountId: 'acc-2010',
        accountCode: '2010',
        accountName: 'Accounts Payable (Trade Food Suppliers)',
        partner: 'Tanzanian Prime Meats Ltd',
        name: 'Settle invoice BILL/2026/0088',
        debit: 1652000,
        credit: 0,
        reconciled: true
      },
      {
        id: 'ln-105-2',
        accountId: 'acc-1030',
        accountCode: '1030',
        accountName: 'CRDB Bank Main Operating Account',
        name: 'CRDB EFT Wire Outflow',
        debit: 0,
        credit: 1652000,
        reconciled: true
      }
    ]
  },

  // 6. M-Pesa Merchant Settlement to Bank
  {
    id: 'mov-106',
    name: 'MPS/2026/003',
    date: '2026-10-24',
    journalType: 'mpesa',
    ref: 'Vodacom Till Sweep to CRDB Operating',
    partnerName: 'Vodacom Tanzania M-Pesa',
    state: 'posted',
    siteId: 'site-1',
    amountTotal: 2540000,
    lines: [
      {
        id: 'ln-106-1',
        accountId: 'acc-1030',
        accountCode: '1030',
        accountName: 'CRDB Bank Main Operating Account',
        name: 'Net deposit to CRDB',
        debit: 2509520,
        credit: 0,
        reconciled: true
      },
      {
        id: 'ln-106-2',
        accountId: 'acc-6050',
        accountCode: '6050',
        accountName: 'M-Pesa Merchant & Card Interchange Fees',
        name: 'Vodacom 1.2% merchant fee',
        debit: 30480,
        credit: 0
      },
      {
        id: 'ln-106-3',
        accountId: 'acc-1020',
        accountCode: '1020',
        accountName: 'M-Pesa Merchant Settlement Account',
        name: 'Merchant Till balance sweep',
        debit: 0,
        credit: 2540000,
        reconciled: true
      }
    ]
  },

  // 7. Kitchen Wastage Loss Entry
  {
    id: 'mov-107',
    name: 'WST/2026/001',
    date: '2026-10-23',
    journalType: 'general',
    ref: 'Damaged Potatoes Write-Off',
    partnerName: 'Chef Rashid Makange',
    state: 'posted',
    siteId: 'site-1',
    amountTotal: 8750,
    lines: [
      {
        id: 'ln-107-1',
        accountId: 'acc-5040',
        accountCode: '5040',
        accountName: 'Inventory Spoilage & Prep Wastage',
        name: '3.5kg bruised potato delivery write-off',
        debit: 8750,
        credit: 0
      },
      {
        id: 'ln-107-2',
        accountId: 'acc-1210',
        accountCode: '1210',
        accountName: 'Food & Beverage Inventory Asset',
        name: 'Inventory asset credit',
        debit: 0,
        credit: 8750
      }
    ]
  },

  // 8. Staff Payroll Accrual Entry
  {
    id: 'mov-108',
    name: 'PAY/2026/010',
    date: '2026-10-24',
    journalType: 'general',
    ref: 'Weekly Restaurant Staff Labor Accrual',
    partnerName: 'Resto Staff Roster',
    state: 'posted',
    siteId: 'site-1',
    amountTotal: 1850000,
    lines: [
      {
        id: 'ln-108-1',
        accountId: 'acc-6010',
        accountCode: '6010',
        accountName: 'Head Chef & Kitchen Staff Wages',
        name: 'Kitchen brigade payroll allocation',
        debit: 1100000,
        credit: 0
      },
      {
        id: 'ln-108-2',
        accountId: 'acc-6020',
        accountCode: '6020',
        accountName: 'Floor Waiter & Cashier Payroll',
        name: 'Front-of-house waiter wages',
        debit: 750000,
        credit: 0
      },
      {
        id: 'ln-108-3',
        accountId: 'acc-2040',
        accountCode: '2040',
        accountName: 'Accrued Kitchen & Floor Staff Payroll',
        name: 'Payroll liability payable on 30th',
        debit: 0,
        credit: 1850000
      }
    ]
  }
];

export const INITIAL_BANK_STATEMENTS: BankStatementItem[] = [
  {
    id: 'bs-1',
    date: '2026-10-24',
    paymentRef: 'CRDB EFT-9902 Tanzanian Prime Meats',
    partner: 'Tanzanian Prime Meats Ltd',
    amount: -1652000,
    journalType: 'bank',
    matchedMoveLineId: 'ln-105-2',
    isReconciled: true,
    siteId: 'site-1'
  },
  {
    id: 'bs-2',
    date: '2026-10-24',
    paymentRef: 'VODACOM M-PESA TILL SWEEP TRF #88412',
    partner: 'Vodacom Tanzania',
    amount: 2509520,
    journalType: 'bank',
    matchedMoveLineId: 'ln-106-1',
    isReconciled: true,
    siteId: 'site-1'
  },
  {
    id: 'bs-3',
    date: '2026-10-24',
    paymentRef: 'POS CARD BATCH SETTLE VISA/MC #004',
    partner: 'CRDB Merchant Acquiring',
    amount: 1450000,
    journalType: 'bank',
    isReconciled: false,
    siteId: 'site-1'
  },
  {
    id: 'bs-4',
    date: '2026-10-24',
    paymentRef: 'TANESCO POWER PREPAID TOKEN 4410-9921',
    partner: 'Tanesco Dar',
    amount: -320000,
    journalType: 'bank',
    isReconciled: false,
    siteId: 'site-1'
  },
  {
    id: 'bs-5',
    date: '2026-10-24',
    paymentRef: 'M-PESA GUEST PAYMENT REF QW884210',
    partner: 'M-Pesa Guest Till',
    amount: 184000,
    journalType: 'mpesa',
    isReconciled: false,
    siteId: 'site-1'
  }
];

export const INITIAL_VENDOR_BILLS: VendorBill[] = [
  {
    id: 'bill-1',
    billNumber: 'BILL/2026/0088',
    vendorId: 'sup-1',
    vendorName: 'Tanzanian Prime Meats Ltd',
    billDate: '2026-10-22',
    dueDate: '2026-11-05',
    siteId: 'site-1',
    reference: 'PO-2026-088 Prime Beef Delivery',
    items: [
      {
        description: 'Prime Beef Tenderloin (A-Grade) 50kg',
        accountId: 'acc-1210',
        quantity: 50,
        unitPrice: 28000,
        taxRate: 0.18,
        total: 1400000
      }
    ],
    subtotal: 1400000,
    taxAmount: 252000,
    totalAmount: 1652000,
    status: 'posted',
    paymentState: 'paid'
  },
  {
    id: 'bill-2',
    billNumber: 'BILL/2026/0089',
    vendorId: 'sup-3',
    vendorName: 'Southern Highlands Organic Cooperative',
    billDate: '2026-10-23',
    dueDate: '2026-11-06',
    siteId: 'site-1',
    reference: 'PO-2026-089 Organic Russet Potatoes',
    items: [
      {
        description: 'Iringa Highland Russet Potatoes 140kg',
        accountId: 'acc-1210',
        quantity: 140,
        unitPrice: 2500,
        taxRate: 0.18,
        total: 350000
      }
    ],
    subtotal: 350000,
    taxAmount: 63000,
    totalAmount: 413000,
    status: 'posted',
    paymentState: 'not_paid'
  },
  {
    id: 'bill-3',
    billNumber: 'BILL/2026/0090',
    vendorId: 'sup-2',
    vendorName: 'Kilombero Valley Organic Farms',
    billDate: '2026-10-20',
    dueDate: '2026-10-27',
    siteId: 'site-1',
    reference: 'PO-2026-085 Salad Greens & Microgreens',
    items: [
      {
        description: 'Crisp Hydroponic Mixed Greens & Herbs',
        accountId: 'acc-1210',
        quantity: 35,
        unitPrice: 6000,
        taxRate: 0.18,
        total: 210000
      }
    ],
    subtotal: 210000,
    taxAmount: 37800,
    totalAmount: 247800,
    status: 'posted',
    paymentState: 'not_paid'
  },
  {
    id: 'bill-4',
    billNumber: 'BILL/2026/0091',
    vendorId: 'sup-4',
    vendorName: 'Dar es Salaam Fresh Fisheries Guild',
    billDate: '2026-10-15',
    dueDate: '2026-10-22',
    siteId: 'site-1',
    reference: 'PO-2026-080 Fresh Red Snapper & Prawns',
    items: [
      {
        description: 'Wild Red Snapper Fillets & Jumbo Prawns',
        accountId: 'acc-1210',
        quantity: 30,
        unitPrice: 22000,
        taxRate: 0.18,
        total: 660000
      }
    ],
    subtotal: 660000,
    taxAmount: 118800,
    totalAmount: 778800,
    status: 'posted',
    paymentState: 'not_paid'
  }
];
