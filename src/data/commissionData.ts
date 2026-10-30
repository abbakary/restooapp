import { 
  WaiterProfile, 
  CommissionPolicy, 
  CommissionLedgerEntry, 
  CommissionPayout, 
  BillRequest, 
  WaiterCashSettlement, 
  AuditLogEntry 
} from '../types/erp';

export const INITIAL_WAITER_PROFILES: WaiterProfile[] = [
  {
    id: 'wp-1',
    siteId: 'site-1',
    employeeId: 'emp-3',
    name: 'Emmanuel Kiondo',
    code: 'W-101',
    phone: '+255 784 990 412',
    email: 'emmanuel.k@safari-resto.com',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    publicToken: 'w_emmanuel_k_8f92',
    active: true,
    linkCreatedAt: '2026-10-01 08:00 AM'
  },
  {
    id: 'wp-2',
    siteId: 'site-1',
    employeeId: 'emp-4',
    name: 'Neema Joseph',
    code: 'W-102',
    phone: '+255 762 109 883',
    email: 'neema.j@safari-resto.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    publicToken: 'w_neema_j_3c71',
    active: true,
    linkCreatedAt: '2026-10-02 09:30 AM'
  },
  {
    id: 'wp-3',
    siteId: 'site-2',
    employeeId: 'emp-8',
    name: 'Baraka Nassor',
    code: 'W-201',
    phone: '+255 774 219 004',
    email: 'baraka.n@safari-resto.com',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    publicToken: 'w_baraka_n_4k19',
    active: true,
    linkCreatedAt: '2026-10-05 11:00 AM'
  },
  {
    id: 'wp-4',
    siteId: 'site-1',
    employeeId: 'emp-10',
    name: 'Rehema Peter',
    code: 'W-103',
    phone: '+255 788 123 456',
    email: 'rehema.p@safari-resto.com',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
    publicToken: 'w_rehema_p_9a22',
    active: true,
    linkCreatedAt: '2026-10-10 10:00 AM'
  }
];

export const INITIAL_COMMISSION_POLICIES: CommissionPolicy[] = [
  {
    id: 'pol-default-site1',
    siteId: 'site-1',
    name: 'Standard Restaurant Policy (5% Net Eligible Sales)',
    isDefault: true,
    method: 'percentage',
    rate: 0.05,
    fixedAmount: 0,
    tiers: [
      { minSales: 0, maxSales: 500000, rate: 0.05 },
      { minSales: 500000, maxSales: 1500000, rate: 0.07 },
      { minSales: 1500000, maxSales: 99999999, rate: 0.10 }
    ],
    basis: 'net', // Net sales after discount, excluding tax & service charge
    qualifyCondition: 'payment_confirmed',
    effectiveFrom: '2026-10-01',
    active: true,
    updatedBy: 'Juma Mwamburi (Site Mgr)',
    updatedAt: '2026-10-01 09:00 AM'
  },
  {
    id: 'pol-override-emmanuel',
    siteId: 'site-1',
    name: 'Senior Waiter Override (Emmanuel K. - 7% Base / Tiered)',
    isDefault: false,
    waiterId: 'wp-1', // Override specifically for Emmanuel
    method: 'tiered',
    rate: 0.07,
    fixedAmount: 0,
    tiers: [
      { minSales: 0, maxSales: 400000, rate: 0.07 },
      { minSales: 400000, maxSales: 1000000, rate: 0.09 },
      { minSales: 1000000, maxSales: 99999999, rate: 0.12 }
    ],
    basis: 'net',
    qualifyCondition: 'payment_confirmed',
    effectiveFrom: '2026-10-15',
    active: true,
    updatedBy: 'Salim Barwani (Owner)',
    updatedAt: '2026-10-15 03:00 PM'
  },
  {
    id: 'pol-fixed-takeaway',
    siteId: 'site-1',
    name: 'Online Portal & Takeaway Flat Bounty (2,500 TZS / Order)',
    isDefault: false,
    method: 'fixed',
    rate: 0,
    fixedAmount: 2500,
    tiers: [],
    basis: 'gross',
    qualifyCondition: 'payment_confirmed',
    effectiveFrom: '2026-10-20',
    active: false,
    orderTypeRule: ['Takeaway', 'Delivery'],
    updatedBy: 'Juma Mwamburi (Site Mgr)',
    updatedAt: '2026-10-20 11:30 AM'
  }
];

