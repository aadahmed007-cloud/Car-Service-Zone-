import React, { useState } from 'react';
import { 
  Receipt, Search, Printer, CheckCircle2, DollarSign, 
  CreditCard, Building, ArrowRight, ShieldCheck, Wallet, FileText, Trash2 
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { Invoice, PaymentMethod } from '../../types';
import { ConfirmModal } from '../modals/ConfirmModal';

interface InvoicesPaymentsViewProps {
  onOpenInvoiceModal: (workOrderId: string) => void;
}

export const InvoicesPaymentsView: React.FC<InvoicesPaymentsViewProps> = ({ onOpenInvoiceModal }) => {
  const { invoices, recordPayment, deleteInvoice, cashBoxes, settings } = useWorkshop();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(invoices[0]?.id || null);

  // Confirmation Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const handleDeleteInvoiceClick = (e: React.MouseEvent, inv: Invoice) => {
    e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: `حذف الفاتورة: ${inv.id}`,
      message: `هل أنت تأكد من رغبتك في حذف الفاتورة رقم (${inv.id}) الصادرة للعميل (${inv.customerName}) بقيمة (${inv.totalAmount} ${settings.currency})؟ الإجراء لا يمكن التراجع عنه.`,
      onConfirm: () => {
        deleteInvoice(inv.id);
        if (selectedInvoiceId === inv.id) {
          const nextInv = invoices.find(i => i.id !== inv.id);
          setSelectedInvoiceId(nextInv ? nextInv.id : null);
        }
      }
    });
  };

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedCashBox, setSelectedCashBox] = useState<string>('الخزينة الرئيسية');
  const [discountAmount, setDiscountAmount] = useState<number>(150);

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId) || invoices[0] || null;

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch = inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.customerName.includes(searchQuery) ||
                          inv.plateNumber.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleCollectAndClose = () => {
    if (!selectedInvoice) return;
    recordPayment(selectedInvoice.id, selectedInvoice.remainingAmount, paymentMethod, selectedCashBox);
    alert(`تم تحصيل المبلغ (${selectedInvoice.remainingAmount} ${settings.currency}) بنجاح وتسجيل العملية بالخزينة.`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-400" /> الفاتورة والتحصيل - Car Service Zone
          </h2>
          <p className="text-xs text-slate-400">إصدار الفواتير، تطبيق الخصوم، تسجيل التحصيلات النقدية وطباعة السندات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Right Side (2 Cols): Active Invoice Checkout View (Matching Image #6 Exact Design) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedInvoice ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 space-y-6">
              
              {/* Invoice Top Info Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Card: Customer & Vehicle Info */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-bold text-orange-400">{selectedInvoice.id}</span>
                    <span className="text-slate-400">{selectedInvoice.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">العميل:</span>
                    <span className="font-bold text-white text-sm">{selectedInvoice.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">السيارة:</span>
                    <span className="font-bold text-slate-200">{selectedInvoice.vehicleName}</span>
                  </div>
                </div>

                {/* Right Card: Subtotal, Discount & Total (Image #6 Layout) */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">المجموع الفرعي</span>
                    <span className="font-bold text-slate-200 text-sm">{selectedInvoice.subtotal.toLocaleString('ar-EG')} {settings.currency}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-800 pt-2">
                    <span className="text-slate-400 font-bold">الخصم</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={discountAmount}
                        onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)}
                        className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-center font-bold text-white focus:outline-none"
                      />
                      <span className="text-slate-400">{settings.currency}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-orange-400">
                    <span className="font-extrabold text-sm">الإجمالي النهائي</span>
                    <span className="text-2xl font-extrabold">{Math.max(0, selectedInvoice.subtotal - discountAmount).toLocaleString('ar-EG')} {settings.currency}</span>
                  </div>
                </div>

              </div>

              {/* Items Summary Table (Matching Image #6 Left Table) */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <FileText className="w-4 h-4 text-orange-400" /> العمليات والقطع المشمولة بالفاتورة
                </h4>
                <div className="space-y-2 divide-y divide-slate-800">
                  {selectedInvoice.itemsSummary.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between pt-2 text-xs">
                      <span className="font-medium text-slate-200">{item.description}</span>
                      <span className="font-bold text-emerald-400">{item.amount.toLocaleString('ar-EG')} {settings.currency}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods Options (Matching Image #6 Buttons: نقدي, بطاقة ائتمان, تحويل بنكي) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300">طريقة التحصيل وتحديد الخزينة</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'cash', label: 'نقدي', icon: DollarSign },
                    { key: 'card', label: 'بطاقة ائتمان', icon: CreditCard },
                    { key: 'transfer', label: 'تحويل بنكي', icon: Building },
                  ].map(m => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => setPaymentMethod(m.key as PaymentMethod)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-bold text-xs cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-md' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Cash Box Selection */}
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" /> الخزينة المستلمة:
                  </span>
                  <select
                    value={selectedCashBox}
                    onChange={e => setSelectedCashBox(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold"
                  >
                    {cashBoxes.map(cb => (
                      <option key={cb.id} value={cb.name}>{cb.name} (رصيد: {cb.balance} {settings.currency})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bottom Action Buttons (Matching Image #6 Green & Blue Buttons) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleCollectAndClose}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-xl shadow-emerald-600/20 cursor-pointer transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>إغلاق وتحصيل</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-xl shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة PDF</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-12 text-center text-xs text-slate-500">
              اختر فاتورة من القائمة لعرض تفاصيل التحصيل وتحديد طريقة الدفع
            </div>
          )}
        </div>

        {/* Left Side (1 Col): Invoices Catalog List */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">قائمة الفواتير</h3>
            <div className="flex items-center gap-1">
              {['all', 'paid', 'unpaid'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    filterStatus === st ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {st === 'all' ? 'الكل' : st === 'paid' ? 'مدفوعة' : 'معلقة'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredInvoices.map(inv => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoiceId(inv.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs ${
                  selectedInvoiceId === inv.id 
                    ? 'bg-slate-800 border-orange-500 shadow-md' 
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-orange-400 font-mono">{inv.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {inv.status === 'paid' ? 'مدفوعة' : 'جزئي/غير مدفوع'}
                    </span>
                    <button
                      onClick={(e) => handleDeleteInvoiceClick(e, inv)}
                      title="حذف الفاتورة"
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-slate-200 font-bold mt-1">{inv.customerName}</div>
                <div className="text-[10px] text-slate-400">{inv.vehicleName}</div>
                <div className="text-right font-extrabold text-emerald-400 mt-2">
                  {inv.totalAmount.toLocaleString('ar-EG')} {settings.currency}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />

    </div>
  );
};
