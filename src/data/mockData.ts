import { 
  User, Customer, Vehicle, WorkOrder, Part, Supplier, 
  PurchaseOrder, Invoice, Expense, WorkshopSettings, 
  NotificationItem, ActivityLog, CashBox
} from '../types';

export const initialUsers: User[] = [
  { id: 'usr-1', name: 'المهندس طارق العلي', username: 'admin', role: 'owner', phone: '0501234567', isActive: true },
  { id: 'usr-2', name: 'محمود عبد السلام', username: 'accountant', role: 'owner', phone: '0509876543', isActive: true },
  { id: 'usr-3', name: 'سامر الشامي', username: 'reception', role: 'owner', phone: '0505554433', isActive: true },
  { id: 'usr-4', name: 'أحمد علي', username: 'tech1', role: 'owner', phone: '0501112233', isActive: true },
  { id: 'usr-5', name: 'خالد حسن', username: 'tech2', role: 'owner', phone: '0502223344', isActive: true },
  { id: 'usr-6', name: 'محمد إبراهيم', username: 'tech3', role: 'owner', phone: '0503334455', isActive: true },
];

export const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'أحمد عادل', phone: '0501239988', email: 'ahmed.adel@gmail.com', address: 'دبي - شارع الشيخ زايد', notes: 'عميل مميز - صيانة دورية منتظمة', createdAt: '2024-01-15' },
  { id: 'cust-2', name: 'محمد أحمد العتيبي', phone: '0554433221', email: 'm.otaibi@hotmail.com', address: 'الرياض - حي الملز', notes: 'يرغب دائما في قطع غيار أصلية وكالة', createdAt: '2024-02-10' },
  { id: 'cust-3', name: 'سارة حسن المنصوري', phone: '0567788990', email: 'sara.mansoori@yahoo.com', address: 'أبوظبي - حي المرور', notes: '', createdAt: '2024-03-01' },
  { id: 'cust-4', name: 'علي ماهر الإبراهيم', phone: '0523344556', email: 'ali.maher@gmail.com', address: 'جدة - حي الشاطئ', notes: '', createdAt: '2024-03-20' },
  { id: 'cust-5', name: 'مريم الكتبي', phone: '0589900112', email: 'maryam.k@alain.ae', address: 'العين - الهيلي', notes: 'يرجى الاتصال قبل البدء بأي أعمال إضافية', createdAt: '2024-04-05' },
];

export const initialVehicles: Vehicle[] = [
  { id: 'veh-1', customerId: 'cust-1', customerName: 'أحمد عادل', plateNumber: 'أ ب ج 1234', make: 'JAC', model: 'S2', year: 2022, chassisNumber: 'JAC8892110293812', color: 'أسود ميتاليك', currentMileage: 85400 },
  { id: 'veh-2', customerId: 'cust-2', customerName: 'محمد أحمد العتيبي', plateNumber: 'دبي 12345 G', make: 'تويوتا', model: 'لاند كروزر', year: 2023, chassisNumber: 'JTE2023490192831', color: 'أبيض لؤلؤي', currentMileage: 42100 },
  { id: 'veh-3', customerId: 'cust-3', customerName: 'سارة حسن المنصوري', plateNumber: 'ل م ن 456', make: 'بي ام دبليو', model: 'X5', year: 2021, chassisNumber: 'WBAX520210098231', color: 'كحلي', currentMileage: 68000 },
  { id: 'veh-4', customerId: 'cust-4', customerName: 'علي ماهر الإبراهيم', plateNumber: 'هـ و ي 789', make: 'فورد', model: 'فوكس', year: 2020, chassisNumber: 'WF0F202039120482', color: 'فضي', currentMileage: 112000 },
  { id: 'veh-5', customerId: 'cust-5', customerName: 'مريم الكتبي', plateNumber: 'أ ب ج 123', make: 'مرسيدس', model: 'C-Class', year: 2021, chassisNumber: 'WDD2052021983012', color: 'رمادي', currentMileage: 54000 },
];

