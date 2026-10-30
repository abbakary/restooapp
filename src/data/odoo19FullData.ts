export interface OdooAccount {
  code: string;
  name: string;
  type: string;
  initialBalance: number;
  debit: number;
  credit: number;
  endBalance: number;
}

export interface OdooPartnerEntry {
  partner: string;
  journal: string;
  account: string;
  invoiceDate: string;
  dueDate: string;
  matching: string;
  debit: number;
  credit: number;
  amountCurrency: number;
  balance: number;
  lines?: {
    date: string;
    moveName: string;
    label: string;
    debit: number;
    credit: number;
    balance: number;
  }[];
}

export interface OdooInvoice {
  id: string;
  number: string;
  partner: string;
  invoiceDate: string;
  dueDate: string;
  activity?: string;
  untaxedAmount: number;
  taxAmount: number;
  total: number;
  paymentState: 'Paid' | 'Not Paid' | 'In Payment' | 'Reversed';
  state: 'Draft' | 'Posted' | 'Cancelled';
}

export interface OdooPayment {
  id: string;
  name: string;
  paymentDate: string;
  partner: string;
  journal: string;
  paymentMethod: string;
  amount: number;
  state: 'Draft' | 'Posted' | 'Reconciled';
}

export interface OdooProduct {
  id: string;
  name: string;
  defaultCode: string;
  salesPrice: number;
  cost: number;
  category: string;
  taxes: string;
  qtyOnHand: number;
  unit: string;
}

// 1. Exact Trial Balance / General Ledger Accounts as provided by user
export const ODOO_TRIAL_BALANCE_ACCOUNTS: OdooAccount[] = [
  {
    code: '1011',
    name: 'Cash Ngome',
    type: 'Bank and Cash',
    initialBalance: 0.00,
    debit: 100100005.00,
    credit: 100100005.00,
    endBalance: 0.00
  },
  {
    code: '1031',
    name: 'Bank',
    type: 'Bank and Cash',
    initialBalance: 0.00,
    debit: 5229182.12,
    credit: 0.00,
    endBalance: 5229182.12
  },
  {
    code: '1550',
    name: 'Trade receivables (PoS)',
    type: 'Current Assets',
    initialBalance: 0.00,
    debit: 150100006.00,
    credit: 150100006.00,
    endBalance: 0.00
  },
  {
    code: '1900',
    name: 'Receivables And Contracts',
    type: 'Receivable',
    initialBalance: 10208186.54,
    debit: 50000001.00,
    credit: 55229183.12,
    endBalance: 4979004.42
  },
  {
    code: '3070',
    name: 'Tax received',
    type: 'Current Liabilities',
    initialBalance: -780908.12,
    debit: 0.00,
    credit: 15269492.29,
    endBalance: -16050400.41
  },
  {
    code: '4000',
    name: 'Revenue',
    type: 'Income',
    initialBalance: -7175875.42,
    debit: 0.00,
    credit: 84830512.71,
    endBalance: -92006388.13
  },
  {
    code: '9992',
    name: 'Cash Difference Loss',
    type: 'Expenses',
    initialBalance: 0.00,
    debit: 100100005.00,
    credit: 0.00,
    endBalance: 100100005.00
  },
  {
    code: 'RBF',
    name: 'Result Brought Forward',
    type: 'Equity',
    initialBalance: -2251403.00,
    debit: 0.00,
    credit: 0.00,
    endBalance: -2251403.00
  }
];

