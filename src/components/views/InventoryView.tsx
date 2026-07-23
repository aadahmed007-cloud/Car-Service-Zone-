import React, { useState } from 'react';
import { 
  Package, Search, Plus, Filter, AlertTriangle, ArrowUpDown, 
  Edit3, Trash2, CheckCircle2, TrendingUp, RefreshCw, ShoppingCart
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { Part, StockStatus } from '../../types';
import { ConfirmModal } from '../modals/ConfirmModal';

interface InventoryViewProps {
  onOpenNewPart: () => void;
  onOpenNewPO: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenNewPart, onOpenNewPO }) => {
  const { parts, deletePart, adjustPartStock, settings, currentRole } = useWorkshop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Confirmation Modal State
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

  const handleDeletePartClick = (part: Part) => {
    setConfirmConfig({
      isOpen: true,
      title: `حذف قطعة الغيار: ${part.name}`,
      message: `هل أنت تأكد من حذف صنف قطعة الغيار (${part.name}) كود (${part.sku})؟ سيتم إزالته نهائياً من المستودع.`,
      onConfirm: () => deletePart(part.id)
    });
  };

  // Stock Movement Modal State
  const [adjustingPart, setAdjustingPart] = useState<Part | null>(null);
  const [adjType, setAdjType] = useState<'in' | 'out'>('in');
  const [adjQty, setAdjQty] = useState(1);
  const [adjReason, setAdjReason] = useState('شراء بضاعة مباشرة');

  // Stats
  const totalItemsCount = parts.length;
  const totalStockValue = parts.reduce((sum, p) => sum + (p.quantityInStock * p.purchasePrice), 0);
  const criticalItemsCount = parts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;

  const categories = Array.from(new Set(parts.map(p => p.category)));

  // Filtered Parts
  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.includes(searchQuery) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || (p.status === 'low_stock' || p.status === 'out_of_stock');
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const statusBadges: Record<StockStatus, { label: string; bg: string; text: string }> = {
    in_stock: { label: 'متوفر', bg: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-400' },
    low_stock: { label: 'منخفض', bg: 'bg-orange-500/20 border-orange-500/30', text: 'text-orange-400' },
    out_of_stock: { label: 'نفذ من المخزون', bg: 'bg-red-500/20 border-red-500/30', text: 'text-red-400' }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-400" /> Car Service Zone - إدارة المخزون وقطع الغيار
          </h2>
          <p className="text-xs text-slate-400">متابعة أرصدة الأصناف، أسعار الشراء والبيع وتنبيهات حد إعادة الطلب</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewPO}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span>طلب شراء للموردين</span>
          </button>

          <button
            onClick={onOpenNewPart}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة صنف جديد</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Mini-Bar (Matching Images #5 & #6) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-bold">إجمالي الأصناف بالمستودع</span>
            <span className="text-2xl font-extrabold text-white">{totalItemsCount}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-orange-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-bold">قيمة المخزون التقديرية</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {totalStockValue.toLocaleString('ar-EG')} <span className="text-xs">{settings.currency}</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-bold">أصناف تحت الحد الأدنى / حرجة</span>
            <span className="text-2xl font-extrabold text-red-400">{criticalItemsCount}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar (Matching Image #5) */}
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="all">جميع الفئات والتصنيفات</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Toggle Low Stock Only */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={e => setShowLowStockOnly(e.target.checked)}
              className="rounded text-orange-500 focus:ring-0"
            />
            <span>عرض المخزون المنخفض فقط</span>
          </label>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن رقم القطعة / الاسم / الكود..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Inventory Items Table (Matching Screenshot #5) */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <th className="py-3 px-3">رود/كود القطعة</th>
                <th className="py-3 px-3">اسم القطعة</th>
                <th className="py-3 px-3">التصنيف</th>
                <th className="py-3 px-3 text-center">المخزون الحالي</th>
                <th className="py-3 px-3">الحد الأدنى</th>
                <th className="py-3 px-3">سعر الشراء</th>
                <th className="py-3 px-3">سعر البيع</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredParts.map(part => {
                const badge = statusBadges[part.status] || statusBadges.in_stock;

                return (
                  <tr key={part.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-orange-400">{part.sku}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-100">{part.name}</td>
                    <td className="py-3.5 px-3 text-slate-400">{part.category}</td>
                    <td className="py-3.5 px-3 text-center font-extrabold text-white text-sm">
                      {part.quantityInStock}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{part.reorderLevel}</td>
                    <td className="py-3.5 px-3 text-slate-300">{part.purchasePrice} {settings.currency}</td>
                    <td className="py-3.5 px-3 font-bold text-emerald-400">{part.salePrice} {settings.currency}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-left">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setAdjustingPart(part)}
                          title="تعديل الرصيد والمحركة"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePartClick(part)}
                          title="حذف الصنف"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredParts.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            لا توجد أصناف مطابقة للبحث أو الفلتر المحدد
          </div>
        )}
      </div>

      {/* Adjust Stock Movement Modal */}
      {adjustingPart && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-200">
            <h3 className="text-base font-bold text-white">تسجيل حركة مخزنية: {adjustingPart.name}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">نوع الحركة</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAdjType('in')}
                    className={`py-2 rounded-xl font-bold ${adjType === 'in' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    وارد (+) إضافة
                  </button>
                  <button
                    onClick={() => setAdjType('out')}
                    className={`py-2 rounded-xl font-bold ${adjType === 'out' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    صادر (-) خصم
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الكمية</label>
                <input
                  type="number"
                  min="1"
                  value={adjQty}
                  onChange={e => setAdjQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">السبب / البيان</label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setAdjustingPart(null)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  const newQty = adjType === 'in' 
                    ? adjustingPart.quantityInStock + adjQty 
                    : Math.max(0, adjustingPart.quantityInStock - adjQty);
                  adjustPartStock(adjustingPart.id, newQty, adjReason);
                  setAdjustingPart(null);
                }}
                className="bg-orange-500 text-white font-bold px-5 py-2 rounded-xl"
              >
                حفظ الحركة
              </button>
            </div>
          </div>
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

    </div>
  );
};
