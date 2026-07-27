import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, User, WorkOrder, WorkOrderStatus, Customer, Vehicle, 
  Part, Supplier, PurchaseOrder, Invoice, Expense, CashBox, 
  WorkshopSettings, NotificationItem, ActivityLog, WorkOrderService, 
  WorkOrderPart, PaymentMethod
} from '../types';
import { 
  initialUsers, initialCustomers, initialVehicles, initialParts, 
  initialWorkOrders, initialInvoices, initialExpenses, initialSuppliers, 
  initialPurchaseOrders, initialCashBoxes, initialSettings, 
  initialNotifications, initialActivityLogs 
} from '../data/mockData';

interface WorkshopContextType {
  // Roles & User
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeUserName: string;
  themeMode: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Settings
  settings: WorkshopSettings;
  updateSettings: (newSettings: Partial<WorkshopSettings>) => void;
  
  // Entities
  customers: Customer[];
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  parts: Part[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  expenses: Expense[];
  cashBoxes: CashBox[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
  
  // Work Order Actions
  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'laborTotal' | 'partsTotal' | 'finalCost' | 'createdBy'>) => WorkOrder;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;
  addServiceToWorkOrder: (workOrderId: string, service: Omit<WorkOrderService, 'id'>) => void;
  removeServiceFromWorkOrder: (workOrderId: string, serviceId: string) => void;
  addPartToWorkOrder: (workOrderId: string, partId: string, qty: number) => void;
  removePartFromWorkOrder: (workOrderId: string, workOrderPartId: string) => void;
  convertWorkOrderToInvoice: (workOrderId: string, discount?: number) => Invoice | null;
  
  // Customer & Vehicle Actions
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addVehicle: (veh: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  // Work Order Actions
  deleteWorkOrder: (id: string) => void;

  // Inventory Actions
  addPart: (part: Omit<Part, 'id' | 'status'>) => void;
  updatePart: (id: string, updates: Partial<Part>) => void;
  deletePart: (id: string) => void;
  adjustPartStock: (id: string, newQty: number, reason: string) => void;
  
  // Supplier & PO Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalOrders'>) => void;
  deleteSupplier: (id: string) => void;
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'status'>) => void;
  receivePurchaseOrder: (poId: string) => void;
  
  // Invoices & Payments
  recordPayment: (invoiceId: string, amount: number, method: PaymentMethod, cashBoxName: string) => void;
  deleteInvoice: (id: string) => void;
  
  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'paidBy'>) => void;
  deleteExpense: (id: string) => void;
  
  // Users / Technicians
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Notifications & Log
  markAllNotificationsRead: () => void;
  resetAllData: () => void;
  clearAllDemoData: () => void;
  exportDatabase: () => void;
  importDatabase: (jsonData: any) => boolean;
}

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