// 2. Exact General Ledger Ledger Summary
export const ODOO_GENERAL_LEDGER_DATA = [
  {
    code: '1011',
    name: 'Cash Ngome',
    debit: 100100005.00,
    credit: 100100005.00,
    balance: 0.00,
    lines: [
      { date: '2026-10-02', partner: 'Ngome Retail Till', label: 'Cash Drawer Float POS Intake', debit: 50050002.50, credit: 0.00, balance: 50050002.50 },
      { date: '2026-10-14', partner: 'CRDB Bank Vault', label: 'Cash Remittance to Vault', debit: 0.00, credit: 50050002.50, balance: 0.00 },
      { date: '2026-10-22', partner: 'Ngome Retail Till', label: 'Shift B POS Sales Cash Tender', debit: 50050002.50, credit: 0.00, balance: 50050002.50 },
      { date: '2026-10-25', partner: 'Cash Difference Write-off', label: 'Cash Ngome Reconciliation Offset', debit: 0.00, credit: 50050002.50, balance: 0.00 }
    ]
  },
  {
    code: '1031',
    name: 'Bank',
    debit: 5229182.12,
    credit: 0.00,
    balance: 5229182.12,
    lines: [
      { date: '2026-10-05', partner: 'Zalongwa Technologies', label: 'EFT Inward Settlement INV/2026/0002', debit: 3469182.12, credit: 0.00, balance: 3469182.12 },
      { date: '2026-10-18', partner: 'Administrator', label: 'Capital Injection Wire Deposit', debit: 1760000.00, credit: 0.00, balance: 5229182.12 }
    ]
  },
  {
    code: '1550',
    name: 'Trade receivables (PoS)',
    debit: 150100006.00,
    credit: 150100006.00,
    balance: 0.00,
    lines: [
      { date: '2026-10-01', partner: 'Unknown Partner', label: 'PoS Batch Orders Clearing POS/2026/10', debit: 75050003.00, credit: 0.00, balance: 75050003.00 },
      { date: '2026-10-01', partner: 'Unknown Partner', label: 'PoS Cashier Settlement Batch POS/2026/10', debit: 0.00, credit: 75050003.00, balance: 0.00 },
      { date: '2026-10-19', partner: 'Unknown Partner', label: 'PoS Shift Dining Orders POS/2026/19', debit: 75050003.00, credit: 0.00, balance: 75050003.00 },
      { date: '2026-10-19', partner: 'Unknown Partner', label: 'PoS Settlement Receipt POS/2026/19', debit: 0.00, credit: 75050003.00, balance: 0.00 }
    ]
  },
  {
    code: '1900',
    name: 'Receivables And Contracts',
    debit: 66865987.54,
    credit: 61886983.12,
    balance: 4979004.42,
    lines: [
      { date: '2026-10-03', partner: 'Ashura Juma', label: 'Customer Invoice INV/2026/0001', debit: 610531.00, credit: 0.00, balance: 610531.00 },
      { date: '2026-10-08', partner: 'Dr. Lungo', label: 'Hospitality Contract INV/2026/0003', debit: 1760000.00, credit: 0.00, balance: 2370531.00 },
      { date: '2026-10-15', partner: 'Zalongwa Technologies Limited', label: 'Software & Cloud Services INV/2026/0005', debit: 14636026.58, credit: 0.00, balance: 17006557.58 },
      { date: '2026-10-21', partner: 'Zalongwa Technologies Limited', label: 'Wire Payment Received BNK1/2026/002', debit: 0.00, credit: 11307126.58, balance: 5699431.00 },
      { date: '2026-10-23', partner: 'Yai Bora', label: 'Vendor Credit Allocation RND/2026/001', debit: 0.00, credit: 720426.58, balance: 4979004.42 }
    ]
  },
  {
    code: '3070',
    name: 'Tax received',
    debit: 0.00,
    credit: 16050400.41,
    balance: -16050400.41,
    lines: [
      { date: '2026-10-01', partner: 'Tanzania Revenue Authority', label: 'TRA Output VAT 18% Fiscal Tax', debit: 0.00, credit: 16050400.41, balance: -16050400.41 }
    ]
  },
  {
    code: '4000',
    name: 'Revenue',
    debit: 0.00,
    credit: 92006388.13,
    balance: -92006388.13,
    lines: [
      { date: '2026-10-01', partner: 'Corporate & Guests', label: 'Operating Food, Beverage & Service Revenue', debit: 0.00, credit: 92006388.13, balance: -92006388.13 }
    ]
  },
  {
    code: '9992',
    name: 'Cash Difference Loss',
    debit: 100100005.00,
    credit: 0.00,
    balance: 100100005.00,
    lines: [
      { date: '2026-10-25', partner: 'Cash Ngome Audit', label: 'Physical Count Reconciliation Adjustment', debit: 100100005.00, credit: 0.00, balance: 100100005.00 }
    ]
  },
  {
    code: 'RBF',
    name: 'Result Brought Forward',
    debit: 0.00,
    credit: 2251403.00,
    balance: -2251403.00,
    lines: [
      { date: '2026-01-01', partner: 'Historical FY2025', label: 'Opening Retained Earnings Rollforward', debit: 0.00, credit: 2251403.00, balance: -2251403.00 }
    ]
  }
];

