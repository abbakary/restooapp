import {
  LayoutDashboard, UtensilsCrossed, ChefHat, BookOpen, Boxes, Truck, Building2,
  DollarSign, Users, ClipboardCheck, BarChart3, Receipt, QrCode, UserCheck, BadgePercent,
} from 'lucide-react';
import { UserRole } from '../types/erp';

export type NavGroupId = 'overview' | 'service' | 'kitchen' | 'backoffice';

export interface NavItem {
  id: string;
  label: string;
  /** Short label used in breadcrumbs, tooltips and the command palette */
  short: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  group: NavGroupId;
  /** undefined = every role may open it */
  allowedRoles?: UserRole[];
  /** Operational terminals that use the full viewport width */
  terminal?: boolean;
  keywords?: string[];
}

export const NAV_GROUPS: { id: NavGroupId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'service', label: 'Service' },
  { id: 'kitchen', label: 'Kitchen & Supply' },
  { id: 'backoffice', label: 'Back Office' },
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'HQ & Site Overview', short: 'Overview', description: 'KPIs, covers & alerts', icon: LayoutDashboard, group: 'overview', keywords: ['home', 'kpi', 'sales'] },
  { id: 'pos', label: 'Front of House & POS', short: 'POS', description: 'Floor plan, orders & tabs', icon: UtensilsCrossed, group: 'service', terminal: true, allowedRoles: ['Owner', 'Site Mgr', 'Area Mgr', 'Cashier', 'Waiter'], keywords: ['register', 'table', 'order', 'checkout'] },
  { id: 'waiter', label: 'Waiter Terminal & Tables', short: 'Waiter', description: 'Orders, pass alerts & service', icon: UserCheck, group: 'service', terminal: true, allowedRoles: ['Owner', 'Site Mgr', 'Area Mgr', 'Waiter'], keywords: ['handheld', 'table'] },
  { id: 'commissions', label: 'Waiter Commissions & Reconciliation', short: 'Commissions', description: 'Policy, ledger, payouts & audit', icon: BadgePercent, group: 'service', allowedRoles: ['Owner', 'Site Mgr', 'Area Mgr', 'Finance'], keywords: ['commission', 'waiter link', 'reconciliation', 'ledger', 'payout'] },
  { id: 'cashier-tracking', label: 'Cashier Hub & Tracking', short: 'Cashier Hub', description: 'Sales, drawer, orders & CRM', icon: Receipt, group: 'service', allowedRoles: ['Owner', 'Site Mgr', 'Area Mgr', 'Cashier', 'Finance'], keywords: ['drawer', 'cash', 'void', 'customers', 'crm'] },
  { id: 'customer-portal', label: 'Customer QR Portal', short: 'QR Portal', description: 'Self-ordering & live tracker', icon: QrCode, group: 'service', terminal: true, keywords: ['self order', 'qr', 'guest'] },
  { id: 'kds', label: 'Kitchen Display (KDS)', short: 'KDS', description: 'Station tickets & 86 list', icon: ChefHat, group: 'kitchen', terminal: true, allowedRoles: ['Owner', 'Site Mgr', 'Chef'], keywords: ['tickets', '86', 'stations'] },
  { id: 'menu', label: 'Menu, BOM & Costing', short: 'Menu & Costing', description: 'Recipes, yields & margins', icon: BookOpen, group: 'kitchen', allowedRoles: ['Owner', 'Site Mgr', 'Area Mgr', 'Chef', 'Finance'], keywords: ['recipe', 'bom', 'margin'] },
  { id: 'inventory', label: 'Inventory & Stock', short: 'Inventory', description: 'Locations, theoretical & waste', icon: Boxes, group: 'kitchen', allowedRoles: ['Owner', 'Site Mgr', 'Area Mgr', 'Storekeeper', 'Chef', 'Finance'], keywords: ['stock', 'waste', 'par'] },
  { id: 'procurement', label: 'Procurement & 3-Way', short: 'Procurement', description: 'Suppliers, POs & GRN logs', icon: Truck, group: 'kitchen', allowedRoles: ['Owner', 'Site Mgr', 'Area Mgr', 'Storekeeper', 'Finance'], keywords: ['purchase', 'supplier', 'grn'] },
  { id: 'central-kitchen', label: 'Central Production', short: 'Central Kitchen', description: 'Batch orders & branch dispatch', icon: Building2, group: 'kitchen', allowedRoles: ['Owner', 'Site Mgr', 'Chef', 'Area Mgr', 'Storekeeper'], keywords: ['batch', 'dispatch', 'production'] },
  { id: 'finance', label: 'Odoo 19 Accounting', short: 'Accounting', description: 'P&L, Balance Sheet, GL & Tax', icon: DollarSign, group: 'backoffice', allowedRoles: ['Owner', 'Site Mgr', 'Area Mgr', 'Finance'], keywords: ['ledger', 'p&l', 'tax', 'bills', 'journal'] },
  { id: 'staff', label: 'Staff & Rostering', short: 'Staff', description: 'Labor %, health certs & clock', icon: Users, group: 'backoffice', allowedRoles: ['Owner', 'Site Mgr', 'Area Mgr', 'Finance'], keywords: ['hr', 'roster', 'clock', 'employees'] },
  { id: 'checklists', label: 'Day Flow & Checklists', short: 'Day Flow', description: 'Opening, HACCP & Z-Close', icon: ClipboardCheck, group: 'backoffice', keywords: ['haccp', 'opening', 'closing', 'z-close'] },
  { id: 'reports', label: 'Reports & Analytics', short: 'Reports', description: 'Menu matrix & void audit', icon: BarChart3, group: 'backoffice', allowedRoles: ['Owner', 'Site Mgr', 'Area Mgr', 'Finance'], keywords: ['analytics', 'void', 'matrix'] },
];

export const getNavItem = (id: string) => NAV_ITEMS.find(n => n.id === id);

export const canAccess = (item: NavItem | undefined, role: UserRole) =>
  !!item && (!item.allowedRoles || item.allowedRoles.includes(role));

/** The first screen each role should land on after signing in. */
export const landingTabForRole = (role: UserRole): string => {
  switch (role) {
    case 'Waiter': return 'waiter';
    case 'Chef': return 'kds';
    case 'Cashier': return 'pos';
    case 'Storekeeper': return 'inventory';
    case 'Finance': return 'finance';
    case 'Owner':
    case 'Area Mgr':
    case 'Site Mgr':
    default: return 'dashboard'; // managers/owners start on the overview, not the POS
  }
};

/** Roles that anyone may pick when self-registering. Privileged roles are created by HQ. */
export const SELF_REGISTER_ROLES: UserRole[] = ['Waiter', 'Cashier', 'Chef', 'Storekeeper'];
