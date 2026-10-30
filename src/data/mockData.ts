import { 
  Site, 
  RestaurantTable, 
  MenuItem, 
  InventoryItem, 
  Supplier, 
  PurchaseOrder, 
  ProductionOrder, 
  JournalEntry, 
  Employee, 
  ChecklistItem,
  Order,
  CustomerProfile,
  CashDrawerTransaction
} from '../types/erp';

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    name: 'Safari Grill & Lounge (Oysterbay)',
    type: 'Restaurant',
    city: 'Dar es Salaam',
    tablesCount: 16,
    currency: 'TZS',
    taxRate: 0.18,
    serviceChargeRate: 0.05,
    status: 'Active',
    manager: 'Juma Mwamburi',
    dailySalesTarget: 12500000,
  },
  {
    id: 'site-2',
    name: 'Zanzibar Spice Bistro',
    type: 'Restaurant',
    city: 'Stone Town, Zanzibar',
    tablesCount: 12,
    currency: 'TZS',
    taxRate: 0.15,
    serviceChargeRate: 0.05,
    status: 'Active',
    manager: 'Amina Salum',
    dailySalesTarget: 8900000,
  },
  {
    id: 'site-3',
    name: 'Safari Central Production Kitchen',
    type: 'Central Kitchen',
    city: 'Kurasini Logistics Hub',
    tablesCount: 0,
    currency: 'TZS',
    taxRate: 0.18,
    serviceChargeRate: 0.0,
    status: 'Active',
    manager: 'Chef Rashid Makange',
    dailySalesTarget: 0,
  },
  {
    id: 'site-4',
    name: 'Dodoma Executive Terrace',
    type: 'Restaurant',
    city: 'Dodoma Capital',
    tablesCount: 14,
    currency: 'TZS',
    taxRate: 0.18,
    serviceChargeRate: 0.05,
    status: 'Pilot',
    manager: 'Grace Tarimo',
    dailySalesTarget: 9500000,
  }
];

