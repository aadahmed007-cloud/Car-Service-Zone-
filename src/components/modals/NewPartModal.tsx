import React, { useState } from 'react';
import { X, PackagePlus } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface NewPartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPartModal: React.FC<NewPartModalProps> = ({ isOpen, onClose }) => {
  const { addPart, suppliers, settings } = useWorkshop();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('فحامات وفرامل');
  const [quantityInStock, setQuantityInStock] = useState(10);
  const [reorderLevel, setReorderLevel] = useState(3);
  const [purchasePrice, setPurchasePrice] = useState(100);
  const [salePrice, setSalePrice] = useState(150);
  const [supplierId, setSupplierId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !supplierId) return;

    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    addPart({
      sku,
      name,
      category,
      quantityInStock,
      reorderLevel,
      purchasePrice,
      salePrice,
      supplierId,
      supplierName: supplier.name
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-orange-400" /> إضافة صنف قطعة غيار جديد
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">كود/رقم القطعة SKU</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="BRK-9901"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">اسم القطعة</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="أقمشة فرامل خلفية"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">التصنيف الفني</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="فحامات وفرامل">فحامات وفرامل</option>
                <option value="فلاتر وزيوت">فلاتر وزيوت</option>
                <option value="سيور ومحركات">سيور ومحركات</option>
                <option value="كهرباء وحساسات">كهرباء وحساسات</option>
                <option value="عفشة ومساعدات">عفشة ومساعدات</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">المورد</label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                required
              >
                <option value="">-- اختر مورد --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">الكمية بالمخزون</label>
              <input
                type="number"
                value={quantityInStock}
                onChange={e => setQuantityInStock(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">حد إعادة الطلب (تنبيه)</label>
              <input
                type="number"
                value={reorderLevel}
                onChange={e => setReorderLevel(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">سعر الشراء ({settings.currency})</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">سعر البيع للعميل ({settings.currency})</label>
              <input
                type="number"
                value={salePrice}
                onChange={e => setSalePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
              إلغاء
            </button>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl">
              إضافة الصنف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
