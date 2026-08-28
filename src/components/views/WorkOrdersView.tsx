import React, { useState } from 'react';
import { 
  Wrench, Plus, Search, Filter, CheckCircle2, Clock, AlertCircle, 
  ChevronLeft, Printer, ArrowRight, UserCheck, Shield, FileText, 
  Car, Trash2, Edit, Save, PlusCircle, Receipt, Bell, Sparkles, Lock
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { WorkOrder, WorkOrderStatus, WorkOrderService, WorkOrderPart } from '../../types';
import { ConfirmModal } from '../modals/ConfirmModal';

interface WorkOrdersViewProps {
  selectedWorkOrderId: string | null;
  onSelectWorkOrder: (id: string | null) => void;
  onOpenNewWorkOrder: () => void;
  onOpenInvoiceModal: (workOrderId: string) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  selectedWorkOrderId,
  onSelectWorkOrder,
  onOpenNewWorkOrder,
  onOpenInvoiceModal
}) => {
  const { 
    workOrders, deleteWorkOrder, updateWorkOrderStatus, addServiceToWorkOrder, 
    removeServiceFromWorkOrder, addPartToWorkOrder, removePartFromWorkOrder,
    convertWorkOrderToInvoice, parts, invoices, settings, currentRole, users 
  } = useWorkshop();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteWorkOrderClick = (e: React.MouseEvent, woId: string, custName: string) => {
    e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: `حذف كارت الصيانة: ${woId}`,
      message: `هل أنت تأكد من رغبتك في حذف أمر الشغل رقم (${woId}) للعميل (${custName})؟ سيتم حذف جميع الفحوصات والخدمات والقطع المرفقة بالكارت.`,
      confirmText: 'تأكيد الحذف',
      cancelText: 'إلغاء',
      variant: 'danger',
      onConfirm: () => {
        deleteWorkOrder(woId);
        if (selectedWorkOrderId === woId) {
          onSelectWorkOrder(null);
        }
        showToast(`تم حذف أمر الشغل (${woId}) بنجاح.`);
      }
    });
  };

  const handlePrintWorkOrder = () => {
    if (!selectedOrder) return;
    window.print();
    if (selectedOrder.status !== 'delivered') {
      setTimeout(() => {
        setConfirmConfig({
          isOpen: true,
          title: 'تأكيد قفل كارت الصيانة وتسليم السيارة',
          message: `تمت طباعة كارت الصيانة (${selectedOrder.id}) لسيارة العميل (${selectedOrder.customerName} - ${selectedOrder.plateNumber}). هل ترغب في إنهاء الصيانة وقفل أمر الشغل وتأكيد تسليم السيارة للعميل الآن؟`,
          confirmText: 'نعم، إغلاق الصيانة والتسليم',
          cancelText: 'إبقاء أمر الشغل مفتوحاً',
          variant: 'success',
          onConfirm: () => {
            updateWorkOrderStatus(selectedOrder.id, 'delivered');
            showToast(`تم قفل كارت الصيانة (${selectedOrder.id}) وتسليم السيارة للعميل بنجاح.`);
          }
        });
      }, 300);
    }
  };

  // Service & Part additions state inside detail view
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCost, setNewServiceCost] = useState('');
  const [newServiceTech, setNewServiceTech] = useState('محمد إبراهيم');

  const [showAddPartForm, setShowAddPartForm] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);

  // Filtered List
  const filteredOrders = workOrders.filter(wo => {
    const matchesStatus = filterStatus === 'all' || wo.status === filterStatus;
    const matchesSearch = wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          wo.customerName.includes(searchQuery) ||
                          wo.plateNumber.includes(searchQuery) ||
                          wo.vehicleName.includes(searchQuery);
    
    return matchesStatus && matchesSearch;
  });

  const selectedOrder = workOrders.find(w => w.id === selectedWorkOrderId) || null;

  // Check if work order has a fully paid invoice (Lock State)
  const associatedInvoice = selectedOrder 
    ? invoices.find(i => i.workOrderId === selectedOrder.id || i.id === selectedOrder.invoiceId)
    : null;
  const isOrderLocked = associatedInvoice?.status === 'paid';

  // Pipeline Steps (Matching Workshop Stages)
  const pipelineSteps = [
    { key: 'pending', number: 1, label: '1. الاستلام' },
    { key: 'in_progress', number: 2, label: '2. جاري الصيانة' },
    { key: 'waiting_parts', number: 3, label: '3. بانتظار القطع' },
    { key: 'waiting_invoice', number: 4, label: '4. بانتظار الفاتورة' },
    { key: 'ready', number: 5, label: '5. جاهز للتسليم' },
    { key: 'delivered', number: 6, label: '6. تم الفوترة والتسليم' },
  ];

  const getStepIndex = (status: WorkOrderStatus) => {
    switch(status) {
      case 'pending': return 1;
      case 'in_progress': return 2;
      case 'waiting_parts': return 3;
      case 'waiting_invoice': return 4;
      case 'ready': return 5;
      case 'delivered': return 6;
      default: return 1;
    }
  };

  // If a specific work order is selected, render the Detail View (Image #4)
  if (selectedOrder) {
    const currentStep = getStepIndex(selectedOrder.status);

    return (
      <div className="space-y-6 pb-16">
        
        {/* Back Button & Header */}
        <div className="flex items-center justify-between bg-[#0F172A] p-4 rounded-3xl border border-slate-800">
          <button
            onClick={() => onSelectWorkOrder(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-orange-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl cursor-pointer transition-colors"
          >
            <ArrowRight className="w-4 h-4" /> الرجوع لقائمة أوامر الشغل
          </button>

          <div className="text-left">
            <h2 className="text-lg font-extrabold text-white">تفاصيل كارت الصيانة - Car Service Zone</h2>
            <p className="text-xs text-slate-400 font-mono">رقم الكارت: {selectedOrder.id}</p>
          </div>
        </div>

        {/* Work Order Info Header Card (Matching Image #4 Header) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold text-white">كارت الصيانة: {selectedOrder.id}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedOrder.status === 'waiting_invoice'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse'
                    : selectedOrder.status === 'in_progress'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : selectedOrder.status === 'ready'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : selectedOrder.status === 'waiting_parts'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : selectedOrder.status === 'delivered'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {selectedOrder.status === 'waiting_invoice'
                    ? '🔔 بانتظار الفاتورة'
                    : selectedOrder.status === 'in_progress'
                    ? 'جاري العمل'
                    : selectedOrder.status === 'ready'
                    ? 'جاهز للتسليم'
                    : selectedOrder.status === 'waiting_parts'
                    ? 'بانتظار قطع'
                    : selectedOrder.status === 'delivered'
                    ? 'تم الفوترة والتسليم'
                    : 'نشط'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">تاريخ الاستقبال: {selectedOrder.checkInDate}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">العميل:</span>
                <span className="font-bold text-slate-200">{selectedOrder.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">المركبة:</span>
                <span className="font-bold text-slate-200">{selectedOrder.vehicleName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">رقم اللوحة:</span>
                <span className="font-bold text-orange-400">{selectedOrder.plateNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">قراءة العداد:</span>
                <span className="font-bold text-slate-200">{selectedOrder.currentMileage.toLocaleString('ar-EG')} كم</span>
              </div>
            </div>
          </div>

          {/* Alert Notification Banner for waiting_invoice */}
          {selectedOrder.status === 'waiting_invoice' && !isOrderLocked && (
            <div className="bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-indigo-500/10 border border-purple-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-purple-500/5">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs sm:text-sm">تنبيه: كارت الصيانة بانتظار إصدار الفاتورة</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/30 text-purple-300 border border-purple-500/40 animate-pulse">
                      اكتملت البنود
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    تم إدخال كافة قطع الغيار ({selectedOrder.parts.length}) والمصنوعيات ({selectedOrder.services.length}) بنجاح بإجمالي ({selectedOrder.finalCost.toLocaleString('ar-EG')} {settings.currency}). يرجى إصدار الفاتورة وتصفية الحساب للعميل.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenInvoiceModal(selectedOrder.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Receipt className="w-4 h-4" />
                <span>إصدار الفاتورة الآن</span>
              </button>
            </div>
          )}

          {/* Locked Notice Banner for Fully Paid Order */}
          {isOrderLocked && (
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-emerald-950/30">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs sm:text-sm">كارت صيانة مقفل ومسدد بالكامل (للقراءة فقط - Read-Only)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      فاتورة مسددة: {associatedInvoice?.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    تم سداد الفاتورة المرتبطة بالكامل ({associatedInvoice?.paidAmount.toLocaleString('ar-EG')} {settings.currency}). تم قفل تعديل وحذف وإضافة الخدمات وقطع الغيار لحماية السجلات المحاسبية والضريبية.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenInvoiceModal(selectedOrder.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>عرض الفاتورة المسددة</span>
              </button>
            </div>
          )}

          {/* Interactive 6-Step Pipeline Timeline */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 text-center mb-4">مراحل تنفيذ العمل بالفحص والصيانة</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 relative">
              {pipelineSteps.map((step) => {
                const isCompleted = currentStep >= step.number;
                const isCurrent = currentStep === step.number;

                return (
                  <button
                    key={step.key}
                    onClick={() => updateWorkOrderStatus(selectedOrder.id, step.key as WorkOrderStatus)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isCurrent
                        ? step.key === 'waiting_invoice'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/20'
                          : 'bg-orange-500/15 border-orange-500 text-orange-400 shadow-lg shadow-orange-500/10'
                        : isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent 
                        ? step.key === 'waiting_invoice' ? 'bg-purple-600 text-white' : 'bg-orange-500 text-white' 
                        : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {step.number}
                    </div>
                    <span className="text-[11px] font-bold leading-tight">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Inspection Notes & Reported Complaint */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" /> شكوى العميل وملاحظات الفحص الفني
          </h3>
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <p><span className="font-bold text-orange-400">الأعطال المُبلّغ عنها:</span> {selectedOrder.reportedIssues}</p>
            {selectedOrder.inspectionNotes && (
              <p><span className="font-bold text-emerald-400">تقرير الفحص الفني:</span> {selectedOrder.inspectionNotes}</p>
            )}
          </div>
        </div>

        {/* Services & Labor Table */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-400" /> الخدمات والمصنوعيات المطلوبة
            </h3>
            {isOrderLocked ? (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <Lock className="w-3.5 h-3.5" /> الخدمات مقفلة مالياً
              </span>
            ) : (
              <button
                onClick={() => setShowAddServiceForm(!showAddServiceForm)}
                className="flex items-center gap-1.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة خدمة
              </button>
            )}
          </div>

          {/* Form to Add New Service */}
          {showAddServiceForm && !isOrderLocked && (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">اسم الخدمة</label>
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={e => setNewServiceName(e.target.value)}
                    placeholder="مثلاً: خرط طنابير / تغيير زيت"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">التكلفة ({settings.currency})</label>
                  <input
                    type="number"
                    value={newServiceCost}
                    onChange={e => setNewServiceCost(e.target.value)}
                    placeholder="150"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الفني المسند له</label>
                  <select
                    value={newServiceTech}
                    onChange={e => setNewServiceTech(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {users && users.length > 0 ? (
                      users.map(u => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))
                    ) : (
                      <option value="مهندس الورشة (المالك)">مهندس الورشة (المالك)</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddServiceForm(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    if (!newServiceName || !newServiceCost) return;
                    addServiceToWorkOrder(selectedOrder.id, {
                      serviceId: `srv-${Date.now()}`,
                      serviceName: newServiceName,
                      cost: parseFloat(newServiceCost),
                      technicianId: 'usr-4',
                      technicianName: newServiceTech,
                      status: 'in_progress'
                    });
                    setNewServiceName('');
                    setNewServiceCost('');
                    setShowAddServiceForm(false);
                  }}
                  className="bg-orange-500 text-white font-bold px-4 py-1.5 rounded-xl"
                >
                  حفظ الخدمة
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                  <th className="py-2.5 px-3">الخدمة</th>
                  <th className="py-2.5 px-3">الفني المسند</th>
                  <th className="py-2.5 px-3">التكلفة</th>
                  <th className="py-2.5 px-3">حالة التنفيذ</th>
                  <th className="py-2.5 px-3 text-left">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedOrder.services.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-slate-200">{s.serviceName}</td>
                    <td className="py-3 px-3 text-slate-300">{s.technicianName}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{s.cost} {settings.currency}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {s.status === 'completed' ? 'مكتمل' : 'جاري العمل'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-left">
                      {isOrderLocked ? (
                        <span title="مقفل - الفاتورة مسددة" className="text-slate-500 inline-flex items-center gap-1 text-[10px]">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        </span>
                      ) : (
                        <button
                          onClick={() => removeServiceFromWorkOrder(selectedOrder.id, s.id)}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issued Spare Parts Section */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" /> قطع الغيار المصروفة للخدمة
            </h3>
            {isOrderLocked ? (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <Lock className="w-3.5 h-3.5" /> الصرف مقفل مالياً
              </span>
            ) : (
              <button
                onClick={() => setShowAddPartForm(!showAddPartForm)}
                className="flex items-center gap-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> صرف قطعة غيار
              </button>
            )}
          </div>

          {/* Form to Issue Spare Part */}
          {showAddPartForm && !isOrderLocked && (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">اختر قطعة الغيار من المخزون</label>
                  <select
                    value={selectedPartId}
                    onChange={e => setSelectedPartId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">-- اختر صنف --</option>
                    {parts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) - رصيد: {p.quantityInStock} - سعر: {p.salePrice} {settings.currency}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الكمية المطلوبة</label>
                  <input
                    type="number"
                    min="1"
                    value={partQty}
                    onChange={e => setPartQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddPartForm(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    if (!selectedPartId) return;
                    addPartToWorkOrder(selectedOrder.id, selectedPartId, partQty);
                    setSelectedPartId('');
                    setPartQty(1);
                    setShowAddPartForm(false);
                  }}
                  className="bg-blue-500 text-white font-bold px-4 py-1.5 rounded-xl"
                >
                  صرف وإضافة
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                  <th className="py-2.5 px-3">اسم القطعة</th>
                  <th className="py-2.5 px-3">الكود</th>
                  <th className="py-2.5 px-3">الكمية</th>
                  <th className="py-2.5 px-3">سعر الوحدة</th>
                  <th className="py-2.5 px-3">الإجمالي</th>
                  <th className="py-2.5 px-3 text-left">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedOrder.parts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-slate-200">{p.partName}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{p.partSku}</td>
                    <td className="py-3 px-3 font-bold text-white">{p.quantity}</td>
                    <td className="py-3 px-3 text-slate-300">{p.unitPrice} {settings.currency}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{p.totalPrice} {settings.currency}</td>
                    <td className="py-3 px-3 text-left">
                      {isOrderLocked ? (
                        <span title="مقفل - الفاتورة مسددة" className="text-slate-500 inline-flex items-center gap-1 text-[10px]">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        </span>
                      ) : (
                        <button
                          onClick={() => removePartFromWorkOrder(selectedOrder.id, p.id)}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary & Footer Action Bar (Matching Image #4 Bottom) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-right">
            <div>
              <span className="text-slate-400 block mb-1">إجمالي المصنوعيات:</span>
              <span className="text-lg font-bold text-white">{selectedOrder.laborTotal} {settings.currency}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">إجمالي قطع الغيار:</span>
              <span className="text-lg font-bold text-white">{selectedOrder.partsTotal} {settings.currency}</span>
            </div>
            <div className="border-r border-slate-800 pr-4">
              <span className="text-slate-400 block mb-1">الإجمالي التقديري الكلي:</span>
              <span className="text-2xl font-extrabold text-orange-400">{selectedOrder.finalCost.toLocaleString('ar-EG')} {settings.currency}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => onOpenInvoiceModal(selectedOrder.id)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xl shadow-orange-500/20 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>تحويل إلى فاتورة وتسليم</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrintWorkOrder}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl cursor-pointer transition-all active:scale-95"
              >
                <Printer className="w-4 h-4 text-orange-400" />
                <span>طباعة الكارت PDF</span>
              </button>

              <button
                onClick={() => onSelectWorkOrder(null)}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl cursor-pointer transition-all active:scale-95"
              >
                حفظ الكارت
              </button>
            </div>
          </div>
        </div>

        {/* Success Toast Notification in Detail View */}
        {toastMessage && (
          <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500/40 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-100">{toastMessage}</span>
          </div>
        )}

        {/* Confirmation Dialog in Detail View */}
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          variant={confirmConfig.variant}
        />

      </div>
    );
  }

  // Work Orders List Catalog View
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-400" /> بطاقات الخدمة وأوامر الشغل
          </h2>
          <p className="text-xs text-slate-400">إدارة ومتابعة حركات السيارات في الورشة ومراحل الإصلاح</p>
        </div>

        <button
          onClick={onOpenNewWorkOrder}
          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ إنشاء كارت صيانة جديد</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F172A] p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {[
            { key: 'all', label: 'كافة الكروت' },
            { key: 'waiting_invoice', label: 'بانتظار الفاتورة' },
            { key: 'in_progress', label: 'جاري العمل' },
            { key: 'ready', label: 'جاهز للتسليم' },
            { key: 'waiting_parts', label: 'بانتظار القطع' },
            { key: 'delivered', label: 'تم الفوترة' },
          ].map(tab => {
            const count = tab.key === 'all' 
              ? workOrders.length 
              : workOrders.filter(w => w.status === tab.key).length;

            return (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === tab.key 
                    ? tab.key === 'waiting_invoice'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-orange-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterStatus === tab.key 
                      ? 'bg-black/30 text-white' 
                      : tab.key === 'waiting_invoice'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الكارت أو اللوحة..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Work Orders List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map(wo => {
          const woInvoice = invoices.find(i => i.workOrderId === wo.id || i.id === wo.invoiceId);
          const isLocked = woInvoice?.status === 'paid';

          return (
            <div
              key={wo.id}
              onClick={() => onSelectWorkOrder(wo.id)}
              className="bg-[#0F172A] border border-slate-800 hover:border-slate-700 rounded-3xl p-5 space-y-4 cursor-pointer group transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-orange-400 text-xs block">{wo.id}</span>
                    {isLocked && (
                      <span title="مقفل - الفاتورة مسددة" className="text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-md px-1.5 py-0.2 text-[9px] font-bold inline-flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> مسدد
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-orange-300 transition-colors">
                    {wo.vehicleName}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    isLocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    wo.status === 'waiting_invoice' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse' :
                    wo.status === 'in_progress' ? 'bg-emerald-500/20 text-emerald-400' :
                    wo.status === 'ready' ? 'bg-amber-400/20 text-amber-300' :
                    wo.status === 'waiting_parts' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {isLocked ? 'تم السداد والتسليم' :
                     wo.status === 'waiting_invoice' ? 'بانتظار الفاتورة' :
                     wo.status === 'in_progress' ? 'في العمل' : 
                     wo.status === 'ready' ? 'جاهز للتسليم' : 
                     wo.status === 'waiting_parts' ? 'بانتظار قطع' : 'مكتمل'}
                  </span>
                  {wo.status === 'waiting_invoice' && !isLocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInvoiceModal(wo.id);
                      }}
                      title="إصدار الفاتورة الآن"
                      className="flex items-center gap-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold px-2 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>إصدار الفاتورة</span>
                    </button>
                  )}
                  {!isLocked && (
                    <button
                      onClick={(e) => handleDeleteWorkOrderClick(e, wo.id, wo.customerName)}
                      title="حذف أمر الشغل"
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p><span className="text-slate-500">العميل:</span> <span className="font-bold">{wo.customerName}</span></p>
              <p><span className="text-slate-500">اللوحة:</span> <span className="font-bold text-orange-400">{wo.plateNumber}</span></p>
              <p><span className="text-slate-500">الفني المسؤول:</span> <span className="font-medium">{wo.technicianName}</span></p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 line-clamp-2">
              {wo.reportedIssues}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-500 text-[11px]">{wo.checkInDate.substring(0, 10)}</span>
              <div className="text-left font-extrabold text-emerald-400">
                {wo.finalCost.toLocaleString('ar-EG')} {settings.currency}
              </div>
            </div>
          </div>
        );
      })}

        {filteredOrders.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs bg-[#0F172A] rounded-3xl border border-slate-800">
            لا توجد بطاقات صيانة مطابقة للفلتر المحدد
          </div>
        )}
      </div>

      {/* Success Toast Notification in Catalog View */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500/40 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-100">{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Dialog in Catalog View */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        variant={confirmConfig.variant}
      />

    </div>
  );
};
