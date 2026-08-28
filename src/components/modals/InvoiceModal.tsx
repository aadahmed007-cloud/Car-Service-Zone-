import React, { useState } from 'react';
import { X, Printer, CheckCircle2, Receipt, Car, User, Clock, AlertCircle, ArrowLeft, Wrench } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface InvoiceModalProps {
  workOrderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ workOrderId, isOpen, onClose, onInvoiceCreated }) => {
  const { workOrders, convertWorkOrderToInvoice, updateWorkOrderStatus, settings } = useWorkshop();
  
  // Track modal step: 'preview' (review & issue/print) or 'confirm_close' (prompt to close maintenance)
  const [step, setStep] = useState<'preview' | 'confirm_close'>('preview');
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen || !workOrderId) return null;

  const workOrder = workOrders.find(w => w.id === workOrderId);
  if (!workOrder) return null;

  const handleIssueAndPrint = () => {
    const inv = convertWorkOrderToInvoice(workOrderId);
    const invoiceId = inv?.id || `INV-${workOrderId.replace(/\D/g, '')}`;
    setCreatedInvoiceId(invoiceId);

    // Trigger browser print dialog for invoice
    setTimeout(() => {
      window.print();
    }, 100);

    // Transition to confirmation step to ask user about closing vehicle maintenance
    setStep('confirm_close');
  };

  const handleIssueOnly = () => {
    const inv = convertWorkOrderToInvoice(workOrderId);
    const invoiceId = inv?.id || `INV-${workOrderId.replace(/\D/g, '')}`;
    setCreatedInvoiceId(invoiceId);
    
    // Transition to confirmation step to ask user about closing vehicle maintenance
    setStep('confirm_close');
  };

  const handleConfirmCloseWorkOrder = () => {
    updateWorkOrderStatus(workOrderId, 'delivered');
    setSuccessToast(`تم قفل كارت الصيانة (${workOrderId}) بنجاح وتسليم السيارة للعميل.`);
    setTimeout(() => {
      setStep('preview');
      setCreatedInvoiceId(null);
      setSuccessToast(null);
      onInvoiceCreated();
      onClose();
    }, 1200);
  };

  const handleKeepWorkOrderOpen = () => {
    setStep('preview');
    setCreatedInvoiceId(null);
    onInvoiceCreated();
    onClose();
  };

  const handleModalClose = () => {
    setStep('preview');
    setCreatedInvoiceId(null);
    setSuccessToast(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 text-xs text-slate-200 shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            {step === 'preview' ? (
              <>
                <Receipt className="w-5 h-5 text-orange-400" />
                <span>إصدار الفاتورة وتصفية حساب الصيانة</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>تأكيد قفل أمر الشغل وتسليم السيارة</span>
              </>
            )}
          </h3>
          <button 
            onClick={handleModalClose} 
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Invoice Preview & Issuance Options */}
        {step === 'preview' && (
          <div className="space-y-4">
            {/* Invoice Summary Card */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-orange-400" /> كارت الصيانة: {workOrder.id}
                </span>
                <span className="text-orange-400 font-mono font-bold bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/20">
                  {workOrder.plateNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">العميل:</span>
                    <span className="font-bold text-slate-200">{workOrder.customerName}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Car className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">السيارة:</span>
                    <span className="font-bold text-slate-200">{workOrder.vehicleName}</span>
                  </div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="border-t border-slate-800 pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">مصنوعيات وخدمات الصيانة ({workOrder.services?.length || 0}):</span>
                  <span className="font-bold text-white">{workOrder.laborTotal} {settings.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">قطع الغيار المصروفة ({workOrder.parts?.length || 0}):</span>
                  <span className="font-bold text-white">{workOrder.partsTotal} {settings.currency}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-orange-400 border-t border-slate-800 pt-2 mt-2">
                  <span>الإجمالي الكلي النهائي:</span>
                  <span>{workOrder.finalCost.toLocaleString('ar-EG')} {settings.currency}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span>
                عند طباعة الفاتورة أو إصدارها، سيتم إدراجها بسجل الفواتير وسيظهر لك أمر تأكيد لقفل الصيانة وتسليم السيارة نهائياً.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleModalClose}
                className="w-full sm:w-auto px-4 py-2.5 text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                إلغاء
              </button>

              <button
                onClick={handleIssueOnly}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all active:scale-95"
              >
                <Receipt className="w-4 h-4 text-orange-400" />
                <span>إصدار الفاتورة فقط</span>
              </button>

              <button
                onClick={handleIssueAndPrint}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>إصدار وطباعة الفاتورة</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Explicit Confirmation to Close Maintenance & Deliver Car */}
        {step === 'confirm_close' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>تم إصدار وطباعة الفاتورة ({createdInvoiceId}) بنجاح!</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                هل ترغب في <span className="text-white font-bold underline">قفل أمر الشغل ({workOrder.id})</span> وإنهاء الصيانة لسيارة العميل وتأكيد تسليمها الآن؟
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">السيارة:</span>
                <span className="font-bold text-white">{workOrder.vehicleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">رقم اللوحة:</span>
                <span className="font-mono font-bold text-orange-400">{workOrder.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">العميل:</span>
                <span className="font-bold text-white">{workOrder.customerName}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">الحالة بعد التأكيد:</span>
                <span className="font-bold text-emerald-400">تم التسليم والإنهاء (مغلق)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              * عند التأكيد، سيتم نقل بطاقة الصيانة إلى قائمة البطاقات المكتملة وتفريغ مكان الفحص بالورشة.
            </p>

            {/* Success Toast */}
            {successToast && (
              <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successToast}</span>
              </div>
            )}

            {/* Confirmation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleKeepWorkOrderOpen}
                className="w-full sm:w-auto px-4 py-2.5 text-slate-400 hover:text-white font-bold bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                إبقاء أمر الشغل مفتوحاً
              </button>

              <button
                type="button"
                onClick={handleConfirmCloseWorkOrder}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>نعم، تأكيد قفل الصيانة والتسليم</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