export const INITIAL_COMMISSION_LEDGER: CommissionLedgerEntry[] = [
  {
    id: 'cme-101',
    siteId: 'site-1',
    orderId: 'ord-095',
    orderNumber: 'ORD-2026-095',
    orderTotal: 142000,
    waiterId: 'wp-1',
    waiterName: 'Emmanuel Kiondo',
    waiterCode: 'W-101',
    source: 'WAITER_LINK',
    policySnapshot: {
      policyId: 'pol-override-emmanuel',
      policyName: 'Senior Waiter Override (Emmanuel K.)',
      method: 'tiered',
      rate: 0.07,
      fixedAmount: 0,
      basis: 'net',
      qualifyCondition: 'payment_confirmed',
      appliedFormula: '7% of Net Sales (115,000 TZS) = 8,050 TZS'
    },
    eligibleAmount: 115000,
    commissionAmount: 8050,
    status: 'paid',
    createdAt: '2026-10-23 01:15 PM',
    approvedAt: '2026-10-23 09:00 PM',
    approvedBy: 'Juma Mwamburi (Site Mgr)',
    paidAt: '2026-10-24 10:00 AM',
    payoutId: 'payout-2026-001'
  },
  {
    id: 'cme-102',
    siteId: 'site-1',
    orderId: 'ord-097',
    orderNumber: 'ORD-2026-097',
    orderTotal: 96000,
    waiterId: 'wp-1',
    waiterName: 'Emmanuel Kiondo',
    waiterCode: 'W-101',
    source: 'CUSTOMER_PORTAL',
    policySnapshot: {
      policyId: 'pol-override-emmanuel',
      policyName: 'Senior Waiter Override (Emmanuel K.)',
      method: 'tiered',
      rate: 0.07,
      fixedAmount: 0,
      basis: 'net',
      qualifyCondition: 'payment_confirmed',
      appliedFormula: '7% of Net Sales (78,000 TZS) = 5,460 TZS'
    },
    eligibleAmount: 78000,
    commissionAmount: 5460,
    status: 'approved',
    createdAt: '2026-10-23 02:40 PM',
    approvedAt: '2026-10-23 09:00 PM',
    approvedBy: 'Juma Mwamburi (Site Mgr)'
  },
  {
    id: 'cme-103',
    siteId: 'site-1',
    orderId: 'ord-100',
    orderNumber: 'ORD-2026-100',
    orderTotal: 210000,
    waiterId: 'wp-2',
    waiterName: 'Neema Joseph',
    waiterCode: 'W-102',
    source: 'POS',
    policySnapshot: {
      policyId: 'pol-default-site1',
      policyName: 'Standard Restaurant Policy (5%)',
      method: 'percentage',
      rate: 0.05,
      fixedAmount: 0,
      basis: 'net',
      qualifyCondition: 'payment_confirmed',
      appliedFormula: '5% of Net Sales (170,000 TZS) = 8,500 TZS'
    },
    eligibleAmount: 170000,
    commissionAmount: 8500,
    status: 'approved',
    createdAt: '2026-10-23 07:20 PM',
    approvedAt: '2026-10-23 09:00 PM',
    approvedBy: 'Juma Mwamburi (Site Mgr)'
  },
  {
    id: 'cme-104',
    siteId: 'site-1',
    orderId: 'ord-101',
    orderNumber: 'ORD-2026-101',
    orderTotal: 169740,
    waiterId: 'wp-1',
    waiterName: 'Emmanuel Kiondo',
    waiterCode: 'W-101',
    source: 'WAITER_LINK',
    policySnapshot: {
      policyId: 'pol-override-emmanuel',
      policyName: 'Senior Waiter Override (Emmanuel K.)',
      method: 'tiered',
      rate: 0.07,
      fixedAmount: 0,
      basis: 'net',
      qualifyCondition: 'payment_confirmed',
      appliedFormula: '7% of Net Sales (138,000 TZS) = 9,660 TZS'
    },
    eligibleAmount: 138000,
    commissionAmount: 9660,
    status: 'pending',
    createdAt: '2026-10-24 12:20 PM'
  }
];

export const INITIAL_COMMISSION_PAYOUTS: CommissionPayout[] = [
  {
    id: 'payout-2026-001',
    siteId: 'site-1',
    payoutNumber: 'PAY-2026-041',
    waiterId: 'wp-1',
    waiterName: 'Emmanuel Kiondo',
    waiterCode: 'W-101',
    amount: 32500,
    orderCount: 4,
    entryIds: ['cme-101'],
    periodStart: '2026-10-16',
    periodEnd: '2026-10-22',
    paymentMethod: 'M-Pesa / Mobile Money',
    paymentReference: 'MPESA-TX-99882211',
    approvedBy: 'Juma Mwamburi (Site Mgr)',
    paidAt: '2026-10-23 05:30 PM'
  }
];

export const INITIAL_BILL_REQUESTS: BillRequest[] = [
  {
    id: 'br-1',
    siteId: 'site-1',
    orderId: 'ord-102',
    orderNumber: 'ORD-2026-102',
    tableNumber: 2,
    waiterId: 'wp-2',
    waiterName: 'Neema Joseph',
    totalAmount: 233540,
    status: 'pending',
    requestedAt: '12:15 PM'
  }
];

export const INITIAL_CASH_SETTLEMENTS: WaiterCashSettlement[] = [
  {
    id: 'wcs-1',
    siteId: 'site-1',
    waiterId: 'wp-1',
    waiterName: 'Emmanuel Kiondo',
    shiftDate: '2026-10-23',
    expectedCash: 385000,
    actualCash: 385000,
    variance: 0,
    notes: 'Shift balanced cleanly. No discrepancy.',
    reconciledBy: 'Juma Mwamburi (Site Mgr)',
    reconciledAt: '2026-10-23 11:15 PM'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    siteId: 'site-1',
    actorName: 'Salim Barwani',
    actorRole: 'Owner',
    action: 'POLICY_OVERRIDE_SET',
    entityType: 'COMMISSION_POLICY',
    entityId: 'pol-override-emmanuel',
    details: 'Configured 7% tiered incentive override for Senior Waiter Emmanuel Kiondo (#W-101)',
    timestamp: '2026-10-15 03:00 PM'
  },
  {
    id: 'aud-2',
    siteId: 'site-1',
    actorName: 'Juma Mwamburi',
    actorRole: 'Site Mgr',
    action: 'COMMISSION_PAYOUT_DISBURSED',
    entityType: 'COMMISSION_PAYOUT',
    entityId: 'payout-2026-001',
    details: 'Disbursed 32,500 TZS commission payout to Emmanuel Kiondo via M-Pesa (Ref: MPESA-TX-99882211)',
    timestamp: '2026-10-23 05:30 PM'
  }
];
