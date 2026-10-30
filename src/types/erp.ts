export type UserRole = 
  | 'Owner'
  | 'Site Mgr'
  | 'Area Mgr'
  | 'Cashier'
  | 'Waiter'
  | 'Chef'
  | 'Storekeeper'
  | 'Finance';

export interface Site {
  id: string;
  name: string;
  type: 'Restaurant' | 'Central Kitchen' | 'Kiosk' | 'Warehouse' | 'HQ';
  city: string;
  tablesCount: number;
  currency: string;
  taxRate: number; // e.g. 0.18 for 18% VAT
  serviceChargeRate: number; // e.g. 0.05 for 5%
  status: 'Active' | 'Pilot' | 'Draft' | 'Temporarily Closed';
  manager: string;
  dailySalesTarget: number;
}

export type TableStatus = 'vacant' | 'occupied' | 'reserved' | 'bill_requested' | 'dirty';

export interface RestaurantTable {
  id: string;
  number: number;
  name: string;
  capacity: number;
  section: 'Main Dining' | 'Terrace Patio' | 'VIP Lounge' | 'Bar Area';
  status: TableStatus;
  currentOrderId?: string;
  seatedAt?: string;
  serverName?: string;
}

export interface MenuItemModifier {
  id: string;
  name: string;
  priceDelta: number;
}

export interface RecipeIngredient {
  stockItemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

export interface MenuItem {
  id: string;
  name: string;
  sku: string;
  category: 'Main Course' | 'Steaks & Grill' | 'Seafood' | 'Starters & Salads' | 'Desserts' | 'Beverages & Cocktails';
  price: number;
  cost: number;
  station: 'Grill' | 'Fry' | 'Cold' | 'Bar' | 'Pastry';
  is86: boolean; // out of stock toggle
  allergens: string[];
  preparationTimeMins: number;
  description: string;
  recipe: RecipeIngredient[];
  salesVelocity: 'high' | 'medium' | 'low';
  imageUrl?: string;
}

export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery' | 'Bar Tab';
export type OrderStatus = 'new' | 'in_kitchen' | 'ready' | 'dispatched' | 'served' | 'paid' | 'voided';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  station: 'Grill' | 'Fry' | 'Cold' | 'Bar' | 'Pastry';
  selectedModifiers?: string[];
  specialNotes?: string;
  course: 'Starter' | 'Main' | 'Dessert' | 'Drinks';
  status: 'pending' | 'cooking' | 'ready' | 'served';
  firedAt?: string;
}

export type ServiceMode = 'full_service_waiter' | 'counter_qr_no_waiter';
export type OrderSource = 'POS' | 'CUSTOMER_PORTAL' | 'WAITER_LINK' | 'TABLE_QR' | 'DELIVERY';

export interface Order {
  id: string;
  orderNumber: string;
  siteId: string;
  type: OrderType;
  source?: OrderSource;
  tableNumber?: number;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryFee?: number;
  pickupToken?: string;
  guestCount: number;
  serverName: string;
  assignedWaiterId?: string;
  assignedWaiterCode?: string;
  assignedWaiterName?: string;
  waiterLinkToken?: string;
  createdAt: string;
  readyAt?: string;
  dispatchedAt?: string;
  servedAt?: string;
  runnerName?: string;
  riderName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: 'Cash' | 'Credit Card' | 'M-Pesa / Mobile Money' | 'House Account' | 'Mixed';
  paidAt?: string;
  voidReason?: string;
  billRequested?: boolean;
  serviceMode?: ServiceMode;
  collectedBy?: 'waiter' | 'cashier' | 'online';
  paymentProviderRef?: string;
  commissionAmount?: number;
  commissionSnapshot?: CommissionPolicySnapshot;
  commissionStatus?: 'none' | 'pending' | 'approved' | 'paid' | 'reversed';
  billRequestId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'Meat & Poultry' | 'Seafood' | 'Produce' | 'Dairy & Dry' | 'Beverage & Spirits' | 'Packaging';
  currentStock: number;
  unit: string;
  parLevel: number;
  reorderPoint: number;
  costPerUnit: number;
  storageLocation: 'Main Store' | 'Cold Walk-in' | 'Kitchen Line' | 'Bar Storage';
  theoreticalDepletedToday: number;
  lastCountDate: string;
  batchNumber: string;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Critical';
}