// 3. Exact Partner Ledger Data
export const ODOO_PARTNER_LEDGER_DATA: OdooPartnerEntry[] = [
  {
    partner: 'Administrator',
    journal: 'MISC',
    account: '1900 Receivables And Contracts',
    invoiceDate: '2026-10-01',
    dueDate: '2026-10-31',
    matching: 'MATCH/001',
    debit: 50000001.00,
    credit: 50000001.00,
    amountCurrency: 0.00,
    balance: 0.00,
    lines: [
      { date: '2026-10-05', moveName: 'INV/2026/0001', label: 'Management Retainer Advance', debit: 50000001.00, credit: 0.00, balance: 50000001.00 },
      { date: '2026-10-20', moveName: 'BNK1/2026/001', label: 'Bank Settlement Contra', debit: 0.00, credit: 50000001.00, balance: 0.00 }
    ]
  },
  {
    partner: 'Ashura Juma',
    journal: 'INV',
    account: '1900 Receivables And Contracts',
    invoiceDate: '2026-10-03',
    dueDate: '2026-10-27',
    matching: 'PENDING',
    debit: 610531.00,
    credit: 0.00,
    amountCurrency: 610531.00,
    balance: 610531.00,
    lines: [
      { date: '2026-10-03', moveName: 'INV/2026/0002', label: 'Event Catering & Hall Reservation', debit: 610531.00, credit: 0.00, balance: 610531.00 }
    ]
  },
  {
    partner: 'Dr. Lungo',
    journal: 'INV',
    account: '1900 Receivables And Contracts',
    invoiceDate: '2026-06-15',
    dueDate: '2026-07-15',
    matching: 'UNPAID',
    debit: 0.00,
    credit: 0.00,
    amountCurrency: 1760000.00,
    balance: 1760000.00,
    lines: [
      { date: '2026-06-15', moveName: 'INV/2026/0088', label: 'Annual VIP Executive Dining Pass', debit: 1760000.00, credit: 0.00, balance: 1760000.00 }
    ]
  },
  {
    partner: 'Yai Bora',
    journal: 'BILL',
    account: '2010 Payables',
    invoiceDate: '2026-10-12',
    dueDate: '2026-10-26',
    matching: 'MATCH/009',
    debit: 0.00,
    credit: 579855.54,
    amountCurrency: 0.00,
    balance: 0.00,
    lines: [
      { date: '2026-10-12', moveName: 'BILL/2026/0014', label: 'Fresh Egg Trays Supply 300 dozen', debit: 0.00, credit: 579855.54, balance: -579855.54 },
      { date: '2026-10-22', moveName: 'BNK1/2026/009', label: 'Payment Settlement Wire', debit: 579855.54, credit: 0.00, balance: 0.00 }
    ]
  },
  {
    partner: 'Zalongwa Technologies Limited',
    journal: 'INV',
    account: '1900 Receivables And Contracts',
    invoiceDate: '2026-08-10',
    dueDate: '2026-09-10',
    matching: 'PARTIAL',
    debit: 14636026.58,
    credit: 11307126.58,
    amountCurrency: 3328900.00,
    balance: 3328900.00,
    lines: [
      { date: '2026-08-10', moveName: 'INV/2026/0045', label: 'Enterprise Server Hosting & Maintenance', debit: 14636026.58, credit: 0.00, balance: 14636026.58 },
      { date: '2026-09-15', moveName: 'BNK1/2026/012', label: 'Part-Payment Received TZS', debit: 0.00, credit: 11307126.58, balance: 3328900.00 }
    ]
  },
  {
    partner: 'Unknown Partner',
    journal: 'POS',
    account: '1550 Trade receivables (PoS)',
    invoiceDate: '2026-10-20',
    dueDate: '2026-10-20',
    matching: 'AUTO_SETTLED',
    debit: 150100006.00,
    credit: 150100006.00,
    amountCurrency: 0.00,
    balance: 0.00,
    lines: [
      { date: '2026-10-20', moveName: 'POS/2026/BCH1', label: 'Counter & Dining Orders', debit: 150100006.00, credit: 0.00, balance: 150100006.00 },
      { date: '2026-10-20', moveName: 'POS/2026/BCH1', label: 'Auto Batch Tender Clearance', debit: 0.00, credit: 150100006.00, balance: 0.00 }
    ]
  }
];

