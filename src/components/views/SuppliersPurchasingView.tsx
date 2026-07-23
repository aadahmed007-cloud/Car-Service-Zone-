import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, CheckCircle2, Truck, Phone, Mail, MapPin, Trash2 } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ConfirmModal } from '../modals/ConfirmModal';

interface SuppliersPurchasingViewProps {
  onOpenNewSupplier: () => void;
  onOpenNewPO: () => void;
}

export const SuppliersPurchasingView: React.FC<SuppliersPurchasingViewProps> = ({ onOpenNewSupplier, onOpenNewPO }) => {
  const { suppliers, deleteSupplier, purchaseOrders, receivePurchaseOrder, settings } = useWorkshop();

  const [activeTab, setActiveTab] = useState<'pos' | 'suppliers'>('pos');

  // Confirmation modal state
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

  const handleDeleteSupplierClick = (supId: string, supName: string) => {
    setConfirmConfig({
      isOpen: true,
      title: `حذف المورد: ${supName}`,
      message: `هل أنت تأكد من رغبتك في حذف المورد (${supName}) من دليل الموردين؟`,
      onConfirm: () => deleteSupplier(supId)
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-400" /> الموردون وأوامر الشراء
          </h2>
          <p className="text-xs text-slate-400">إدارة التوريدات، طلبات الشراء، وتغذية المخزون التلقائية عند الاستلام</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewPO}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إنشاء أمر شراء جديد</span>
          </button>

          <button
            onClick={onOpenNewSupplier}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-2xl cursor-pointer"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>إضافة مورد</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-[#0F172A] p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pos' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          طلبات الشراء ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'suppliers' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          دليل الموردين ({suppliers.length})
        </button>
      </div>

      {activeTab === 'pos' ? (
        <div className="space-y-4">
          {purchaseOrders.map(po => (
            <div key={po.id} className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-orange-400 font-bold text-xs">{po.id}</span>
                  <h3 className="font-extrabold text-white text-sm">{po.supplierName}</h3>
                  <p className="text-[10px] text-slate-400">تاريخ الطلب: {po.orderDate}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    po.status === 'received' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {po.status === 'received' ? 'تم الاستلام وإضافة البضاعة' : 'معلق / بانتظار التوريد'}
                  </span>

                  {po.status === 'pending' && (
                    <button
                      onClick={() => receivePurchaseOrder(po.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-lg cursor-pointer"
                    >
                      استلام البضاعة وتحديث المخزون
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="font-bold text-slate-400 border-b border-slate-800 pb-1">الأصناف المشتراة:</div>
                {po.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-200">
                    <span>{item.partName} ({item.quantity} قطعة)</span>
                    <span className="font-bold text-emerald-400">{item.totalCost} {settings.currency}</span>
                  </div>
                ))}
              </div>

              <div className="text-left font-extrabold text-sm text-white pt-1">
                إجمالي أمر الشراء: <span className="text-orange-400">{po.totalAmount.toLocaleString('ar-EG')} {settings.currency}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map(sup => (
            <div key={sup.id} className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-white text-sm">{sup.name}</h3>
                <button
                  onClick={() => handleDeleteSupplierClick(sup.id, sup.name)}
                  title="حذف المورد"
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" /> {sup.phone}</p>
                {sup.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /> {sup.email}</p>}
                {sup.address && <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {sup.address}</p>}
                <p className="text-orange-400 font-bold pt-2">إجمالي طلبات الشراء: {sup.totalOrders} طلب</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={activeTab === 'suppliers' ? onOpenNewSupplier : onOpenNewPO}
        className="fixed bottom-20 left-6 z-40 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all"
        title={activeTab === 'suppliers' ? 'إضافة مورد جديد' : 'إنشاء أمر شراء'}
      >
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
};
