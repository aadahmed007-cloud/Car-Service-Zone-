import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface NewPOModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPOModal: React.FC<NewPOModalProps> = ({ isOpen, onClose }) => {
  const { suppliers, parts, addPurchaseOrder, settings } = useWorkshop();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedPartId, setSelectedPartId] = useState(parts[0]?.id || '');
  const [qty, setQty] = useState(10);
  const [items, setItems] = useState<{ partId: string; partName: string; quantity: number; unitCost: number; totalCost: number }[]>([]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const part = parts.find(p => p.id === selectedPartId);
    if (!part) return;

    setItems([...items, {
      partId: part.id,
      partName: part.name,
      quantity: qty,
      unitCost: part.purchasePrice,
      totalCost: part.purchasePrice * qty
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalPoAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !supplierId) {
      alert('يرجى تحديد المورد وإضافة قطعة غيار واحدة على الأقل لأمر الشراء');
      return;
    }

    addPurchaseOrder({
      supplierId,
      supplierName: suppliers.find(s => s.id === supplierId)?.name || '',
      orderDate: new Date().toISOString().substring(0, 10),
      items,
      totalAmount: totalPoAmount
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-400" /> إنشاء أمر شراء للمورد
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 font-bold mb-1">المورد المستهدف</label>
            <select
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              required
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
              ))}
            </select>
          </div>

          {/* Add Item Builder */}
          <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <label className="block text-slate-400 font-bold">إضافة أصناف لأمر الشراء</label>
            <div className="flex gap-2">
              <select
                value={selectedPartId}
                onChange={e => setSelectedPartId(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              >
                {parts.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.purchasePrice} {settings.currency})</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(parseInt(e.target.value) || 1)}
                className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center text-white font-bold"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-orange-500 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
              >
                + إضافة
              </button>
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="space-y-2 border border-slate-800 rounded-2xl p-3 bg-slate-900/50">
              <span className="font-bold text-slate-400">الأصناف المضافة:</span>
              <div className="divide-y divide-slate-800">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 text-xs">
                    <span>{it.partName} ({it.quantity} قطعة)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">{it.totalCost} {settings.currency}</span>
                      <button onClick={() => handleRemoveItem(idx)} className="text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-left font-extrabold text-sm text-white border-t border-slate-800">
                إجمالي أمر الشراء: <span className="text-orange-400">{totalPoAmount} {settings.currency}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
              إلغاء
            </button>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl">
              إرسال أمر الشراء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