// 4. Exact Aged Receivable Data
export const ODOO_AGED_RECEIVABLES = [
  {
    partner: 'Ashura Juma',
    atDate: 610531.00,
    days1To30: 0.00,
    days31To60: 0.00,
    days61To90: 0.00,
    days91To120: 0.00,
    older: 0.00,
    total: 610531.00
  },
  {
    partner: 'Dr. Lungo',
    atDate: 0.00,
    days1To30: 0.00,
    days31To60: 0.00,
    days61To90: 0.00,
    days91To120: 0.00,
    older: 1760000.00,
    total: 1760000.00
  },
  {
    partner: 'Zalongwa Technologies Limited',
    atDate: 0.00,
    days1To30: -720426.58,
    days31To60: 0.00,
    days61To90: 3328900.00,
    days91To120: 0.00,
    older: 0.00,
    total: 2608473.42
  }
];

// 5. Invoices List Data (Customers -> Invoices)
export const ODOO_CUSTOMER_INVOICES: OdooInvoice[] = [
  {
    id: 'inv-001',
    number: 'INV/2026/00001',
    partner: 'Ashura Juma',
    invoiceDate: '2026-10-03',
    dueDate: '2026-10-27',
    activity: 'Email Sent',
    untaxedAmount: 517399.15,
    taxAmount: 93131.85,
    total: 610531.00,
    paymentState: 'Not Paid',
    state: 'Posted'
  },
  {
    id: 'inv-002',
    number: 'INV/2026/00002',
    partner: 'Zalongwa Technologies Limited',
    invoiceDate: '2026-08-10',
    dueDate: '2026-09-10',
    untaxedAmount: 12403412.36,
    taxAmount: 2232614.22,
    total: 14636026.58,
    paymentState: 'Not Paid',
    state: 'Posted'
  },
  {
    id: 'inv-003',
    number: 'INV/2026/00003',
    partner: 'Dr. Lungo',
    invoiceDate: '2026-06-15',
    dueDate: '2026-07-15',
    untaxedAmount: 1491525.42,
    taxAmount: 268474.58,
    total: 1760000.00,
    paymentState: 'Not Paid',
    state: 'Posted'
  },
  {
    id: 'inv-004',
    number: 'INV/2026/00004',
    partner: 'Serengeti Safari Camp Lodge',
    invoiceDate: '2026-10-18',
    dueDate: '2026-11-01',
    untaxedAmount: 42372881.36,
    taxAmount: 7627118.64,
    total: 50000000.00,
    paymentState: 'Paid',
    state: 'Posted'
  },
  {
    id: 'inv-005',
    number: 'INV/2026/00005',
    partner: 'Hyatt Regency Executive Lunch Group',
    invoiceDate: '2026-10-22',
    dueDate: '2026-10-29',
    untaxedAmount: 21694915.25,
    taxAmount: 3905084.75,
    total: 25600000.00,
    paymentState: 'Paid',
    state: 'Posted'
  }
];

// 6. Customer Credit Notes (Customers -> Credit Notes)
export const ODOO_CREDIT_NOTES = [
  {
    id: 'rvers-01',
    number: 'RINV/2026/0001',
    partner: 'Zalongwa Technologies Limited',
    invoiceDate: '2026-10-12',
    dueDate: '2026-10-12',
    reference: 'Reversal for invoice item adjustment',
    untaxedAmount: 610531.00,
    taxAmount: 109895.58,
    total: 720426.58,
    paymentState: 'Paid',
    state: 'Posted'
  }
];

// 7. Payments List Data (Customers & Vendors -> Payments)
export const ODOO_PAYMENTS_LIST: OdooPayment[] = [
  {
    id: 'pay-001',
    name: 'CUST.IN/2026/0001',
    paymentDate: '2026-10-05',
    partner: 'Administrator',
    journal: 'Bank (1031)',
    paymentMethod: 'Manual Electronic Wire',
    amount: 50000001.00,
    state: 'Reconciled'
  },
  {
    id: 'pay-002',
    name: 'CUST.IN/2026/0002',
    paymentDate: '2026-10-15',
    partner: 'Zalongwa Technologies Limited',
    journal: 'Bank (1031)',
    paymentMethod: 'Electronic Wire Transfer',
    amount: 11307126.58,
    state: 'Reconciled'
  },
  {
    id: 'pay-003',
    name: 'PAYS.OUT/2026/0001',
    paymentDate: '2026-10-22',
    partner: 'Yai Bora',
    journal: 'Bank (1031)',
    paymentMethod: 'Vendor Disbursement Wire',
    amount: 579855.54,
    state: 'Reconciled'
  },
  {
    id: 'pay-004',
    name: 'CUST.IN/2026/0003',
    paymentDate: '2026-10-24',
    partner: 'Serengeti Safari Camp Lodge',
    journal: 'Bank (1031)',
    paymentMethod: 'Card Batch Settle',
    amount: 50000000.00,
    state: 'Posted'
  }
];