export interface WasteEntry {
  id: string;
  stockItemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  totalCost: number;
  reason: 'Expired' | 'Prep Spoilage' | 'Dropped / Damaged' | 'Quality Reject' | 'Customer Return';
  loggedBy: string;
  date: string;
  notes: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  paymentTerms: string;
  rating: number; // 1-5
  leadTimeDays: number;
}

export interface PurchaseOrderItem {
  stockItemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  receivedQuantity?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  siteId: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Delivered' | 'Paid' | 'Cancelled';
  approvalLimitRequired: number;
  approvedBy?: string;
  temperatureLoggedCelsius?: number;
  qualityPassed?: boolean;
}

export interface ProductionOrder {
  id: string;
  batchNumber: string;
  centralKitchenSiteId: string;
  recipeName: string;
  targetQuantity: number;
  unit: string;
  destinationSiteId: string;
  scheduledDate: string;
  status: 'Planned' | 'In Production' | 'Quality Passed' | 'Dispatched' | 'Received at Branch';
  totalCost: number;
  yieldActualPercentage: number;
}

export type AccountType = 
  | 'asset_cash_bank'
  | 'asset_receivable'
  | 'asset_current'
  | 'asset_non_current'
  | 'liability_payable'
  | 'liability_current'
  | 'equity'
  | 'income_operating'
  | 'income_other'
  | 'cogs'
  | 'expense_operating'
  | 'expense_depreciation';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  reconcile?: boolean;
  currency?: string;
  initialDebit?: number;
  initialCredit?: number;
}

export type OdooJournalType = 
  | 'customer_invoices' 
  | 'vendor_bills' 
  | 'bank' 
  | 'cash' 
  | 'mpesa' 
  | 'inventory_valuation' 
  | 'general';

export interface JournalMoveLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  partner?: string;
  name: string; // Label
  debit: number;
  credit: number;
  reconciled?: boolean;
}

export interface JournalMove {
  id: string;
  name: string; // e.g. "INV/2026/0041" or "BILL/2026/0088"
  date: string;
  journalType: OdooJournalType;
  ref?: string;
  partnerName?: string;
  state: 'draft' | 'posted' | 'cancelled';
  siteId: string;
  lines: JournalMoveLine[];
  amountTotal: number;
}

export interface BankStatementItem {
  id: string;
  date: string;
  paymentRef: string;
  partner?: string;
  amount: number; // + for cash-in, - for payout
  journalType: 'bank' | 'mpesa' | 'cash';
  matchedMoveLineId?: string;
  isReconciled: boolean;
  siteId: string;
}

export interface VendorBill {
  id: string;
  billNumber: string;
  vendorId: string;
  vendorName: string;
  billDate: string;
  dueDate: string;
  siteId: string;
  reference: string;
  items: {
    description: string;
    accountId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  paymentState: 'not_paid' | 'partial' | 'paid';
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  source: 'POS Sales' | 'Inventory Depletion' | 'PO Receiving' | 'Waste Write-off' | 'Payroll' | 'Manual Journal';
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  siteId: string;
}

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  employeeId: string;
  phone: string;
  email: string;
  siteId: string;
  hourlyRate: number;
  weeklyHours: number;
  clockedIn: boolean;
  clockInTime?: string;
  healthCertExpiry: string; // YYYY-MM-DD
  certStatus: 'Valid' | 'Expiring Soon' | 'Expired';
  pin?: string;
  username?: string;
  password?: string;
  avatarUrl?: string;
}

export interface ChecklistItem {
  id: string;
  phase: 'Opening' | 'HACCP Temperature' | 'Closing';
  task: string;
  completed: boolean;
  signedBy?: string;
  recordedValue?: string; // e.g. "3.2°C"
}