export const INITIAL_TABLES: RestaurantTable[] = [
  { id: 'tbl-1', number: 1, name: 'T1 - Window Booth', capacity: 4, section: 'Main Dining', status: 'occupied', currentOrderId: 'ord-101', seatedAt: '12:20 PM', serverName: 'Emmanuel K.' },
  { id: 'tbl-2', number: 2, name: 'T2 - Center Round', capacity: 6, section: 'Main Dining', status: 'bill_requested', currentOrderId: 'ord-102', seatedAt: '11:45 AM', serverName: 'Neema J.' },
  { id: 'tbl-3', number: 3, name: 'T3 - Intimate Corner', capacity: 2, section: 'Main Dining', status: 'vacant' },
  { id: 'tbl-4', number: 4, name: 'T4 - High Top Bar', capacity: 2, section: 'Bar Area', status: 'occupied', currentOrderId: 'ord-103', seatedAt: '12:40 PM', serverName: 'Emmanuel K.' },
  { id: 'tbl-5', number: 5, name: 'T5 - Ocean View', capacity: 4, section: 'Terrace Patio', status: 'reserved', seatedAt: '01:30 PM' },
  { id: 'tbl-6', number: 6, name: 'T6 - Breeze Pergola', capacity: 8, section: 'Terrace Patio', status: 'vacant' },
  { id: 'tbl-7', number: 7, name: 'T7 - VIP Private Suite', capacity: 10, section: 'VIP Lounge', status: 'occupied', currentOrderId: 'ord-104', seatedAt: '12:15 PM', serverName: 'Amina Salum' },
  { id: 'tbl-8', number: 8, name: 'T8 - Garden Alcove', capacity: 4, section: 'Terrace Patio', status: 'vacant' },
  { id: 'tbl-9', number: 9, name: 'T9 - Main Dining Bay', capacity: 4, section: 'Main Dining', status: 'vacant' },
  { id: 'tbl-10', number: 10, name: 'T10 - Banquette Left', capacity: 4, section: 'Main Dining', status: 'dirty' },
  { id: 'tbl-11', number: 11, name: 'T11 - Chef Pass View', capacity: 2, section: 'Main Dining', status: 'vacant' },
  { id: 'tbl-12', number: 12, name: 'T12 - Lounge Cocktails', capacity: 6, section: 'Bar Area', status: 'vacant' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Prime Beef Tenderloin (A-Grade)',
    sku: 'MEAT-BF-001',
    category: 'Meat & Poultry',
    currentStock: 28.5,
    unit: 'kg',
    parLevel: 35.0,
    reorderPoint: 15.0,
    costPerUnit: 28000,
    storageLocation: 'Cold Walk-in',
    theoreticalDepletedToday: 4.8,
    lastCountDate: '2026-10-23',
    batchNumber: 'BCH-2026-904',
    expiryDate: '2026-10-28',
    status: 'In Stock'
  },
  {
    id: 'inv-2',
    name: 'Jumbo Indian Ocean Tiger Prawns',
    sku: 'SEA-PR-002',
    category: 'Seafood',
    currentStock: 7.2,
    unit: 'kg',
    parLevel: 20.0,
    reorderPoint: 8.0,
    costPerUnit: 34000,
    storageLocation: 'Cold Walk-in',
    theoreticalDepletedToday: 5.6,
    lastCountDate: '2026-10-23',
    batchNumber: 'BCH-2026-898',
    expiryDate: '2026-10-26',
    status: 'Low Stock'
  },
  {
    id: 'inv-3',
    name: 'Fresh Snapper Fillet (Catch of the Day)',
    sku: 'SEA-SN-003',
    category: 'Seafood',
    currentStock: 14.0,
    unit: 'kg',
    parLevel: 18.0,
    reorderPoint: 6.0,
    costPerUnit: 22000,
    storageLocation: 'Cold Walk-in',
    theoreticalDepletedToday: 3.2,
    lastCountDate: '2026-10-23',
    batchNumber: 'BCH-2026-911',
    expiryDate: '2026-10-25',
    status: 'In Stock'
  },
  {
    id: 'inv-4',
    name: 'Aromatic Pemba Cloves & Swahili Spices',
    sku: 'DRY-SP-004',
    category: 'Dairy & Dry',
    currentStock: 12.0,
    unit: 'kg',
    parLevel: 15.0,
    reorderPoint: 4.0,
    costPerUnit: 18000,
    storageLocation: 'Main Store',
    theoreticalDepletedToday: 0.6,
    lastCountDate: '2026-10-22',
    batchNumber: 'BCH-2026-720',
    expiryDate: '2027-04-15',
    status: 'In Stock'
  },
  {
    id: 'inv-5',
    name: 'Organic Coconut Cream (Fresh Cold Pressed)',
    sku: 'DAI-CC-005',
    category: 'Dairy & Dry',
    currentStock: 18.0,
    unit: 'liters',
    parLevel: 25.0,
    reorderPoint: 10.0,
    costPerUnit: 8500,
    storageLocation: 'Kitchen Line',
    theoreticalDepletedToday: 3.5,
    lastCountDate: '2026-10-23',
    batchNumber: 'BCH-2026-920',
    expiryDate: '2026-10-27',
    status: 'In Stock'
  },
  {
    id: 'inv-6',
    name: 'Iringa Highland Russet Potatoes',
    sku: 'PROD-POT-006',
    category: 'Produce',
    currentStock: 4.5,
    unit: 'kg',
    parLevel: 50.0,
    reorderPoint: 15.0,
    costPerUnit: 2500,
    storageLocation: 'Main Store',
    theoreticalDepletedToday: 18.0,
    lastCountDate: '2026-10-23',
    batchNumber: 'BCH-2026-880',
    expiryDate: '2026-11-05',
    status: 'Critical'
  },
  {
    id: 'inv-7',
    name: 'Passion Fruit Pulp & Puree',
    sku: 'BEV-PF-007',
    category: 'Produce',
    currentStock: 16.0,
    unit: 'liters',
    parLevel: 20.0,
    reorderPoint: 6.0,
    costPerUnit: 7000,
    storageLocation: 'Bar Storage',
    theoreticalDepletedToday: 2.4,
    lastCountDate: '2026-10-23',
    batchNumber: 'BCH-2026-915',
    expiryDate: '2026-11-12',
    status: 'In Stock'
  },
  {
    id: 'inv-8',
    name: 'Takeaway Biodegradable Meal Boxes (Kraft)',
    sku: 'PKG-BX-008',
    category: 'Packaging',
    currentStock: 250,
    unit: 'pcs',
    parLevel: 500,
    reorderPoint: 100,
    costPerUnit: 800,
    storageLocation: 'Main Store',
    theoreticalDepletedToday: 42,
    lastCountDate: '2026-10-21',
    batchNumber: 'BCH-2026-501',
    expiryDate: '2028-01-01',
    status: 'In Stock'
  }
];