export const initialParts: Part[] = [
  { id: 'prt-1', sku: 'BRK-1023', name: 'فحامات فرامل أمامية (سفايف)', category: 'نظام الفرامل', quantityInStock: 2, reorderLevel: 5, purchasePrice: 90, salePrice: 120, supplierId: 'sup-1', supplierName: 'شركة الخليج لقطع الغيار', status: 'low_stock' },
  { id: 'prt-2', sku: 'FIL-5501', name: 'فلتر زيت محرك أصلي', category: 'محرك/فلاتر', quantityInStock: 10, reorderLevel: 5, purchasePrice: 30, salePrice: 45, supplierId: 'sup-1', supplierName: 'شركة الخليج لقطع الغيار', status: 'in_stock' },
  { id: 'prt-3', sku: 'PMP-8802', name: 'مضخة وقود (طرمبة بنزين)', category: 'نظام الوقود', quantityInStock: 3, reorderLevel: 4, purchasePrice: 180, salePrice: 250, supplierId: 'sup-2', supplierName: 'مؤسسة الأمل للتوريدات', status: 'low_stock' },
  { id: 'prt-4', sku: 'BAT-2058', name: 'بطارية سيارة 12 فولت 70 أمبير', category: 'كهربائي', quantityInStock: 3, reorderLevel: 3, purchasePrice: 350, salePrice: 500, supplierId: 'sup-2', supplierName: 'مؤسسة الأمل للتوريدات', status: 'in_stock' },
  { id: 'prt-5', sku: 'SPK-1004', name: 'شمعات إشعال بلاتينيوم (بواجي)', category: 'محرك', quantityInStock: 0, reorderLevel: 8, purchasePrice: 45, salePrice: 80, supplierId: 'sup-1', supplierName: 'شركة الخليج لقطع الغيار', status: 'out_of_stock' },
  { id: 'prt-6', sku: 'WIP-702', name: 'ممسحة زجاج هيدروليك', category: 'ملحقات', quantityInStock: 1, reorderLevel: 3, purchasePrice: 20, salePrice: 35, supplierId: 'sup-2', supplierName: 'مؤسسة الأمل للتوريدات', status: 'low_stock' },
  { id: 'prt-7', sku: 'OIL-5W30', name: 'زيت محرك تخليقي بالكامل 5W-30 (4 لتر)', category: 'زيوت وموائع', quantityInStock: 15, reorderLevel: 5, purchasePrice: 110, salePrice: 160, supplierId: 'sup-1', supplierName: 'شركة الخليج لقطع الغيار', status: 'in_stock' },
];