// 8. Odoo Products Catalog (Customers -> Products)
export const ODOO_PRODUCTS: OdooProduct[] = [
  {
    id: 'prod-01',
    name: 'Prime Beef Tenderloin Steak (Dry-Aged)',
    defaultCode: 'FOD-STK-001',
    salesPrice: 48000.00,
    cost: 16800.00,
    category: 'Food / Grill',
    taxes: '18% VAT',
    qtyOnHand: 45,
    unit: 'Portions'
  },
  {
    id: 'prod-02',
    name: 'Zanzibar Tamarind Glazed Tiger Prawns',
    defaultCode: 'FOD-SEA-002',
    salesPrice: 42000.00,
    cost: 14700.00,
    category: 'Food / Seafood',
    taxes: '18% VAT',
    qtyOnHand: 32,
    unit: 'Portions'
  },
  {
    id: 'prod-03',
    name: 'Truffle Parmesan Hand-Cut Fries',
    defaultCode: 'FOD-SID-003',
    salesPrice: 18000.00,
    cost: 4500.00,
    category: 'Food / Sides',
    taxes: '18% VAT',
    qtyOnHand: 90,
    unit: 'Portions'
  },
  {
    id: 'prod-04',
    name: 'Serengeti Amber Honey Glazed Ribs',
    defaultCode: 'FOD-GRL-004',
    salesPrice: 38000.00,
    cost: 13300.00,
    category: 'Food / Grill',
    taxes: '18% VAT',
    qtyOnHand: 25,
    unit: 'Portions'
  },
  {
    id: 'prod-05',
    name: 'Kilimanjaro Summit Roast Coffee',
    defaultCode: 'BEV-HOT-001',
    salesPrice: 9000.00,
    cost: 1800.00,
    category: 'Beverage / Coffee',
    taxes: '18% VAT',
    qtyOnHand: 140,
    unit: 'Cups'
  },
  {
    id: 'prod-06',
    name: 'Passion Mint Hibiscus Fizz',
    defaultCode: 'BEV-BAR-002',
    salesPrice: 14000.00,
    cost: 2900.00,
    category: 'Beverage / Cocktails',
    taxes: '18% VAT',
    qtyOnHand: 65,
    unit: 'Glasses'
  }
];

// 9. Customers Directory (Customers -> Customers)
export const ODOO_CUSTOMERS_LIST = [
  {
    id: 'cust-01',
    name: 'Ashura Juma',
    phone: '+255 754 881 229',
    email: 'ashura.j@ngomeholding.or.tz',
    city: 'Dar es Salaam',
    totalInvoiced: 610531.00,
    outstandingBalance: 610531.00,
    paymentTerms: 'Immediate Payment'
  },
  {
    id: 'cust-02',
    name: 'Dr. Lungo',
    phone: '+255 713 002 911',
    email: 'dr.lungo@udsm.ac.tz',
    city: 'Dar es Salaam',
    totalInvoiced: 1760000.00,
    outstandingBalance: 1760000.00,
    paymentTerms: '30 Days'
  },
  {
    id: 'cust-03',
    name: 'Zalongwa Technologies Limited',
    phone: '+255 22 211 4400',
    email: 'accounts@zalongwa.com',
    city: 'Mikocheni, Dar es Salaam',
    totalInvoiced: 14636026.58,
    outstandingBalance: 3328900.00,
    paymentTerms: '15 Days'
  },
  {
    id: 'cust-04',
    name: 'Administrator',
    phone: '+255 700 000 001',
    email: 'admin@restoerp.com',
    city: 'HQ Oysterbay',
    totalInvoiced: 50000001.00,
    outstandingBalance: 0.00,
    paymentTerms: 'Immediate'
  },
  {
    id: 'cust-05',
    name: 'Serengeti Safari Camp Lodge',
    phone: '+255 27 250 8899',
    email: 'finance@serengeti-safari.com',
    city: 'Arusha',
    totalInvoiced: 50000000.00,
    outstandingBalance: 0.00,
    paymentTerms: '30 Days'
  }
];