export const FOOD_IMAGE_PRESETS = [
  { name: 'Crispy Chicken Combo (uploaded photo)', url: '/assets/aistudio/image_d9b50d25.png' },
  { name: 'Crispy Fried Chicken Box', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80' },
  { name: 'Gourmet Crispy Zinger Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Dry-Aged Beef Tenderloin Steak', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
  { name: 'Grilled Jumbo Tiger Prawns', url: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Swahili Coconut Fish Curry', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Truffle Parmesan Fries', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80' },
  { name: 'Passion Fruit Panna Cotta', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80' },
  { name: 'Serengeti Sunset Mocktail', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Barista Iced Coffee / Shake', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80' }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-kfc-1',
    name: 'Crispy Golden Crunch Fried Chicken (3-Piece Box with Gravy)',
    sku: 'CHK-CRUNCH-01',
    category: 'Main Course',
    price: 32000,
    cost: 10400,
    station: 'Fry',
    is86: false,
    allergens: ['Gluten', 'Eggs'],
    preparationTimeMins: 12,
    description: 'Fresh chicken steeped in signature buttermilk spice blend, triple pressure-fried to ultra-crispy perfection, served with warm honey-butter biscuit and dipping gravy.',
    salesVelocity: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    recipe: [
      { stockItemId: 'inv-1', name: 'Prime Chicken Portions', quantity: 0.6, unit: 'kg', unitCost: 14000 },
      { stockItemId: 'inv-4', name: 'Swahili Spices', quantity: 0.04, unit: 'kg', unitCost: 18000 }
    ]
  },
  {
    id: 'menu-kfc-2',
    name: 'Firehouse Crispy Chicken Zinger Burger (Melted Cheddar & Slaw)',
    sku: 'BGR-ZING-02',
    category: 'Main Course',
    price: 28000,
    cost: 8900,
    station: 'Fry',
    is86: false,
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    preparationTimeMins: 10,
    description: 'Extra crunchy fried chicken breast, melted double mature cheddar cheese, crisp shredded lettuce, ripe tomato slice, and smoky chipotle aioli on a toasted brioche bun.',
    salesVelocity: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    recipe: [
      { stockItemId: 'inv-1', name: 'Prime Chicken Breast', quantity: 0.25, unit: 'kg', unitCost: 16000 },
      { stockItemId: 'inv-6', name: 'Iringa Russet Potatoes', quantity: 0.2, unit: 'kg', unitCost: 2500 }
    ]
  },
  {
    id: 'menu-1',
    name: 'Dry-Aged Beef Tenderloin Steak',
    sku: 'STEAK-01',
    category: 'Steaks & Grill',
    price: 48000,
    cost: 16500,
    station: 'Grill',
    is86: false,
    allergens: ['Dairy (Garlic Herb Butter)'],
    preparationTimeMins: 18,
    description: '300g grass-fed aged beef cooked to perfection over charcoal grill, served with rosemary confit potatoes and peppercorn reduction.',
    salesVelocity: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    recipe: [
      { stockItemId: 'inv-1', name: 'Prime Beef Tenderloin', quantity: 0.35, unit: 'kg', unitCost: 28000 },
      { stockItemId: 'inv-6', name: 'Iringa Russet Potatoes', quantity: 0.25, unit: 'kg', unitCost: 2500 }
    ]
  },
  {
    id: 'menu-2',
    name: 'Grilled Jumbo Tiger Prawns (Swahili Garlic Butter)',
    sku: 'SEAFD-02',
    category: 'Seafood',
    price: 54000,
    cost: 19800,
    station: 'Grill',
    is86: false,
    allergens: ['Crustaceans', 'Dairy'],
    preparationTimeMins: 15,
    description: 'Charred ocean tiger prawns glazed with lime chili herb butter, charred sweet corn, and saffron basmati rice.',
    salesVelocity: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80',
    recipe: [
      { stockItemId: 'inv-2', name: 'Tiger Prawns', quantity: 0.4, unit: 'kg', unitCost: 34000 },
      { stockItemId: 'inv-4', name: 'Swahili Spices', quantity: 0.05, unit: 'kg', unitCost: 18000 }
    ]
  },
  {
    id: 'menu-3',
    name: 'Swahili Coconut Red Snapper Curry',
    sku: 'CURRY-03',
    category: 'Main Course',
    price: 36000,
    cost: 11200,
    station: 'Fry',
    is86: false,
    allergens: ['Fish', 'Coconut'],
    preparationTimeMins: 14,
    description: 'Simmered snapper fillet in spiced coconut broth, fresh coriander, ginger, tamarind, and warm cassava flatbread.',
    salesVelocity: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    recipe: [
      { stockItemId: 'inv-3', name: 'Snapper Fillet', quantity: 0.3, unit: 'kg', unitCost: 22000 },
      { stockItemId: 'inv-5', name: 'Organic Coconut Cream', quantity: 0.25, unit: 'liters', unitCost: 8500 },
      { stockItemId: 'inv-4', name: 'Swahili Spices', quantity: 0.03, unit: 'kg', unitCost: 18000 }
    ]
  },
  {
    id: 'menu-4',
    name: 'Truffle Parmesan Hand-Cut Fries',
    sku: 'SIDE-04',
    category: 'Starters & Salads',
    price: 18000,
    cost: 4500,
    station: 'Fry',
    is86: false,
    allergens: ['Dairy'],
    preparationTimeMins: 8,
    description: 'Crispy double-cooked rustic fries tossed in white truffle essence, 24-month aged parmesan, and smoked garlic aioli.',
    salesVelocity: 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    recipe: [
      { stockItemId: 'inv-6', name: 'Iringa Russet Potatoes', quantity: 0.4, unit: 'kg', unitCost: 2500 }
    ]
  },
  {
    id: 'menu-5',
    name: 'Stone Town Passion Fruit Panna Cotta',
    sku: 'DESS-05',
    category: 'Desserts',
    price: 22000,
    cost: 5800,
    station: 'Pastry',
    is86: false,
    allergens: ['Dairy', 'Gelatin'],
    preparationTimeMins: 5,
    description: 'Velvety vanilla bean panna cotta crowned with tart Zanzibar passion fruit coulis and roasted coconut tuile.',
    salesVelocity: 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    recipe: [
      { stockItemId: 'inv-7', name: 'Passion Fruit Pulp', quantity: 0.1, unit: 'liters', unitCost: 7000 },
      { stockItemId: 'inv-5', name: 'Organic Coconut Cream', quantity: 0.1, unit: 'liters', unitCost: 8500 }
    ]
  },
  {
    id: 'menu-6',
    name: 'Serengeti Sunset Signature Mocktail',
    sku: 'BEV-06',
    category: 'Beverages & Cocktails',
    price: 15000,
    cost: 3200,
    station: 'Bar',
    is86: false,
    allergens: [],
    preparationTimeMins: 4,
    description: 'Layers of fresh passion fruit nectar, crushed mint, kaffir lime zest, and hibiscus ginger fizz over crushed ice.',
    salesVelocity: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    recipe: [
      { stockItemId: 'inv-7', name: 'Passion Fruit Pulp', quantity: 0.12, unit: 'liters', unitCost: 7000 }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-2026-101',
    siteId: 'site-1',
    type: 'Dine-in',
    tableNumber: 1,
    guestCount: 3,
    serverName: 'Emmanuel K.',
    createdAt: '12:20 PM',
    status: 'in_kitchen',
    subtotal: 138000,
    tax: 24840,
    serviceCharge: 6900,
    discount: 0,
    total: 169740,
    items: [
      {
        id: 'oi-1',
        menuItemId: 'menu-1',
        name: 'Dry-Aged Beef Tenderloin Steak',
        price: 48000,
        quantity: 2,
        station: 'Grill',
        selectedModifiers: ['Medium Rare', 'Truffle Butter (+4,000)'],
        specialNotes: 'No salt on chips for seat 2',
        course: 'Main',
        status: 'cooking',
        firedAt: '12:22 PM'
      },
      {
        id: 'oi-2',
        menuItemId: 'menu-4',
        name: 'Truffle Parmesan Hand-Cut Fries',
        price: 18000,
        quantity: 1,
        station: 'Fry',
        course: 'Starter',
        status: 'ready',
        firedAt: '12:21 PM'
      },
      {
        id: 'oi-3',
        menuItemId: 'menu-6',
        name: 'Serengeti Sunset Signature Mocktail',
        price: 15000,
        quantity: 2,
        station: 'Bar',
        course: 'Drinks',
        status: 'ready',
        firedAt: '12:20 PM'
      }
    ]
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-2026-102',
    siteId: 'site-1',
    type: 'Dine-in',
    tableNumber: 2,
    guestCount: 4,
    serverName: 'Neema J.',
    createdAt: '11:45 AM',
    status: 'served',
    subtotal: 198000,
    tax: 35640,
    serviceCharge: 9900,
    discount: 10000,
    total: 233540,
    items: [
      {
        id: 'oi-4',
        menuItemId: 'menu-2',
        name: 'Grilled Jumbo Tiger Prawns',
        price: 54000,
        quantity: 2,
        station: 'Grill',
        course: 'Main',
        status: 'served'
      },
      {
        id: 'oi-5',
        menuItemId: 'menu-3',
        name: 'Swahili Coconut Red Snapper Curry',
        price: 36000,
        quantity: 2,
        station: 'Fry',
        course: 'Main',
        status: 'served'
      },
      {
        id: 'oi-6',
        menuItemId: 'menu-5',
        name: 'Stone Town Passion Fruit Panna Cotta',
        price: 22000,
        quantity: 2,
        station: 'Pastry',
        course: 'Dessert',
        status: 'served'
      }
    ]
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-2026-103',
    siteId: 'site-1',
    type: 'Bar Tab',
    tableNumber: 4,
    guestCount: 1,
    serverName: 'Emmanuel K.',
    createdAt: '12:40 PM',
    status: 'in_kitchen',
    subtotal: 30000,
    tax: 5400,
    serviceCharge: 1500,
    discount: 0,
    total: 36900,
    items: [
      {
        id: 'oi-7',
        menuItemId: 'menu-6',
        name: 'Serengeti Sunset Signature Mocktail',
        price: 15000,
        quantity: 2,
        station: 'Bar',
        course: 'Drinks',
        status: 'pending',
        firedAt: '12:41 PM'
      }
    ]
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Kilimanjaro Prime Meats Ltd',
    code: 'SUP-KPM-01',
    category: 'Butchery & Poultry',
    contactPerson: 'David Kweka',
    phone: '+255 754 112 334',
    email: 'orders@kilimanjaromeats.co.tz',
    paymentTerms: 'Net 30 Days',
    rating: 4.9,
    leadTimeDays: 1
  },
  {
    id: 'sup-2',
    name: 'Zanzibar Artisanal Ocean Catchers',
    code: 'SUP-ZOC-02',
    category: 'Fresh Seafood',
    contactPerson: 'Captain Nassor Hamisi',
    phone: '+255 777 982 101',
    email: 'catch@zanzibarocean.co.tz',
    paymentTerms: 'COD / 7 Days',
    rating: 4.8,
    leadTimeDays: 1
  },
  {
    id: 'sup-3',
    name: 'Southern Highlands Organic Cooperative',
    code: 'SUP-SHOC-03',
    category: 'Produce & Greens',
    contactPerson: 'Agnes Mushi',
    phone: '+255 765 890 221',
    email: 'supply@highlandorganics.co.tz',
    paymentTerms: 'Net 15 Days',
    rating: 4.7,
    leadTimeDays: 2
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101',
    poNumber: 'PO-2026-088',
    siteId: 'site-1',
    supplierId: 'sup-1',
    supplierName: 'Kilimanjaro Prime Meats Ltd',
    orderDate: '2026-10-22',
    expectedDate: '2026-10-24',
    subtotal: 1400000,
    tax: 252000,
    totalAmount: 1652000,
    status: 'Approved',
    approvalLimitRequired: 1000000,
    approvedBy: 'Juma Mwamburi (Site Manager)',
    temperatureLoggedCelsius: 3.4,
    qualityPassed: true,
    items: [
      {
        stockItemId: 'inv-1',
        itemName: 'Prime Beef Tenderloin (A-Grade)',
        unit: 'kg',
        quantity: 50,
        unitPrice: 28000,
        lineTotal: 1400000,
        receivedQuantity: 50
      }
    ]
  },
  {
    id: 'po-102',
    poNumber: 'PO-2026-089',
    siteId: 'site-1',
    supplierId: 'sup-3',
    supplierName: 'Southern Highlands Organic Cooperative',
    orderDate: '2026-10-23',
    expectedDate: '2026-10-24',
    subtotal: 350000,
    tax: 63000,
    totalAmount: 413000,
    status: 'Submitted',
    approvalLimitRequired: 500000,
    items: [
      {
        stockItemId: 'inv-6',
        itemName: 'Iringa Highland Russet Potatoes',
        unit: 'kg',
        quantity: 140,
        unitPrice: 2500,
        lineTotal: 350000
      }
    ]
  }
];

export const INITIAL_PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: 'prod-1',
    batchNumber: 'CK-BCH-2026-44',
    centralKitchenSiteId: 'site-3',
    recipeName: 'Swahili Coconut Base Gravy (Master Pot)',
    targetQuantity: 120,
    unit: 'liters',
    destinationSiteId: 'site-1',
    scheduledDate: '2026-10-24',
    status: 'In Production',
    totalCost: 580000,
    yieldActualPercentage: 98.4
  },
  {
    id: 'prod-2',
    batchNumber: 'CK-BCH-2026-45',
    centralKitchenSiteId: 'site-3',
    recipeName: 'Pre-marinated Tiger Prawn Skewers',
    targetQuantity: 45,
    unit: 'kg',
    destinationSiteId: 'site-2',
    scheduledDate: '2026-10-24',
    status: 'Planned',
    totalCost: 1125000,
    yieldActualPercentage: 100
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'je-1',
    entryNumber: 'JE-2026-0041',
    date: '2026-10-23',
    source: 'POS Sales',
    description: 'Midday Lunch Shift Sales Posting (Oysterbay)',
    debitAccount: '1010 - Bank / M-Pesa Merchant Settlement',
    creditAccount: '4010 - Food & Beverage Revenue',
    amount: 3840000,
    siteId: 'site-1'
  },
  {
    id: 'je-2',
    entryNumber: 'JE-2026-0042',
    date: '2026-10-23',
    source: 'Inventory Depletion',
    description: 'Theoretical Stock Depletion - Lunch Service',
    debitAccount: '5010 - Cost of Goods Sold (COGS)',
    creditAccount: '1210 - Food Inventory Asset',
    amount: 1152000,
    siteId: 'site-1'
  },
  {
    id: 'je-3',
    entryNumber: 'JE-2026-0043',
    date: '2026-10-22',
    source: 'PO Receiving',
    description: 'Goods Receipt GRN-88 Butcher PO-2026-088',
    debitAccount: '1210 - Food Inventory Asset',
    creditAccount: '2010 - Accounts Payable (Trade)',
    amount: 1652000,
    siteId: 'site-1'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-0',
    name: 'Salim Barwani',
    role: 'Owner',
    employeeId: 'EMP-000',
    phone: '+255 777 888 999',
    email: 'owner@safari-resto.com',
    siteId: 'site-1',
    hourlyRate: 25000,
    weeklyHours: 40,
    clockedIn: true,
    clockInTime: '07:00 AM',
    healthCertExpiry: '2028-01-01',
    certStatus: 'Valid',
    pin: '0000',
    username: 'owner',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-1',
    name: 'Juma Mwamburi',
    role: 'Site Mgr',
    employeeId: 'EMP-001',
    phone: '+255 754 001 223',
    email: 'juma.m@safari-resto.com',
    siteId: 'site-1',
    hourlyRate: 15000,
    weeklyHours: 45,
    clockedIn: true,
    clockInTime: '07:45 AM',
    healthCertExpiry: '2027-03-15',
    certStatus: 'Valid',
    pin: '8888',
    username: 'juma.mgr',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-2',
    name: 'Rashid Makange',
    role: 'Chef',
    employeeId: 'EMP-002',
    phone: '+255 713 554 112',
    email: 'rashid.m@safari-resto.com',
    siteId: 'site-1',
    hourlyRate: 14000,
    weeklyHours: 48,
    clockedIn: true,
    clockInTime: '08:00 AM',
    healthCertExpiry: '2026-11-05',
    certStatus: 'Expiring Soon',
    pin: '2026',
    username: 'chef.rashid',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-3',
    name: 'Emmanuel Kiondo',
    role: 'Waiter',
    employeeId: 'EMP-003',
    phone: '+255 784 990 412',
    email: 'emmanuel.k@safari-resto.com',
    siteId: 'site-1',
    hourlyRate: 6500,
    weeklyHours: 40,
    clockedIn: true,
    clockInTime: '10:30 AM',
    healthCertExpiry: '2027-08-20',
    certStatus: 'Valid',
    pin: '1234',
    username: 'waiter.emmanuel',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-4',
    name: 'Neema Joseph',
    role: 'Cashier',
    employeeId: 'EMP-004',
    phone: '+255 762 109 883',
    email: 'neema.j@safari-resto.com',
    siteId: 'site-1',
    hourlyRate: 7500,
    weeklyHours: 42,
    clockedIn: true,
    clockInTime: '09:00 AM',
    healthCertExpiry: '2027-01-10',
    certStatus: 'Valid',
    pin: '5555',
    username: 'cashier.neema',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-5',
    name: 'Bakari Simba',
    role: 'Storekeeper',
    employeeId: 'EMP-005',
    phone: '+255 718 332 990',
    email: 'bakari.s@safari-resto.com',
    siteId: 'site-1',
    hourlyRate: 8000,
    weeklyHours: 45,
    clockedIn: true,
    clockInTime: '07:30 AM',
    healthCertExpiry: '2026-12-01',
    certStatus: 'Valid',
    pin: '3333',
    username: 'store.bakari',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-6',
    name: 'Fatma Al-Husseini',
    role: 'Finance',
    employeeId: 'EMP-006',
    phone: '+255 755 440 219',
    email: 'fatma.finance@safari-resto.com',
    siteId: 'site-1',
    hourlyRate: 16000,
    weeklyHours: 40,
    clockedIn: false,
    healthCertExpiry: '2027-09-01',
    certStatus: 'Valid',
    pin: '7777',
    username: 'finance.fatma',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-7',
    name: 'Amina Salum',
    role: 'Site Mgr',
    employeeId: 'EMP-007',
    phone: '+255 777 312 900',
    email: 'amina.s@safari-resto.com',
    siteId: 'site-2', // Zanzibar Spice Bistro
    hourlyRate: 15500,
    weeklyHours: 45,
    clockedIn: true,
    clockInTime: '08:00 AM',
    healthCertExpiry: '2027-10-15',
    certStatus: 'Valid',
    pin: '2222',
    username: 'amina.mgr',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-8',
    name: 'Baraka Nassor',
    role: 'Waiter',
    employeeId: 'EMP-008',
    phone: '+255 774 219 004',
    email: 'baraka.n@safari-resto.com',
    siteId: 'site-2', // Zanzibar Spice Bistro
    hourlyRate: 6800,
    weeklyHours: 40,
    clockedIn: true,
    clockInTime: '10:15 AM',
    healthCertExpiry: '2028-02-14',
    certStatus: 'Valid',
    pin: '2424',
    username: 'waiter.baraka',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-9',
    name: 'Chef Daudi Mwinyi',
    role: 'Chef',
    employeeId: 'EMP-009',
    phone: '+255 712 990 123',
    email: 'daudi.m@safari-resto.com',
    siteId: 'site-3', // Central Production Kitchen
    hourlyRate: 14500,
    weeklyHours: 48,
    clockedIn: true,
    clockInTime: '06:30 AM',
    healthCertExpiry: '2027-05-30',
    certStatus: 'Valid',
    pin: '3030',
    username: 'chef.daudi',
    password: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_CHECKLISTS: ChecklistItem[] = [
  { id: 'chk-1', phase: 'Opening', task: 'Verify walk-in chiller temperature (<= 4°C)', completed: true, signedBy: 'Chef Rashid Makange', recordedValue: '2.8°C' },
  { id: 'chk-2', phase: 'Opening', task: 'Verify deep freezer temperature (<= -18°C)', completed: true, signedBy: 'Chef Rashid Makange', recordedValue: '-19.4°C' },
  { id: 'chk-3', phase: 'Opening', task: 'Cash float verified in main drawer (TZS 500,000)', completed: true, signedBy: 'Neema Joseph (Cashier)', recordedValue: 'TZS 500,000' },
  { id: 'chk-4', phase: 'Opening', task: 'Review 86-item list and update KDS & Waiter terminals', completed: true, signedBy: 'Juma Mwamburi' },
  { id: 'chk-5', phase: 'HACCP Temperature', task: 'Midday hot holding line probe check (>= 63°C)', completed: true, signedBy: 'Chef Rashid', recordedValue: '71.5°C' },
  { id: 'chk-6', phase: 'HACCP Temperature', task: 'Seafood display iced tray surface probe check', completed: false },
  { id: 'chk-7', phase: 'Closing', task: 'Blind cash count and drop box reconciliation', completed: false },
  { id: 'chk-8', phase: 'Closing', task: 'Daily waste logging submission and manager sign-off', completed: false },
  { id: 'chk-9', phase: 'Closing', task: 'Run Z-Report and lock business day in Finance GL', completed: false }
];

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-1',
    name: 'Hon. Salim Ahmed',
    phone: '+255 754 112 340',
    email: 'salim.ahmed@parliament.go.tz',
    totalOrders: 18,
    totalSpend: 1420000,
    loyaltyPoints: 1420,
    lastVisit: 'Today, 12:45 PM',
    notes: 'VIP guest. Prefers table 14 (VIP Terrace). Well-done ribeye, sparkling water with lime.',
    preferredOrderType: 'Dine-in'
  },
  {
    id: 'cust-2',
    name: 'Dr. Amina Mkapa',
    phone: '+255 713 889 004',
    email: 'amina.mkapa@aga-khan.org',
    totalOrders: 12,
    totalSpend: 685000,
    loyaltyPoints: 685,
    lastVisit: 'Today, 01:10 PM',
    notes: 'Regular takeaway. Shellfish allergy. Loves Crispy Chicken Box extra sauce.',
    preferredOrderType: 'Takeaway'
  },
  {
    id: 'cust-3',
    name: 'Captain Jason Vance',
    phone: '+255 688 443 219',
    email: 'jvance@flyprecision.com',
    totalOrders: 9,
    totalSpend: 540000,
    loyaltyPoints: 540,
    lastVisit: 'Yesterday',
    notes: 'Corporate account billing. Fast delivery to Peninsula Marina Villa #12.',
    preferredOrderType: 'Delivery',
    deliveryAddress: 'Peninsula Marina Villas, Gate 4, House 12, Masaki'
  },
  {
    id: 'cust-4',
    name: 'Farida Kassim',
    phone: '+255 777 654 321',
    email: 'farida@kassim-advisory.co.tz',
    totalOrders: 6,
    totalSpend: 310000,
    loyaltyPoints: 310,
    lastVisit: 'Today, 11:30 AM',
    notes: 'Pays via M-Pesa. Always orders Stone Town Panna Cotta.',
    preferredOrderType: 'Dine-in'
  },
  {
    id: 'cust-5',
    name: 'Derrick Ochieng',
    phone: '+255 765 990 128',
    email: 'derrick@techhub-dar.com',
    totalOrders: 15,
    totalSpend: 495000,
    loyaltyPoints: 495,
    lastVisit: 'Today, 12:55 PM',
    notes: 'Frequent lunch delivery to Buni Innovation Hub, Sayansi Kijitonyama.',
    preferredOrderType: 'Delivery',
    deliveryAddress: 'COSTECH Building, 2nd Floor, Sayansi, Kijitonyama'
  }
];

export const INITIAL_CASH_DRAWER_TRANSACTIONS: CashDrawerTransaction[] = [
  {
    id: 'cdt-1',
    type: 'float_in',
    amount: 500000,
    reason: 'Morning Register Opening Float (Cashier Drawer Shift 1)',
    cashierName: 'Neema Joseph',
    timestamp: '08:00 AM',
    authorizedBy: 'Juma Mwamburi (Site Mgr)'
  },
  {
    id: 'cdt-2',
    type: 'sale',
    amount: 88500,
    reason: 'Settled Order ORD-101 (Table 12)',
    cashierName: 'Neema Joseph',
    timestamp: '12:15 PM',
    receiptNumber: 'REC-2026-101'
  },
  {
    id: 'cdt-3',
    type: 'payout',
    amount: 25000,
    reason: 'Petty Cash Payout: Emergency 50kg Crushed Ice from Oysterbay Iceworks',
    cashierName: 'Neema Joseph',
    timestamp: '11:15 AM',
    authorizedBy: 'Chef Rashid Makange'
  },
  {
    id: 'cdt-4',
    type: 'cash_drop',
    amount: 200000,
    reason: 'Midday Safe Drop (Excess cash moved to Main Vault)',
    cashierName: 'Neema Joseph',
    timestamp: '01:00 PM',
    authorizedBy: 'Juma Mwamburi (Site Mgr)'
  }
];