export const initialWorkOrders: WorkOrder[] = [
  {
    id: 'JC-2026-089',
    vehicleId: 'veh-1',
    customerId: 'cust-1',
    customerName: 'أحمد عادل',
    vehicleName: 'JAC S2 2022',
    plateNumber: 'أ ب ج 1234',
    chassisNumber: 'JAC8892110293812',
    currentMileage: 85400,
    technicianId: 'usr-6',
    technicianName: 'محمد إبراهيم',
    status: 'in_progress',
    reportedIssues: 'صوت صرير عند ضغط الفرامل + اهتزاز خفيف بالسيارة عند سرعة 80 كم/س + فحص كمبيوتر',
    inspectionNotes: 'الفحامات الأمامية متآكلة ويلزم خرط الطنابير الأمامية وتغيير زيت المحرك.',
    checkInDate: '2026-07-23 09:15',
    estimatedCompletionDate: '2026-07-23 16:00',
    services: [
      { id: 'wos-1', serviceId: 'srv-1', serviceName: 'فحص كمبيوتر شامل وتشخيص أعطال', cost: 150, technicianId: 'usr-6', technicianName: 'محمد إبراهيم', status: 'completed' },
      { id: 'wos-2', serviceId: 'srv-2', serviceName: 'خرط طنابير أمامي وتغيير قماشات', cost: 450, technicianId: 'usr-5', technicianName: 'خالد حسن', status: 'in_progress' },
    ],
    parts: [
      { id: 'wop-1', partId: 'prt-1', partName: 'فحامات فرامل أمامية (سفايف)', partSku: 'BRK-1023', quantity: 1, unitPrice: 120, totalPrice: 120 },
      { id: 'wop-2', partId: 'prt-2', partName: 'فلتر زيت محرك أصلي', partSku: 'FIL-5501', quantity: 1, unitPrice: 45, totalPrice: 45 },
      { id: 'wop-3', partId: 'prt-7', partName: 'زيت محرك تخليقي 5W-30', partSku: 'OIL-5W30', quantity: 1, unitPrice: 160, totalPrice: 160 },
    ],
    laborTotal: 600,
    partsTotal: 325,
    estimatedCost: 2450,
    finalCost: 925,
    createdBy: 'سامر الشامي',
  },
  {
    id: 'JC-2026-088',
    vehicleId: 'veh-2',
    customerId: 'cust-2',
    customerName: 'محمد أحمد العتيبي',
    vehicleName: 'تويوتا لاند كروزر 2023',
    plateNumber: 'دبي 12345 G',
    chassisNumber: 'JTE2023490192831',
    currentMileage: 42100,
    technicianId: 'usr-4',
    technicianName: 'أحمد علي',
    status: 'ready',
    reportedIssues: 'صيانة 40,000 كم + تغيير الزيت والفلاتر + فحص المكيف',
    inspectionNotes: 'تم تنظيف فلاتر التكييف وتغيير زيت المحرك بنجاح.',
    checkInDate: '2026-07-22 10:00',
    completionDate: '2026-07-23 11:30',
    services: [
      { id: 'wos-3', serviceId: 'srv-3', serviceName: 'صيانة دورية وتغيير زيت وفلتر', cost: 200, technicianId: 'usr-4', technicianName: 'أحمد علي', status: 'completed' },
      { id: 'wos-4', serviceId: 'srv-4', serviceName: 'فحص وتنظيف نظام التكييف', cost: 150, technicianId: 'usr-6', technicianName: 'محمد إبراهيم', status: 'completed' }
    ],
    parts: [
      { id: 'wop-4', partId: 'prt-2', partName: 'فلتر زيت محرك أصلي', partSku: 'FIL-5501', quantity: 1, unitPrice: 45, totalPrice: 45 },
      { id: 'wop-5', partId: 'prt-7', partName: 'زيت محرك تخليقي 5W-30', partSku: 'OIL-5W30', quantity: 2, unitPrice: 160, totalPrice: 320 }
    ],
    laborTotal: 350,
    partsTotal: 365,
    estimatedCost: 715,
    finalCost: 715,
    createdBy: 'سامر الشامي',
  },
  {
    id: 'JC-2026-087',
    vehicleId: 'veh-3',
    customerId: 'cust-3',
    customerName: 'سارة حسن المنصوري',
    vehicleName: 'بي ام دبليو X5 2021',
    plateNumber: 'ل م ن 456',
    chassisNumber: 'WBAX520210098231',
    currentMileage: 68000,
    technicianId: 'usr-5',
    technicianName: 'خالد حسن',
    status: 'waiting_parts',
    reportedIssues: 'ضعف تبريد المكيف + لمبة المحرك مضاءة',
    checkInDate: '2026-07-22 14:00',
    services: [
      { id: 'wos-5', serviceId: 'srv-1', serviceName: 'فحص كمبيوتر وحساسات', cost: 200, technicianId: 'usr-6', technicianName: 'محمد إبراهيم', status: 'completed' }
    ],
    parts: [],
    laborTotal: 200,
    partsTotal: 0,
    estimatedCost: 2100,
    finalCost: 200,
    createdBy: 'سامر الشامي',
  },
  {
    id: 'JC-2026-086',
    vehicleId: 'veh-4',
    customerId: 'cust-4',
    customerName: 'علي ماهر الإبراهيم',
    vehicleName: 'فورد فوكس 2020',
    plateNumber: 'هـ و ي 789',
    chassisNumber: 'WF0F202039120482',
    currentMileage: 112000,
    technicianId: 'usr-4',
    technicianName: 'أحمد علي',
    status: 'delivered',
    reportedIssues: 'تغيير طقم بواجي + تنظيف بخاخات',
    checkInDate: '2026-07-21 08:30',
    completionDate: '2026-07-21 15:00',
    services: [
      { id: 'wos-6', serviceId: 'srv-5', serviceName: 'تنظيف بخاخات وطقم بواجي', cost: 250, technicianId: 'usr-4', technicianName: 'أحمد علي', status: 'completed' }
    ],
    parts: [
      { id: 'wop-6', partId: 'prt-5', partName: 'شمعات إشعال بلاتينيوم', partSku: 'SPK-1004', quantity: 4, unitPrice: 80, totalPrice: 320 }
    ],
    laborTotal: 250,
    partsTotal: 320,
    estimatedCost: 570,
    finalCost: 570,
    invoiceId: 'INV-2026-041',
    createdBy: 'سامر الشامي',
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'INV-2026-042',
    workOrderId: 'JC-2026-089',
    customerName: 'أحمد عادل',
    vehicleName: 'تويوتا لاند كروزر 2023 - 1234 أ ب ت',
    plateNumber: '1234 أ ب ت',
    issueDate: '2026-07-23',
    subtotal: 2450,
    discount: 150,
    taxAmount: 0,
    totalAmount: 2300,
    paidAmount: 2300,
    remainingAmount: 0,
    status: 'paid',
    paymentMethod: 'cash',
    cashBox: 'الخزينة الرئيسية',
    itemsSummary: [
      { description: 'تغيير زيت المحرك والفلتر', amount: 250 },
      { description: 'فلتر زيت أصلي', amount: 150 },
      { description: 'صيانة وتغيير قماشات الفرامل', amount: 800 },
      { description: 'أقمشة فرامل أمامية وخلفية', amount: 1250 },
    ]
  },
  {
    id: 'INV-2026-041',
    workOrderId: 'JC-2026-086',
    customerName: 'علي ماهر الإبراهيم',
    vehicleName: 'فورد فوكس 2020 - هـ و ي 789',
    plateNumber: 'هـ و ي 789',
    issueDate: '2026-07-21',
    subtotal: 570,
    discount: 20,
    taxAmount: 0,
    totalAmount: 550,
    paidAmount: 550,
    remainingAmount: 0,
    status: 'paid',
    paymentMethod: 'card',
    cashBox: 'الخزينة الرئيسية',
    itemsSummary: [
      { description: 'تنظيف بخاخات وتغيير بواجي', amount: 250 },
      { description: 'طقم شمعات إشعال (4 قطع)', amount: 320 }
    ]
  },
  {
    id: 'INV-2026-040',
    workOrderId: 'JC-2026-080',
    customerName: 'مريم الكتبي',
    vehicleName: 'مرسيدس C-Class - أ ب ج 123',
    plateNumber: 'أ ب ج 123',
    issueDate: '2026-07-20',
    subtotal: 1800,
    discount: 100,
    taxAmount: 0,
    totalAmount: 1700,
    paidAmount: 1000,
    remainingAmount: 700,
    status: 'partial',
    paymentMethod: 'transfer',
    cashBox: 'الخزينة الرئيسية',
    itemsSummary: [
      { description: 'إصلاح طلمبة المايه وردياتير', amount: 1800 }
    ]
  }
];

