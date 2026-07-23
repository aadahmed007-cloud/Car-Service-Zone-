import React, { useState } from 'react';
import { X, Wallet } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ExpenseCategory } from '../../types';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, cashBoxes, settings } = useWorkshop();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('نثريات');
  const [amount, setAmount] = useState('');
  const [cashBox, setCashBox] = useState('الخزينة الرئيسية');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    addExpense({
      expenseDate: new Date().toISOString().substring(0, 10),
      category,
      description,
      amount: parseFloat(amount),
      cashBox
    });

    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-400" /> تسجيل مصروف جديد
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-400 font-bold mb-1">وصف/بيان المصروف</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="مثلاً: إيجار الورشة / شراء أدوات تنظيف"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">فئة المصروف</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="إيجار">إيجار</option>
                <option value="قطع غيار">قطع غيار</option>
                <option value="رواتب">رواتب</option>
                <option value="فواتير خدمات">فواتير خدمات</option>
                <option value="صيانة دورية">صيانة دورية</option>
                <option value="نثريات">نثريات</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">المبلغ ({settings.currency})</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="250"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">خصم من خزينة</label>
            <select
              value={cashBox}
              onChange={e => setCashBox(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              {cashBoxes.map(cb => (
                <option key={cb.id} value={cb.name}>{cb.name} (رصيد: {cb.balance} {settings.currency})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
              إلغاء
            </button>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl">
              حفظ المصروف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