export const WorkshopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [settings, setSettings] = useState<WorkshopSettings>(() => {
    const saved = localStorage.getItem('csz_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.currency = 'ج.م';
      parsed.name = parsed.name || 'Car Service Zone';
      parsed.logoUrl = parsed.logoUrl !== undefined ? parsed.logoUrl : '/src/assets/images/car_service_zone_logo_1784844176778.jpg';
      return parsed;
    }
    return initialSettings;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('csz_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('csz_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('csz_work_orders');
    return saved ? JSON.parse(saved) : initialWorkOrders;
  });

  const [parts, setParts] = useState<Part[]>(() => {
    const saved = localStorage.getItem('csz_parts');
    return saved ? JSON.parse(saved) : initialParts;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('csz_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('csz_purchase_orders');
    return saved ? JSON.parse(saved) : initialPurchaseOrders;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('csz_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('csz_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [cashBoxes, setCashBoxes] = useState<CashBox[]>(() => {
    const saved = localStorage.getItem('csz_cash_boxes');
    return saved ? JSON.parse(saved) : initialCashBoxes;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('csz_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // Persistence
  useEffect(() => { localStorage.setItem('csz_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('csz_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('csz_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('csz_work_orders', JSON.stringify(workOrders)); }, [workOrders]);
  useEffect(() => { localStorage.setItem('csz_parts', JSON.stringify(parts)); }, [parts]);
  useEffect(() => { localStorage.setItem('csz_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('csz_purchase_orders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('csz_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('csz_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('csz_users', JSON.stringify(users)); }, [users]);

  const activeUserName = 'المهندس طارق العلي (المالك)';

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addLog = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userName: activeUserName.split(' ')[0],
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const updateSettings = (newSettings: Partial<WorkshopSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addLog('تحديث الإعدادات', 'تم تعديل بيانات الورشة أو إعدادات الضريبة');
  };

  // Helper to re-calculate parts stock status
  const recalculateStockStatus = (qty: number, reorder: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (qty <= 0) return 'out_of_stock';
    if (qty <= reorder) return 'low_stock';
    return 'in_stock';
  };

  // Work Orders logic
  const addWorkOrder = (orderData: Omit<WorkOrder, 'id' | 'laborTotal' | 'partsTotal' | 'finalCost' | 'createdBy'>) => {
    const nextIdNumber = workOrders.length + 90;
    const newId = `${settings.workOrderPrefix}${String(nextIdNumber).padStart(3, '0')}`;
    
    // Auto-resolve vehicle & customer info to avoid undefined fields
    const customer = customers.find(c => c.id === orderData.customerId);
    const vehicle = vehicles.find(v => v.id === orderData.vehicleId);
    
    const customerName = customer ? customer.name : '';
    const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : '';
    const plateNumber = vehicle ? vehicle.plateNumber : '';
    const chassisNumber = vehicle ? vehicle.chassisNumber : '';
    
    const services = orderData.services || [];
    const parts = orderData.parts || [];
    const status = orderData.status || 'in_progress';
    const checkInDate = orderData.checkInDate || new Date().toISOString().substring(0, 10);
    const estimatedCost = orderData.estimatedCost || 0;
    
    const techUser = users.find(u => u.name === orderData.technicianName);
    const technicianId = techUser ? techUser.id : (orderData.technicianId || 'usr-4');

    const laborTotal = services.reduce((sum, s) => sum + (s.cost || 0), 0);
    const partsTotal = parts.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
    const finalCost = laborTotal + partsTotal;

    const newOrder: WorkOrder = {
      ...orderData,
      id: newId,
      customerName,
      vehicleName,
      plateNumber,
      chassisNumber,
      services,
      parts,
      status,
      checkInDate,
      estimatedCost,
      technicianId,
      laborTotal,
      partsTotal,
      finalCost,
      createdBy: activeUserName.split(' ')[0]
    };

    setWorkOrders(prev => [newOrder, ...prev]);
    addLog('إنشاء كارت صيانة', `تم إنشاء كارت الصيانة ${newId} للسيارة ${vehicleName}`);
    
    return newOrder;
  };

  // Users & Technicians actions
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
    addLog('إضافة موظف/فني', `تم إضافة الفني/الموظف الجديد ${newUser.name}`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    addLog('تعديل موظف/فني', `تم تحديث بيانات الفني/الموظف`);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    addLog('حذف موظف/فني', `تم حذف الفني/الموظف من النظام`);
  };

  const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id !== id) return wo;
      const updated = { ...wo, ...updates };
      const laborTotal = updated.services?.reduce((sum, s) => sum + (s.cost || 0), 0) || 0;
      const partsTotal = updated.parts?.reduce((sum, p) => sum + (p.totalPrice || 0), 0) || 0;
      return {
        ...updated,
        laborTotal,
        partsTotal,
        finalCost: laborTotal + partsTotal
      };
    }));
    addLog('تعديل كارت صيانة', `تعديل بيانات الكارت ${id}`);
  };

  const updateWorkOrderStatus = (id: string, status: WorkOrderStatus) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id !== id) return wo;
      const completionDate = (status === 'ready' || status === 'delivered') ? new Date().toISOString().substring(0, 10) : wo.completionDate;
      return { ...wo, status, completionDate };
    }));

    // Generate notification if ready
    if (status === 'ready') {
      const wo = workOrders.find(w => w.id === id);
      if (wo) {
        setNotifications(prev => [{
          id: `not-${Date.now()}`,
          title: 'كارت صيانة جاهز',
          message: `أمر الشغل ${id} (${wo.vehicleName}) جاهز للتسليم للعميل.`,
          type: 'workorder',
          date: 'الآن',
          isRead: false
        }, ...prev]);
      }
    }

    // Auto-generate invoice
    if (status === 'ready' || status === 'delivered') {
      const wo = workOrders.find(w => w.id === id);
      if (wo && !wo.invoiceId && wo.finalCost > 0) {
        setTimeout(() => convertWorkOrderToInvoice(id), 0);
      }
    }

    addLog('تغيير حالة كارت صيانة', `تغيير حالة الكارت ${id} إلى ${status}`);
  };

  const addServiceToWorkOrder = (workOrderId: string, service: Omit<WorkOrderService, 'id'>) => {
    const newService: WorkOrderService = {
      ...service,
      id: `wos-${Date.now()}`
    };
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id !== workOrderId) return wo;
      const services = [...wo.services, newService];
      const laborTotal = services.reduce((s, x) => s + x.cost, 0);
      return {
        ...wo,
        services,
        laborTotal,
        finalCost: laborTotal + wo.partsTotal
      };
    }));
  };

  const removeServiceFromWorkOrder = (workOrderId: string, serviceId: string) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id !== workOrderId) return wo;
      const services = wo.services.filter(s => s.id !== serviceId);
      const laborTotal = services.reduce((s, x) => s + x.cost, 0);
      return {
        ...wo,
        services,
        laborTotal,
        finalCost: laborTotal + wo.partsTotal
      };
    }));
  };

  const addPartToWorkOrder = (workOrderId: string, partId: string, qty: number) => {
    const targetPart = parts.find(p => p.id === partId);
    if (!targetPart) return;

    if (targetPart.quantityInStock < qty) {
      alert(`الكمية المتاحة بالمخزون (${targetPart.quantityInStock}) أقل من المطلوب (${qty})`);
      return;
    }

    const newWop: WorkOrderPart = {
      id: `wop-${Date.now()}`,
      partId: targetPart.id,
      partName: targetPart.name,
      partSku: targetPart.sku,
      quantity: qty,
      unitPrice: targetPart.salePrice,
      totalPrice: targetPart.salePrice * qty
    };

    // Deduct stock automatically according to Business Logic Rule #2
    setParts(prev => prev.map(p => {
      if (p.id !== partId) return p;
      const newQty = p.quantityInStock - qty;
      return {
        ...p,
        quantityInStock: newQty,
        status: recalculateStockStatus(newQty, p.reorderLevel)
      };
    }));

    setWorkOrders(prev => prev.map(wo => {
      if (wo.id !== workOrderId) return wo;
      const woParts = [...wo.parts, newWop];
      const partsTotal = woParts.reduce((s, x) => s + x.totalPrice, 0);
      return {
        ...wo,
        parts: woParts,
        partsTotal,
        finalCost: wo.laborTotal + partsTotal
      };
    }));

    addLog('صرف قطعة غيار', `صرف ${qty} من ${targetPart.name} لأمر الشغل ${workOrderId}`);
  };

  const removePartFromWorkOrder = (workOrderId: string, workOrderPartId: string) => {
    const targetWo = workOrders.find(w => w.id === workOrderId);
    if (!targetWo) return;
    const targetWop = targetWo.parts.find(p => p.id === workOrderPartId);
    if (!targetWop) return;

    // Return stock
    setParts(prev => prev.map(p => {
      if (p.id !== targetWop.partId) return p;
      const newQty = p.quantityInStock + targetWop.quantity;
      return {
        ...p,
        quantityInStock: newQty,
        status: recalculateStockStatus(newQty, p.reorderLevel)
      };
    }));

    setWorkOrders(prev => prev.map(wo => {
      if (wo.id !== workOrderId) return wo;
      const woParts = wo.parts.filter(p => p.id !== workOrderPartId);
      const partsTotal = woParts.reduce((s, x) => s + x.totalPrice, 0);
      return {
        ...wo,
        parts: woParts,
        partsTotal,
        finalCost: wo.laborTotal + partsTotal
      };
    }));
  };

  // Convert Work Order to Invoice
  const convertWorkOrderToInvoice = (workOrderId: string, discount = 0): Invoice | null => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (!wo) return null;

    if (wo.invoiceId) {
      const existing = invoices.find(i => i.id === wo.invoiceId);
      if (existing) return existing;
    }

    const nextInvNo = invoices.length + 43;
    const invId = `${settings.invoicePrefix}${String(nextInvNo).padStart(3, '0')}`;
    const subtotal = wo.finalCost;
    const taxAmount = (subtotal - discount) * (settings.vatPercentage / 100);
    const totalAmount = (subtotal - discount) + taxAmount;

    const itemsSummary = [
      ...wo.services.map(s => ({ description: s.serviceName, amount: s.cost })),
      ...wo.parts.map(p => ({ description: `${p.partName} (${p.quantity} قطعة)`, amount: p.totalPrice }))
    ];

    const newInvoice: Invoice = {
      id: invId,
      workOrderId: wo.id,
      customerName: wo.customerName,
      vehicleName: `${wo.vehicleName} - ${wo.plateNumber}`,
      plateNumber: wo.plateNumber,
      issueDate: new Date().toISOString().substring(0, 10),
      subtotal,
      discount,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      status: 'unpaid',
      itemsSummary
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Link invoice to work order
    updateWorkOrder(workOrderId, { invoiceId: invId });

    addLog('توليد فاتورة', `تم إصدار الفاتورة ${invId} لكارت الصيانة ${workOrderId}`);
    return newInvoice;
  };

  // Customer & Vehicle
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setCustomers(prev => [newCustomer, ...prev]);
    addLog('إضافة عميل', `إضافة العميل الجديد: ${newCustomer.name}`);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    addLog('حذف عميل', `تم حذف العميل ${cust?.name || id}`);
  };

  const addVehicle = (vehData: Omit<Vehicle, 'id'>) => {
    const newVeh: Vehicle = {
      ...vehData,
      id: `veh-${Date.now()}`
    };
    setVehicles(prev => [newVeh, ...prev]);
    addLog('إضافة مركبة', `إضافة السيارة ${newVeh.make} ${newVeh.model} (${newVeh.plateNumber})`);
    return newVeh;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVehicle = (id: string) => {
    const veh = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    addLog('حذف مركبة', `تم حذف المركبة ${veh?.make} ${veh?.model} (${veh?.plateNumber || id})`);
  };

  const deleteWorkOrder = (id: string) => {
    const targetWo = workOrders.find(w => w.id === id);
    if (targetWo && targetWo.parts && targetWo.parts.length > 0) {
      // Return parts to stock
      setParts(prevParts => prevParts.map(p => {
        const consumedPart = targetWo.parts.find(wop => wop.partId === p.id);
        if (!consumedPart) return p;
        const newQty = p.quantityInStock + consumedPart.quantity;
        return {
          ...p,
          quantityInStock: newQty,
          status: recalculateStockStatus(newQty, p.reorderLevel)
        };
      }));
    }

    setWorkOrders(prev => prev.filter(w => w.id !== id));
    addLog('حذف كارت شغل', `تم حذف كارت الصيانة ${id}`);
  };

  // Inventory
  const addPart = (partData: Omit<Part, 'id' | 'status'>) => {
    const newPart: Part = {
      ...partData,
      id: `prt-${Date.now()}`,
      status: recalculateStockStatus(partData.quantityInStock, partData.reorderLevel)
    };
    setParts(prev => [newPart, ...prev]);
    addLog('إضافة قطعة غيار', `إضافة الصنف: ${newPart.name} (${newPart.sku})`);
  };

  const updatePart = (id: string, updates: Partial<Part>) => {
    setParts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates };
      return {
        ...updated,
        status: recalculateStockStatus(updated.quantityInStock, updated.reorderLevel)
      };
    }));
  };

  const deletePart = (id: string) => {
    const target = parts.find(p => p.id === id);
    setParts(prev => prev.filter(p => p.id !== id));
    addLog('حذف صنف مخزون', `حذف الصنف ${target?.name || id}`);
  };

  const adjustPartStock = (id: string, newQty: number, reason: string) => {
    setParts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        quantityInStock: newQty,
        status: recalculateStockStatus(newQty, p.reorderLevel)
      };
    }));
    addLog('تعديل مخزون', `تعديل رصيد ${id} إلى ${newQty} - السبب: ${reason}`);
  };

  // Supplier & PO
  const addSupplier = (sData: Omit<Supplier, 'id' | 'totalOrders'>) => {
    const newSup: Supplier = {
      ...sData,
      id: `sup-${Date.now()}`,
      totalOrders: 0
    };
    setSuppliers(prev => [newSup, ...prev]);
  };

  const deleteSupplier = (id: string) => {
    const s = suppliers.find(sup => sup.id === id);
    setSuppliers(prev => prev.filter(sup => sup.id !== id));
    addLog('حذف مورد', `تم حذف المورد ${s?.name || id}`);
  };

  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'status'>) => {
    const poId = `PO-2026-${String(purchaseOrders.length + 13).padStart(3, '0')}`;
    const newPo: PurchaseOrder = {
      ...poData,
      id: poId,
      status: 'pending'
    };
    setPurchaseOrders(prev => [newPo, ...prev]);

    // Update supplier order count
    setSuppliers(prev => prev.map(s => s.id === poData.supplierId ? { ...s, totalOrders: s.totalOrders + 1 } : s));

    addLog('إنشاء أمر شراء', `إنشاء أمر شراء جديد ${poId} للمورد ${poData.supplierName}`);
  };

  const receivePurchaseOrder = (poId: string) => {
    const targetPo = purchaseOrders.find(p => p.id === poId);
    if (!targetPo || targetPo.status === 'received') return;

    // Automatically increase inventory stock for items according to Business Logic Rule #3
    setParts(prev => prev.map(p => {
      const item = targetPo.items.find(i => i.partId === p.id);
      if (!item) return p;
      const newQty = p.quantityInStock + item.quantity;
      return {
        ...p,
        quantityInStock: newQty,
        status: recalculateStockStatus(newQty, p.reorderLevel)
      };
    }));

    setPurchaseOrders(prev => prev.map(p => {
      if (p.id !== poId) return p;
      return {
        ...p,
        status: 'received',
        receivedDate: new Date().toISOString().substring(0, 10)
      };
    }));

    addLog('استلام أمر شراء', `استلام بضاعة أمر الشراء ${poId} وتم تحديث رصيد المخزون تلقائياً`);
  };

  // Payment Recording
  const recordPayment = (invoiceId: string, amount: number, method: PaymentMethod, cashBoxName: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPaid = inv.paidAmount + amount;
      const remainingAmount = Math.max(0, inv.totalAmount - newPaid);
      const status: 'paid' | 'partial' | 'unpaid' = remainingAmount === 0 ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid');
      return {
        ...inv,
        paidAmount: newPaid,
        remainingAmount,
        status,
        paymentMethod: method,
        cashBox: cashBoxName
      };
    }));

    // Update cash box balance
    setCashBoxes(prev => prev.map(cb => cb.name === cashBoxName ? { ...cb, balance: cb.balance + amount } : cb));

    addLog('تحصيل مبلغ', `تحصيل ${amount} ${settings.currency} للفاتورة ${invoiceId} عبر ${method}`);
  };

  const deleteInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv && inv.paidAmount > 0 && inv.cashBox) {
      setCashBoxes(prev => prev.map(cb => cb.name === inv.cashBox ? { ...cb, balance: Math.max(0, cb.balance - inv.paidAmount) } : cb));
    }
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    addLog('حذف فاتورة', `تم حذف الفاتورة ${id}`);
  };

  // Expenses
  const addExpense = (expData: Omit<Expense, 'id' | 'paidBy'>) => {
    const expId = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newExp: Expense = {
      ...expData,
      id: expId,
      paidBy: activeUserName.split(' ')[0]
    };
    setExpenses(prev => [newExp, ...prev]);

    // Deduct cash box balance
    setCashBoxes(prev => prev.map(cb => cb.name === expData.cashBox ? { ...cb, balance: Math.max(0, cb.balance - expData.amount) } : cb));

    addLog('تسجيل مصروف', `تسجيل مصروف ${expData.category}: ${expData.amount} ${settings.currency}`);
  };

  const deleteExpense = (id: string) => {
    const exp = expenses.find(e => e.id === id);
    if (exp) {
      setCashBoxes(prev => prev.map(cb => cb.name === exp.cashBox ? { ...cb, balance: cb.balance + exp.amount } : cb));
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
    addLog('حذف مصروف', `حذف المصروف ${id}`);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const resetAllData = () => {
    setCustomers(initialCustomers);
    setVehicles(initialVehicles);
    setWorkOrders(initialWorkOrders);
    setParts(initialParts);
    setSuppliers(initialSuppliers);
    setPurchaseOrders(initialPurchaseOrders);
    setInvoices(initialInvoices);
    setExpenses(initialExpenses);
    setCashBoxes(initialCashBoxes);
    setSettings(initialSettings);
    localStorage.clear();
    addLog('إعادة ضبط البيانات', 'تمت استعادة كافة البيانات الافتراضية للورشة');
  };

  const clearAllDemoData = () => {
    setCustomers([]);
    setVehicles([]);
    setWorkOrders([]);
    setParts([]);
    setSuppliers([]);
    setPurchaseOrders([]);
    setInvoices([]);
    setExpenses([]);
    const defaultOwner: User[] = [
      { id: 'usr-1', name: 'المهندس (مالك الورشة)', username: 'admin', role: 'owner', phone: settings.phone || '01000000000', isActive: true }
    ];
    setUsers(defaultOwner);
    const freshBoxes: CashBox[] = [
      { id: 'cb-1', name: 'الخزينة الرئيسية', balance: 0 },
      { id: 'cb-2', name: 'الحساب البنكي / شبكة', balance: 0 }
    ];
    setCashBoxes(freshBoxes);
    setNotifications([]);
    setActivityLogs([
      { id: `log-${Date.now()}`, userName: 'مالك الورشة', action: 'تصفير النظام بالكامل', details: 'تم مسح كافة البيانات التجريبية، الفنيين، العملاء، الفواتير، والعمليات لبدء التشغيل الحقيقي', timestamp: new Date().toLocaleString('ar-EG') }
    ]);
    localStorage.setItem('csz_customers', JSON.stringify([]));
    localStorage.setItem('csz_vehicles', JSON.stringify([]));
    localStorage.setItem('csz_work_orders', JSON.stringify([]));
    localStorage.setItem('csz_parts', JSON.stringify([]));
    localStorage.setItem('csz_suppliers', JSON.stringify([]));
    localStorage.setItem('csz_purchase_orders', JSON.stringify([]));
    localStorage.setItem('csz_invoices', JSON.stringify([]));
    localStorage.setItem('csz_expenses', JSON.stringify([]));
    localStorage.setItem('csz_users', JSON.stringify(defaultOwner));
    localStorage.setItem('csz_cash_boxes', JSON.stringify(freshBoxes));
  };

  const exportDatabase = () => {
    const backupData = {
      appName: 'CSZ Auto Workshop System',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      customers,
      vehicles,
      workOrders,
      parts,
      suppliers,
      purchaseOrders,
      invoices,
      expenses,
      cashBoxes,
      activityLogs
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const dateStr = new Date().toISOString().substring(0, 10);
    const timeStr = new Date().toTimeString().substring(0, 5).replace(':', '-');
    const link = document.createElement('a');
    link.href = url;
    link.download = `workshop_db_backup_${dateStr}_${timeStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addLog('تصدير نسخة احتياطية', 'تم تصدير نسخة احتياطية من قاعدة البيانات بصيغة JSON');
  };

  const importDatabase = (jsonData: any) => {
    try {
      if (jsonData.settings) setSettings(jsonData.settings);
      if (Array.isArray(jsonData.customers)) setCustomers(jsonData.customers);
      if (Array.isArray(jsonData.vehicles)) setVehicles(jsonData.vehicles);
      if (Array.isArray(jsonData.workOrders)) setWorkOrders(jsonData.workOrders);
      if (Array.isArray(jsonData.parts)) setParts(jsonData.parts);
      if (Array.isArray(jsonData.suppliers)) setSuppliers(jsonData.suppliers);
      if (Array.isArray(jsonData.purchaseOrders)) setPurchaseOrders(jsonData.purchaseOrders);
      if (Array.isArray(jsonData.invoices)) setInvoices(jsonData.invoices);
      if (Array.isArray(jsonData.expenses)) setExpenses(jsonData.expenses);
      if (Array.isArray(jsonData.cashBoxes)) setCashBoxes(jsonData.cashBoxes);
      addLog('استعادة نسخة احتياطية', 'تم استيراد نسخة احتياطية لقاعدة البيانات بنجاح');
      return true;
    } catch (err) {
      console.error('Failed to import database:', err);
      return false;
    }
  };

  return (
    <WorkshopContext.Provider value={{
      currentRole, setCurrentRole, activeUserName, themeMode, toggleTheme,
      settings, updateSettings,
      customers, vehicles, workOrders, parts, suppliers, purchaseOrders, invoices, expenses, cashBoxes, notifications, activityLogs,
      users, addUser, updateUser, deleteUser,
      addWorkOrder, updateWorkOrder, updateWorkOrderStatus, addServiceToWorkOrder, removeServiceFromWorkOrder, addPartToWorkOrder, removePartFromWorkOrder, convertWorkOrderToInvoice,
      addCustomer, updateCustomer, deleteCustomer, addVehicle, updateVehicle, deleteVehicle,
      deleteWorkOrder,
      addPart, updatePart, deletePart, adjustPartStock,
      addSupplier, deleteSupplier, addPurchaseOrder, receivePurchaseOrder,
      recordPayment, deleteInvoice,
      addExpense, deleteExpense,
      markAllNotificationsRead, resetAllData, clearAllDemoData, exportDatabase, importDatabase
    }}>
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error('useWorkshop must be used within a WorkshopProvider');
  }
  return context;
};