export const initialExpenses: Expense[] = [
  { id: 'EXP-1023', category: 'إيجار', amount: 3000, expenseDate: '2026-07-25', description: 'إيجار الورشة شهر يوليو', cashBox: 'الخزينة الرئيسية', paidBy: 'محمود عبد السلام' },
  { id: 'EXP-1022', category: 'قطع غيار', amount: 1500, expenseDate: '2026-07-24', description: 'شراء زيت وفلاتر من التوريدات', cashBox: 'خزينة المشتريات', paidBy: 'محمود عبد السلام' },
  { id: 'EXP-1021', category: 'رواتب', amount: 500, expenseDate: '2026-07-23', description: 'سلفة راتب - أحمد علي', cashBox: 'الخزينة الرئيسية', paidBy: 'المهندس طارق العلي' },
  { id: 'EXP-1020', category: 'فواتير خدمات', amount: 850, expenseDate: '2026-07-23', description: 'فاتورة الكهرباء والماء', cashBox: 'الخزينة الرئيسية', paidBy: 'محمود عبد السلام' },
  { id: 'EXP-1019', category: 'صيانة دورية', amount: 250, expenseDate: '2026-07-22', description: 'إصلاح رافعة هيدروليك الورشة', cashBox: 'خزينة الورشة', paidBy: 'المهندس طارق العلي' },
];

