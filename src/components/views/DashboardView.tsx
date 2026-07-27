import React from 'react';
import { 
  TrendingUp, Wrench, AlertTriangle, CheckCircle2, Plus, 
  Wallet, PackagePlus, ArrowUpRight, Clock, ChevronLeft, Car, Filter, Calendar
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  onOpenNewWorkOrder: () => void;
  onSelectWorkOrder: (id: string) => void;
  onOpenNewExpense: () => void;
  onOpenNewPart: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenNewWorkOrder,
  onSelectWorkOrder,
  onOpenNewExpense,
  onOpenNewPart
}) => {
  const { workOrders, parts, invoices, expenses, settings, currentRole } = useWorkshop();

  // Metrics
  const todayStr = new Date().toISOString().substring(0, 10);
  
  const todayInvoices = invoices.filter(i => i.issueDate === todayStr);
  const todayRevenue = todayInvoices.reduce((sum, i) => sum + i.paidAmount, 0);

  const activeWorkOrders = workOrders.filter(w => w.status === 'in_progress' || w.status === 'pending' || w.status === 'waiting_parts');
  const readyWorkOrders = workOrders.filter(w => w.status === 'ready');
  const waitingPartsOrders = workOrders.filter(w => w.status === 'waiting_parts');
  const lowStockParts = parts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock');

  // Compute completion rate
  const completedCount = workOrders.filter(w => w.status === 'delivered' || w.status === 'ready').length;
  const completionRate = workOrders.length > 0 ? Math.round((completedCount / workOrders.length) * 100) : 0;

  // Pending parts label
  const pendingPartsNamesList = waitingPartsOrders.flatMap(w => w.requestedParts?.map(p => p.partName) || []).filter(Boolean);
  const pendingPartsSummary = pendingPartsNamesList.length > 0 
    ? pendingPartsNamesList.slice(0, 3).join(' • ') 
    : 'لا توجد طلبات معلقة';

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'في الانتظار', bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400' },
    in_progress: { label: 'قيد الإجراء', bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400' },
    waiting_parts: { label: 'بانتظار القطع', bg: 'bg-orange-500/15 border-orange-500/30', text: 'text-orange-400' },
    ready: { label: 'جاهز للتسليم', bg: 'bg-amber-400/20 border-amber-400/40', text: 'text-amber-300' },
    delivered: { label: 'تم التسليم والفوترة', bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-400' },
    cancelled: { label: 'ملغي', bg: 'bg-red-500/15 border-red-500/30', text: 'text-red-400' }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
            <Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">لوحة التحكم - Car Service Zone</h2>
          <p className="text-xs text-slate-400">متابعة الفحص، أوامر الصيانة، المخزون والإيرادات لحظياً</p>
        </div>

        {/* Quick Actions (matching mockup buttons: + بطاقة خدمة جديدة, + تسجيل مصروفات, + إضافة قطعة غيار) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewWorkOrder}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ بطاقة خدمة جديدة</span>
          </button>

              <button
                onClick={onOpenNewExpense}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>تسجيل مصروفات</span>
              </button>

              <button
                onClick={onOpenNewPart}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all"
              >
                <PackagePlus className="w-4 h-4 text-blue-400" />
                <span>إضافة قطعة غيار</span>
              </button>
        </div>
      </div>

      {/* KPI Stat Grid (4 Cards matching mockup image #1 & #2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today Revenue */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">إيرادات اليوم</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {todayRevenue.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-emerald-400">{settings.currency}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> {todayInvoices.length > 0 ? `${todayInvoices.length} فواتير مسددة` : 'لا توجد تحصيلات اليوم'}
            </span>
            <span>محدث الآن</span>
          </div>
        </div>

        {/* Card 2: Active Work Orders */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">الوظائف النشطة</span>
            <div className="w-9 h-9 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {activeWorkOrders.length}
            </span>
            <span className="text-xs text-slate-400">بطاقات بالورشة</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span className="text-amber-400 font-bold">{readyWorkOrders.length} جاهزة للتسليم</span>
            <span>{completionRate}% الإنجاز</span>
          </div>
        </div>

        {/* Card 3: Pending / Waiting Parts */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">قطع غيار معلقة</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {waitingPartsOrders.length}
            </span>
            <span className="text-xs text-slate-400">طلبات انتظار</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 truncate" title={pendingPartsSummary}>
            {pendingPartsSummary}
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">تنبيه المخزون المنخفض</span>
            <div className="w-9 h-9 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-400">
              {lowStockParts.length}
            </span>
            <span className="text-xs text-red-300 font-bold">عناصر حرجة</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <button onClick={() => setActiveTab('inventory')} className="text-orange-400 hover:underline font-bold flex items-center gap-1">
              عرض التفاصيل <ChevronLeft className="w-3 h-3" />
            </button>
            <span>يلزم إعادة الطلب</span>
          </div>
        </div>

      </div>

      {/* Main Section: Active Work Orders Table & Urgent Stock Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Recent Work Order Table (Matching Screenshot #1 & #2) */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-orange-400" /> بطاقات الصيانة النشطة الأخيرة
              </h3>
              <p className="text-xs text-slate-400">عرض السيارات قيد التنفيذ والفنيين المسؤولين</p>
            </div>
            <button
              onClick={() => setActiveTab('workorders')}
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              عرض الكل <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table container */}
          <div className="overflow-x-auto">
            {workOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                لا توجد بطاقات صيانة حالياً. انقر على زر "+ بطاقة خدمة جديدة" بالأعلى لإضافة أول سيارة.
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/50">
                    <th className="py-3 px-3 rounded-r-xl">رقم اللوحة / الكارت</th>
                    <th className="py-3 px-3">المركبة</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3">الفني</th>
                    <th className="py-3 px-3 rounded-l-xl text-left">التكلفة التقديرية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {workOrders.map((wo) => {
                    const badge = statusBadges[wo.status] || statusBadges.pending;
                    return (
                      <tr 
                        key={wo.id}
                        onClick={() => {
                          onSelectWorkOrder(wo.id);
                          setActiveTab('workorders');
                        }}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-200 group-hover:text-orange-400 transition-colors">
                            {wo.plateNumber}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{wo.id}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-medium text-slate-300">{wo.vehicleName}</div>
                          <div className="text-[10px] text-slate-500">{wo.customerName}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-300">
                          {wo.technicianName}
                        </td>
                        <td className="py-3.5 px-3 text-left font-bold text-emerald-400">
                          {wo.finalCost.toLocaleString('ar-EG')} {settings.currency}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Urgent Low Stock Alerts Box (Matching image #2) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> تنبيهات المخزون العاجلة
            </h3>
            <span className="text-[10px] bg-red-500/20 text-red-400 font-extrabold px-2 py-0.5 rounded-full border border-red-500/30">
              {lowStockParts.length} قطعة
            </span>
          </div>

          <div className="space-y-3">
            {lowStockParts.map((part) => (
              <div 
                key={part.id} 
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-200">{part.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">رقم القطعة: {part.sku}</p>
                  <p className="text-[11px] text-red-400 font-medium mt-0.5">الكمية الحالية: {part.quantityInStock}</p>
                </div>

                <button
                  onClick={() => setActiveTab('suppliers')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer shrink-0 transition-all"
                >
                  طلب شراء
                </button>
              </div>
            ))}

            {lowStockParts.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                جميع أصناف المخزون في المستويات الآمنة 👍
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('inventory')}
            className="w-full text-center py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800 transition-colors"
          >
            الانتقال لجدول المخزون الكامل
          </button>
        </div>

      </div>

    </div>
  );
};
