import React from 'react';
import { X, Printer, CheckCircle2, FileText, Receipt } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface InvoiceModalProps {
  workOrderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ workOrderId, isOpen, onClose, onInvoiceCreated }) => {
  const { workOrders, convertWorkOrderToInvoice, settings } = useWorkshop();

  if (!isOpen || !workOrderId) return null;

  const workOrder = workOrders.find(w => w.id === workOrderId);
  if (!workOrder) return null;

  const handleGenerateInvoice = () => {
    convertWorkOrderToInvoice(workOrderId);
    onInvoiceCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 text-xs text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-400" /> أصدار الفاتورة وتصفية الحساب
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Card */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white">كارت الصيانة: {workOrder.id}</span>
            <span className="text-slate-400 font-mono">{workOrder.plateNumber}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 block text-[10px]">العميل:</span>
              <span className="font-bold text-slate-200">{workOrder.customerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">السيارة:</span>
              <span className="font-bold text-slate-200">{workOrder.vehicleName}</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">مصنوعيات وخدمات الصيانة:</span>
              <span className="font-bold text-white">{workOrder.laborTotal} {settings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">إجمالي قطع الغيار المصروفة:</span>
              <span className="font-bold text-white">{workOrder.partsTotal} {settings.currency}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-orange-400 border-t border-slate-800 pt-2 mt-2">
              <span>الإجمالي الكلي النهائي:</span>
              <span>{workOrder.finalCost.toLocaleString('ar-EG')} {settings.currency}</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800">
          * عند إصدار الفاتورة، سيتم تحويل حالة كارت الشغل إلى "تم التسليم والفوترة"، وتسجيل العملية في سجل الفواتير للتحصيل.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white"
          >
            إلغاء
          </button>
          <button
            onClick={handleGenerateInvoice}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>إصدار الفاتورة الآن</span>
          </button>
        </div>

      </div>
    </div>
  );
};