export const initialSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'شركة الخليج لقطع الغيار', phone: '043998877', email: 'sales@gulfparts.com', address: 'دبي - المنطقة الصناعية 3', totalOrders: 18 },
  { id: 'sup-2', name: 'مؤسسة الأمل للتوريدات الذكية', phone: '042223344', email: 'orders@alamal-parts.ae', address: 'الشارقة - الصجعة الصناعية', totalOrders: 12 },
  { id: 'sup-3', name: 'مركز الألمانية المباشر لقطع السيارات', phone: '045556677', email: 'german.direct@autoparts.com', address: 'أبوظبي - المصفح M12', totalOrders: 7 },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-2026-012',
    supplierId: 'sup-1',
    supplierName: 'شركة الخليج لقطع الغيار',
    orderDate: '2026-07-20',
    status: 'pending',
    totalAmount: 1800,
    items: [
      { partId: 'prt-1', partName: 'فحامات فرامل أمامية (سفايف)', quantity: 10, unitCost: 90, totalCost: 900 },
      { partId: 'prt-5', partName: 'شمعات إشعال بلاتينيوم (بواجي)', quantity: 20, unitCost: 45, totalCost: 900 }
    ]
  },
  {
    id: 'PO-2026-011',
    supplierId: 'sup-2',
    supplierName: 'مؤسسة الأمل للتوريدات الذكية',
    orderDate: '2026-07-15',
    status: 'received',
    receivedDate: '2026-07-17',
    totalAmount: 2100,
    items: [
      { partId: 'prt-4', partName: 'بطارية سيارة 12 فولت 70 أمبير', quantity: 6, unitCost: 350, totalCost: 2100 }
    ]
  }
];

export const initialCashBoxes: CashBox[] = [
  { id: 'cb-1', name: 'الخزينة الرئيسية', balance: 45200 },
  { id: 'cb-2', name: 'خزينة المشتريات', balance: 12500 },
  { id: 'cb-3', name: 'خزينة الورشة الفرعية', balance: 3400 },
];

export const initialSettings: WorkshopSettings = {
  name: 'Car Service Zone',
  tagline: 'الرائدة في الصيانة الميكانيكية والفحص بالكمبيوتر',
  phone: '+971 4 333 8899',
  email: 'info@carservicezone.com',
  address: 'دبي - القوز الصناعية 4 - شارع 18',
  vatNumber: '300987654300003',
  vatPercentage: 0, // Disabled or 5% or 15% easily toggled in settings
  currency: 'ج.م',
  invoicePrefix: 'INV-2026-',
  workOrderPrefix: 'JC-2026-',
  footerNote: 'شكراً لتعاملكم معنا. ضمان الصيانة 30 يوماً من تاريخ التسليم.',
  logoUrl: '/src/assets/images/car_service_zone_logo_1784844176778.jpg',
};

export const initialNotifications: NotificationItem[] = [
  { id: 'not-1', title: 'تنبيه مخزون منخفض', message: 'شمعات إشعال بلاتينيوم (بواجي) نفذت بالكامل من المخزون!', type: 'stock', date: 'منذ 10 دقائق', isRead: false },
  { id: 'not-2', title: 'كارت صيانة جاهز', message: 'أمر الشغل JC-2026-088 (تويوتا لاند كروزر) جاهز للتسليم الآن.', type: 'workorder', date: 'منذ ساعتين', isRead: false },
  { id: 'not-3', title: 'تحصيل فاتورة', message: 'تم تحصيل المبلغ الإجمالي للفاتورة INV-2026-042 بقيمة 2,300 د.إ.', type: 'invoice', date: 'منذ 4 ساعات', isRead: true },
];

export const initialActivityLogs: ActivityLog[] = [
  { id: 'log-1', userName: 'سامر الشامي', action: 'إنشاء كارت صيانة', details: 'تم إنشاء كارت صيانة جديد JC-2026-089 للعميل أحمد عادل', timestamp: '2026-07-23 09:15' },
  { id: 'log-2', userName: 'خالد حسن', action: 'تحديث حالة خدمة', details: 'تحديث خدمة خرط الطنابير إلى "جاري العمل"', timestamp: '2026-07-23 10:30' },
  { id: 'log-3', userName: 'محمود عبد السلام', action: 'تسجيل دفعة فاتورة', details: 'تسجيل دفعة بقيمة 2300 د.إ للفاتورة INV-2026-042', timestamp: '2026-07-23 11:45' },
];
