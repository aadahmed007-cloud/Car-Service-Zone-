import React, { useState } from 'react';
import { 
  Wallet, Plus, Search, Filter, Trash2, Calendar, 
  TrendingDown, DollarSign, Building, PieChart 
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ExpenseCategory } from '../../types';
import { ConfirmModal } from '../modals/ConfirmModal';

interface ExpensesCashBoxViewProps {
  onOpenNewExpense: () => void;
}

export const ExpensesCashBoxView: React.FC<ExpensesCashBoxViewProps> = ({ onOpenNewExpense }) => {
  const { expenses, deleteExpense, cashBoxes, settings } = useWorkshop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const handleDeleteExpenseClick = (expId: string, desc: string, amount: number) => {
    setConfirmConfig({
      isOpen: true,
      title: `حذف المصروف: ${expId}`,
      message: `هل أنت تأكد من حذف سجل المصروفات (${desc}) بقيمة (${amount} ${settings.currency})؟`,
      onConfirm: () => deleteExpense(expId)
    });
  };

  // Stats calculation
  const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyAvg = Math.round(totalMonthlyExpenses / 30);

  // Group by category to find top expense category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  let topCategory = 'قطع غيار';
  let topAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  });

  const categoryBadges: Record<string, string> = {
    'إيجار': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'قطع غيار': 'bg-red-500/20 text-red-400 border-red-500/30',
    'رواتب': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'فواتير خدمات': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'صيانة دورية': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'نثريات': 'bg-slate-700 text-slate-300 border-slate-600',
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch = e.description.includes(searchQuery) || e.id.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-400" /> المصروفات - Car Service Zone
          </h2>
          <p className="text-xs text-slate-400">إدارة النثريات والمصروفات التشغيلية والربط مع الخزينة</p>
        </div>

        <button
          onClick={onOpenNewExpense}
          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ تسجيل مصروف جديد</span>
        </button>
      </div>

      {/* KPI Stats Cards (Matching Image #7 Top Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Total Monthly */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5">
          <span className="text-xs font-bold text-slate-400 block mb-2">إجمالي المصروفات الشهري</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{totalMonthlyExpenses.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-400 font-bold">{settings.currency}</span>
          </div>
        </div>

        {/* Card 2: Daily Average */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5">
          <span className="text-xs font-bold text-slate-400 block mb-2">المتوسط اليومي</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-200">{dailyAvg.toLocaleString('ar-EG')}</span>
            <span className="text-xs text-slate-400 font-bold">{settings.currency}</span>
          </div>
        </div>

        {/* Card 3: Top Category */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5">
          <span className="text-xs font-bold text-slate-400 block mb-2">أعلى فئة مصروفات</span>
          <div className="text-xl font-extrabold text-orange-400">{topCategory}</div>
        </div>

      </div>

      {/* Cash Box Balances Ledger */}
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-3xl">
        <h4 className="text-xs font-bold text-slate-400 mb-3">أرصدة الخزائن النقدية الحالية</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cashBoxes.map(cb => (
            <div key={cb.id} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">{cb.name}</span>
              <span className="font-extrabold text-emerald-400">{cb.balance.toLocaleString('ar-EG')} {settings.currency}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses Table Container (Matching Image #7) */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
        
        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="all">كل الفئات</option>
            <option value="إيجار">إيجار</option>
            <option value="قطع غيار">قطع غيار</option>
            <option value="رواتب">رواتب</option>
            <option value="فواتير خدمات">فواتير خدمات</option>
            <option value="صيانة دورية">صيانة دورية</option>
          </select>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بوصف المصروف..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Expenses List Table (Image #7 Exact Columns) */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <th className="py-3 px-3">رقم العملية</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">الفئة</th>
                <th className="py-3 px-3">الوصف</th>
                <th className="py-3 px-3">القيمة</th>
                <th className="py-3 px-3">الخزينة</th>
                <th className="py-3 px-3 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 font-mono text-slate-400">{exp.id}</td>
                  <td className="py-3.5 px-3 text-slate-300">{exp.expenseDate}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${categoryBadges[exp.category] || 'bg-slate-800 text-slate-300'}`}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-200">{exp.description}</td>
                  <td className="py-3.5 px-3 font-extrabold text-red-400">
                    {exp.amount.toLocaleString('ar-EG')} {settings.currency}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">{exp.cashBox}</td>
                  <td className="py-3.5 px-3 text-left">
                    <button
                      onClick={() => handleDeleteExpenseClick(exp.id, exp.description, exp.amount)}
                      title="حذف المصروف"
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
