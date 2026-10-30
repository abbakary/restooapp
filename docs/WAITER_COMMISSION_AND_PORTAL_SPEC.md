# Developer Specification & System Flow
## Waiter Commission, Customer Portal & Order Routing

### 1. Executive Summary
This document specifies the complete system architecture, data models, routing rules, commission calculation engine, and reconciliation workflows for the **Waiter Commission, Customer Portal & Order Routing** module in RestoERP.

---

### 2. End-to-End System Flow

```
                                  [ CUSTOMER ORDERING ENTRYPOINTS ]
                                                  │
                 ┌────────────────────────────────┴──────────────────────────────┐
                 ▼                                                               ▼
   [ Waiter Link: /w/{token} ]                                      [ Table QR / General Portal ]
                 │                                                               │
                 ▼                                                               ▼
   Resolve Waiter via Token Hash                                   Resolve Table / General Routing
   (tenant_id + waiter_id)                                         (tenant_id + fallback rule)
                 │                                                               │
                 └───────────────────────────────┬───────────────────────────────┘
                                                 │
                                                 ▼
                                     [ SHARED ORDER ENGINE ]
                                   • Validates items & pricing
                                   • Assigns order source & waiter
                                   • Snapshots commission policy
                                   • Creates Order & OrderItems
                                                 │
                                 ┌───────────────┴───────────────┐
                                 ▼                               ▼
                     [ Kitchen Queue / KDS ]           [ Waiter Live Register ]
                     (Real-time push / SSE)            (Notification / Sound / Badge)
                                 │                               │
                                 └───────────────┬───────────────┘
                                                 ▼
                                         [ PAYMENT FLOW ]
                                 ┌───────────────┴───────────────┐
                                 ▼                               ▼
                     [ Direct Waiter Payment ]       [ Cashier Bill Request ]
                     (Cash / M-Pesa Mobile ref)      (Sent to Cashier Hub)
                                 │                               │
                                 └───────────────┬───────────────┘
                                                 ▼
                                   [ PAYMENT VERIFICATION ]
                                   • Idempotency key verified
                                   • Webhook / provider verified
                                                 │
                                                 ▼
                                   [ COMMISSION LEDGER ENGINE ]
                                   • Evaluates earning condition
                                   • Computes eligible amount & rate
                                   • Posts immutable ledger record
                                                 │
                                                 ▼
                                 [ MANAGER SHIFT RECONCILIATION ]
                                 • Cash handover (expected vs counted)
                                 • Commission review & batch approval
                                 • Disburse payout & record voucher
```

---

### 3. Order Routing Decision Matrix

| Order Source | Route / Trigger | Assigned Waiter Rule | Commission Eligibility |
| :--- | :--- | :--- | :--- |
| **`WAITER_LINK`** | `/restaurant/{slug}/w/{token}` | Strict match on active waiter token hash | Eligible (attributed to link owner) |
| **`TABLE_QR`** | `/restaurant/{slug}/t/{table_id}` | Designated waiter for table; fallback to round-robin | Eligible (attributed to table waiter) |
| **`GENERAL_PORTAL`** | `/restaurant/{slug}` | Customer picks server or manager-configured fallback | Eligible if assigned to waiter |
| **`WAITER_POS`** | Waiter tablet / mobile app | Authenticated waiter staff ID | Eligible |
| **`CASHIER_POS`** | Counter POS terminal | Creator = Cashier; Assigned Waiter = None or selected server | Ineligible for waiter unless explicitly assigned |

---

### 4. Database Schema (PostgreSQL DDL)

