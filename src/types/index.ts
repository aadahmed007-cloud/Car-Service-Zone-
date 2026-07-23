export type UserRole = 'owner';

export type WorkOrderStatus = 
  | 'pending'         // قيد الانتظار
  | 'in_progress'     // جاري الصيانة
  | 'waiting_parts'   // بانتظار قطع الغيار
  | 'ready'           // جاهز للتسليم
  | 'delivered'       // تم التسليم والفوترة
  | 'cancelled';      // ملغي

export type InvoiceStatus = 'unpaid' | 'partial' | 'paid';

export type PaymentMethod = 'cash' | 'card' | 'transfer';

export type ExpenseCategory = 'إيجار' | 'قطع غيار' | 'رواتب' | 'فواتير خدمات' | 'صيانة دورية' | 'نثريات';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  customerName: string;
  plateNumber: string; // e.g. "أ ب ج 1234" or "دبي 12345 G"
  make: string;        // e.g. "تويوتا"
  model: string;       // e.g. "لاند كروزر"
  year: number;
  chassisNumber: string; // VIN
  color: string;
  currentMileage: number;
}

export interface WorkOrderService {
  id: string;
  serviceId: string;
  serviceName: string;
  cost: number;
  technicianId: string;
  technicianName: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface WorkOrderPart {
  id: string;
  partId: string;
  partName: string;
  partSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface WorkOrder {
  id: string; // e.g., "JC-2026-089"
  vehicleId: string;
  customerId: string;
  customerName: string;
  vehicleName: string; // "تويوتا لاند كروزر 2023"
  plateNumber: string;
  chassisNumber: string;
  currentMileage: number;
  technicianId: string;
  technicianName: string;
  status: WorkOrderStatus;
  reportedIssues: string;
  inspectionNotes?: string;
  checkInDate: string;
  estimatedCompletionDate?: string;
  completionDate?: string;
  services: WorkOrderService[];
  parts: WorkOrderPart[];
  laborTotal: number;
  partsTotal: number;
  estimatedCost: number;
  finalCost: number;
  invoiceId?: string;
  createdBy: string;
}

export interface Part {
  id: string;
  sku: string;         // e.g. "BRK-1023", "FIL-5501"
  name: string;        // e.g. "فحامات فرامل أمامية", "فلتر زيت محرك"
  category: string;    // e.g. "نظام الفرامل", "محرك/فلاتر", "كهربائي"
  quantityInStock: number;
  reorderLevel: number;
  purchasePrice: number;
  salePrice: number;
  supplierId?: string;
  supplierName?: string;
  status: StockStatus;
}

export interface StockMovement {
  id: string;
  partId: string;
  partName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string; // e.g. "صرف لأمر شغل JC-2026-089", "استلام أمر شراء PO-102"
  date: string;
  performedBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
}

export interface PurchaseOrderItem {
  partId: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string; // e.g., "PO-2026-012"
  supplierId: string;
  supplierName: string;
  orderDate: string;
  status: 'pending' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  receivedDate?: string;
}

export interface Invoice {
  id: string; // e.g. "INV-2026-042"
  workOrderId: string;
  customerName: string;
  vehicleName: string;
  plateNumber: string;
  issueDate: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  cashBox?: string;
  itemsSummary: Array<{ description: string; amount: number }>;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  cashBox: string;
  receivedBy: string;
}

export interface Expense {
  id: string; // e.g. "EXP-1023"
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description: string;
  cashBox: string; // "الخزينة الرئيسية", "خزينة المشتريات"
  paidBy: string;
}

export interface CashBox {
  id: string;
  name: string;
  balance: number;
}

export interface WorkshopSettings {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  vatNumber: string;
  vatPercentage: number;
  currency: string; // "ر.س" | "د.إ" | "ج.م" | "$"
  invoicePrefix: string;
  workOrderPrefix: string;
  footerNote: string;
  logoUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'stock' | 'invoice' | 'workorder' | 'info';
  date: string;
  isRead: boolean;
}

export interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