export interface CashDrawerTransaction {
  id: string;
  type: 'float_in' | 'cash_drop' | 'payout' | 'sale';
  amount: number;
  reason: string;
  cashierName: string;
  timestamp: string;
  authorizedBy?: string;
  receiptNumber?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpend: number;
  loyaltyPoints: number;
  lastVisit: string;
  notes?: string;
  preferredOrderType?: OrderType;
  deliveryAddress?: string;
}

export interface DayEndReport {
  date: string;
  siteName: string;
  openingFloat: number;
  grossSales: number;
  discounts: number;
  netSales: number;
  taxCollected: number;
  serviceCharge: number;
  cashCollectedExpected: number;
  cashCountedActual: number;
  cashOverShort: number;
  cardPayments: number;
  mobileMoneyPayments: number;
  totalCovers: number;
  voidCount: number;
  voidTotal: number;
  wasteTotalCost: number;
  closedBy: string;
  timestamp: string;
}

export interface WaiterProfile {
  id: string;
  siteId: string;
  employeeId: string;
  name: string;
  code: string; // e.g. "W-101"
  phone: string;
  email: string;
  avatarUrl?: string;
  publicToken: string;
  active: boolean;
  overridePolicyId?: string;
  linkCreatedAt: string;
  linkRotatedAt?: string;
}

export interface CommissionTier {
  minSales: number;
  maxSales: number;
  rate: number; // e.g. 0.05
}

export interface CommissionPolicy {
  id: string;
  siteId: string;
  name: string;
  isDefault: boolean;
  waiterId?: string; // Optional individual waiter override
  method: 'percentage' | 'fixed' | 'tiered';
  rate: number; // 0.05 = 5%
  fixedAmount: number; // e.g. 2500 TZS
  tiers: CommissionTier[];
  basis: 'gross' | 'net'; // 'gross' (total with tax/service) or 'net' (subtotal - discount)
  qualifyCondition: 'payment_confirmed' | 'served_approved';
  effectiveFrom: string;
  effectiveUntil?: string;
  active: boolean;
  branchRule?: string;
  orderTypeRule?: OrderType[];
  updatedBy: string;
  updatedAt: string;
}

export interface CommissionPolicySnapshot {
  policyId: string;
  policyName: string;
  method: 'percentage' | 'fixed' | 'tiered';
  rate: number;
  fixedAmount: number;
  basis: 'gross' | 'net';
  qualifyCondition: string;
  appliedFormula: string;
}

export interface CommissionLedgerEntry {
  id: string;
  siteId: string;
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  waiterId: string;
  waiterName: string;
  waiterCode: string;
  source: OrderSource;
  policySnapshot: CommissionPolicySnapshot;
  eligibleAmount: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'reversed';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  paidAt?: string;
  payoutId?: string;
  reversalOfId?: string;
  reversalReason?: string;
}

export interface CommissionPayout {
  id: string;
  siteId: string;
  payoutNumber: string;
  waiterId: string;
  waiterName: string;
  waiterCode: string;
  amount: number;
  orderCount: number;
  entryIds: string[];
  periodStart: string;
  periodEnd: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'M-Pesa / Mobile Money';
  paymentReference: string;
  approvedBy: string;
  paidAt: string;
}

export interface BillRequest {
  id: string;
  siteId: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: number;
  waiterId: string;
  waiterName: string;
  totalAmount: number;
  status: 'pending' | 'settled';
  requestedAt: string;
  settledAt?: string;
  settledBy?: string;
}

export interface WaiterCashSettlement {
  id: string;
  siteId: string;
  waiterId: string;
  waiterName: string;
  shiftDate: string;
  expectedCash: number;
  actualCash: number;
  variance: number; // actual - expected
  notes?: string;
  reconciledBy: string;
  reconciledAt: string;
}

export interface AuditLogEntry {
  id: string;
  siteId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