```sql
-- Waiter Profiles
CREATE TABLE waiter_profiles (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    branch_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    waiter_code VARCHAR(16) NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_tenant_waiter_code UNIQUE(tenant_id, waiter_code)
);
CREATE INDEX idx_waiter_tenant ON waiter_profiles(tenant_id, branch_id);

-- Waiter Unique Customer Links
CREATE TABLE waiter_order_links (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    waiter_id VARCHAR(64) REFERENCES waiter_profiles(id) ON DELETE CASCADE,
    public_token_hash VARCHAR(128) NOT NULL UNIQUE,
    canonical_slug VARCHAR(64) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_order_links_token ON waiter_order_links(public_token_hash) WHERE active = TRUE;

-- Commission Policies & Overrides
CREATE TYPE commission_method AS ENUM ('percentage', 'fixed_per_order', 'tiered');
CREATE TYPE commission_basis AS ENUM ('gross', 'net_ex_tax');
CREATE TYPE qualify_condition AS ENUM ('on_payment', 'on_served_and_approved');

CREATE TABLE commission_policies (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    branch_id VARCHAR(64),
    waiter_id VARCHAR(64) REFERENCES waiter_profiles(id) ON DELETE CASCADE, -- NULL = Default
    method commission_method NOT NULL DEFAULT 'percentage',
    rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    fixed_amount NUMERIC(12, 2) DEFAULT 0,
    basis commission_basis NOT NULL DEFAULT 'net_ex_tax',
    qualify_condition qualify_condition NOT NULL DEFAULT 'on_payment',
    tiers_json JSONB,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    effective_until TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_by_user_id VARCHAR(64) NOT NULL
);

-- Orders with Immutable Commission Snapshots
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    branch_id VARCHAR(64) NOT NULL,
    order_number VARCHAR(32) NOT NULL,
    source VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    table_id VARCHAR(64),
    customer_name VARCHAR(128),
    customer_phone VARCHAR(32),
    assigned_waiter_id VARCHAR(64) REFERENCES waiter_profiles(id),
    created_by_user_id VARCHAR(64),
    subtotal NUMERIC(12, 2) NOT NULL,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(32) DEFAULT 'unpaid',
    collected_by VARCHAR(16),
    commission_policy_id VARCHAR(64),
    commission_snapshot JSONB NOT NULL,
    commission_amount NUMERIC(12, 2) DEFAULT 0,
    commission_status VARCHAR(32) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commission Ledger (Audit-Proof, Idempotent)
CREATE TABLE commission_ledger (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id),
    waiter_id VARCHAR(64) NOT NULL REFERENCES waiter_profiles(id),
    order_total NUMERIC(12, 2) NOT NULL,
    eligible_amount NUMERIC(12, 2) NOT NULL,
    commission_amount NUMERIC(12, 2) NOT NULL,
    policy_snapshot JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, approved, paid, reversed
    reversal_of_id VARCHAR(64) REFERENCES commission_ledger(id),
    payout_id VARCHAR(64),
    approved_by_user_id VARCHAR(64),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_ledger_order_waiter UNIQUE(order_id, waiter_id)
);

-- Waiter Cash Settlements (Shift Reconciliation)
CREATE TABLE waiter_cash_settlements (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    waiter_id VARCHAR(64) NOT NULL REFERENCES waiter_profiles(id),
    shift_date DATE NOT NULL,
    expected_cash NUMERIC(12, 2) NOT NULL,
    actual_cash NUMERIC(12, 2) NOT NULL,
    variance NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    reconciled_by_user_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commission Payouts
CREATE TABLE commission_payouts (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    waiter_id VARCHAR(64) NOT NULL REFERENCES waiter_profiles(id),
    amount NUMERIC(12, 2) NOT NULL,
    orders_count INT NOT NULL,
    payment_method VARCHAR(32) NOT NULL,
    payment_reference VARCHAR(64) NOT NULL,
    approved_by_user_id VARCHAR(64) NOT NULL,
    disbursed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 5. API Endpoints Contract

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/waiter/me/orders` | Waiter | Current waiter active and completed order register |
| `GET` | `/api/v1/waiter/me/earnings` | Waiter | Current waiter earnings, approved commission & ledger |
| `GET` | `/api/v1/waiter/me/order-link` | Waiter | Current customer ordering URL & QR code payload |
| `POST` | `/api/v1/waiter/me/order-link/rotate` | Waiter | Revoke old token and issue new public ordering token |
| `GET` | `/api/v1/restaurant/{slug}/portal` | Public | Tenant branding, service options, waiter banner info |
| `GET` | `/api/v1/restaurant/{slug}/menu` | Public | Live restaurant menu and availability |
| `POST` | `/api/v1/restaurant/{slug}/orders` | Public | Submit customer order (with waiter token attribution) |
| `POST` | `/api/v1/orders/{id}/request-bill` | Waiter / Customer | Send check to Cashier Hub for front-desk collection |
| `POST` | `/api/v1/orders/{id}/payments` | Cashier / Waiter | Record cash or verified mobile-money payment |
| `GET` | `/api/v1/manager/reconciliation` | Manager / Owner | Daily shift reconciliation, cash handovers, variances |
| `GET` | `/api/v1/manager/commissions/policies` | Manager / Owner | List default policies and individual waiter overrides |
| `POST` | `/api/v1/manager/commissions/policies` | Manager / Owner | Create / update policy (requires effective date) |
| `POST` | `/api/v1/manager/commissions/payouts` | Manager / Owner | Disburse approved commission earnings |

---

### 6. Developer Acceptance Checklist

- [x] **Immutable Policy Snapshotting**: Orders store a full snapshot of the commission calculation formula at placement. Future policy updates never modify historical earnings.
- [x] **Token Revocation & Security**: Unique waiter ordering links identify the waiter without exposing employee credentials or auth sessions. Links can be rotated instantly.
- [x] **Idempotent Commission Posting**: Payment hooks and callbacks check uniqueness before posting to the ledger, preventing duplicate commission payouts.
- [x] **Cash Handover Variance Tracking**: Managers can view Expected Cash (sum of all waiter-collected cash orders) vs. Actual Cash submitted, calculating overage/shortage.
- [x] **Audit-Proof Reversals**: Cancelled orders and refunds post a distinct reversal entry referencing `reversal_of_id`, preserving an immutable history.
