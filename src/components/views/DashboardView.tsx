import React from 'react';
import { 
  TrendingUp, Wrench, AlertTriangle, CheckCircle2, Plus, 
  Wallet, PackagePlus, ArrowUpRight, Clock, ChevronLeft, Car, Filter, Calendar,
  X, ShoppingCart, Printer
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';

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
  const { workOrders, parts, invoices, expenses, suppliers, addPurchaseOrder, settings, currentRole, themeMode } = useWorkshop();

  // Suggestion 1: Dashboard filter period state
  const [filterPeriod, setFilterPeriod] = React.useState<'today' | 'week' | 'month' | 'all'>('all');

  // Suggestion 2: Quick Automated Purchase Order states
  const [selectedPartForQuickPO, setSelectedPartForQuickPO] = React.useState<any | null>(null);
  const [quickPOQty, setQuickPOQty] = React.useState<number>(10);
  const [quickPOSupplierId, setQuickPOSupplierId] = React.useState<string>('');
  const [quickPOSuccess, setQuickPOSuccess] = React.useState<string | null>(null);

  // Helper callback for date range matching
  const isDateInPeriod = React.useCallback((dateStr: string) => {
    if (!dateStr) return false;
    if (filterPeriod === 'all') return true;

    const today = new Date();
    const todayStr = today.toISOString().substring(0, 10);

    if (filterPeriod === 'today') {
      return dateStr === todayStr;
    }

    const itemDate = new Date(dateStr);
    const diffTime = today.getTime() - itemDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (filterPeriod === 'week') {
      return diffDays >= 0 && diffDays <= 7;
    }

    if (filterPeriod === 'month') {
      return diffDays >= 0 && diffDays <= 30;
    }

    return true;
  }, [filterPeriod]);

  // Dynamically Filter data collections based on selection
  const filteredInvoices = React.useMemo(() => {
    return invoices.filter(i => isDateInPeriod(i.issueDate));
  }, [invoices, isDateInPeriod]);

  const filteredWorkOrders = React.useMemo(() => {
    return workOrders.filter(w => isDateInPeriod(w.checkInDate));
  }, [workOrders, isDateInPeriod]);

  // Recharts Chart Data Calculations (Interactive)
  const monthlyRevenueData = React.useMemo(() => {
    const monthsMap: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      if (!inv.issueDate) return;
      const monthStr = inv.issueDate.substring(0, 7); // "YYYY-MM"
      monthsMap[monthStr] = (monthsMap[monthStr] || 0) + (inv.paidAmount || 0);
    });

    const sortedMonths = Object.keys(monthsMap).sort();
    const monthNamesAr: Record<string, string> = {
      '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
      '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
      '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
    };

    if (sortedMonths.length === 0) {
      return [
        { name: 'مايو', revenue: 0 },
        { name: 'يونيو', revenue: 0 },
        { name: 'يوليو', revenue: 0 },
      ];
    }

    return sortedMonths.map(m => {
      const [year, month] = m.split('-');
      const name = `${monthNamesAr[month] || month} ${year}`;
      return {
        name,
        revenue: monthsMap[m],
      };
    });
  }, [filteredInvoices]);

  const frequentServicesData = React.useMemo(() => {
    const freqMap: Record<string, number> = {};
    filteredWorkOrders.forEach(wo => {
      wo.services?.forEach(srv => {
        const name = srv.serviceName;
        if (name) {
          freqMap[name] = (freqMap[name] || 0) + 1;
        }
      });
    });

    const sorted = Object.entries(freqMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    if (sorted.length === 0) {
      return [
        { name: 'لا توجد خدمات', count: 0 }
      ];
    }

    return sorted.slice(0, 5);
  }, [filteredWorkOrders]);

  const inventoryStockData = React.useMemo(() => {
    if (parts.length === 0) {
      return [{ name: 'لا توجد قطع', quantity: 0, reorder: 0 }];
    }
    return parts.slice(0, 6).map(p => ({
      name: p.name,
      quantity: p.quantityInStock,
      reorder: p.reorderLevel
    }));
  }, [parts]);

  // Interactive Metrics
  const periodRevenue = React.useMemo(() => {
    return filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  }, [filteredInvoices]);

  const activeWorkOrders = React.useMemo(() => {
    return filteredWorkOrders.filter(w => w.status === 'in_progress' || w.status === 'pending' || w.status === 'waiting_parts');
  }, [filteredWorkOrders]);

  const readyWorkOrders = React.useMemo(() => {
    return filteredWorkOrders.filter(w => w.status === 'ready');
  }, [filteredWorkOrders]);

  const waitingPartsOrders = React.useMemo(() => {
    return filteredWorkOrders.filter(w => w.status === 'waiting_parts');
  }, [filteredWorkOrders]);

  const lowStockParts = React.useMemo(() => {
    return parts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock');
  }, [parts]);

  // Compute completion rate
  const completedCount = React.useMemo(() => {
    return filteredWorkOrders.filter(w => w.status === 'delivered' || w.status === 'ready').length;
  }, [filteredWorkOrders]);

  const completionRate = React.useMemo(() => {
    return filteredWorkOrders.length > 0 ? Math.round((completedCount / filteredWorkOrders.length) * 100) : 0;
  }, [filteredWorkOrders, completedCount]);

  // Pending parts label
  const pendingPartsNamesList = React.useMemo(() => {
    return waitingPartsOrders.flatMap(w => w.requestedParts?.map(p => p.partName) || []).filter(Boolean);
  }, [waitingPartsOrders]);

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
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
            <Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">لوحة التحكم - Car Service Zone</h2>
          <p className="text-xs text-slate-400">متابعة الفحص، أوامر الصيانة، المخزون والإيرادات لحظياً</p>
        </div>

        {/* Quick Actions and Suggestion 1 Period Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Suggestion 1: Period Filter Select Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-2.5 rounded-2xl">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="bg-transparent border-none text-slate-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-slate-900 text-slate-200">جميع الأوقات</option>
              <option value="month" className="bg-slate-900 text-slate-200">آخر ٣٠ يوم</option>
              <option value="week" className="bg-slate-900 text-slate-200">آخر ٧ أيام</option>
              <option value="today" className="bg-slate-900 text-slate-200">اليوم فقط</option>
            </select>
          </div>

          {/* Suggestion 2: Print Report Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all active:scale-95"
            title="طباعة تقرير لوحة التحكم الحالي"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span>طباعة التقرير</span>
          </button>

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
        
        {/* Card 1: Revenue (Filtered) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">
              {filterPeriod === 'today' ? 'إيرادات اليوم' : filterPeriod === 'week' ? 'إيرادات الأسبوع' : filterPeriod === 'month' ? 'إيرادات الشهر' : 'إجمالي الإيرادات'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {periodRevenue.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-emerald-400">{settings.currency}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> {filteredInvoices.length > 0 ? `${filteredInvoices.length} فواتير بالفترة` : 'لا توجد تحصيلات'}
            </span>
            <span>محدث الآن</span>
          </div>
        </div>

        {/* Card 2: Active Work Orders (Filtered) */}
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
            <span className="text-xs text-slate-400">بطاقات بالفترة</span>
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
            <span className="text-xs text-slate-400 font-bold">طلبات انتظار</span>
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

      {/* Recharts Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Revenue (Area Chart) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> الإيرادات الشهرية
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">آخر الأشهر</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={themeMode === 'dark' ? '#1E293B' : '#E2E8F0'} />
                <XAxis 
                  dataKey="name" 
                  stroke={themeMode === 'dark' ? '#94A3B8' : '#475569'} 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  stroke={themeMode === 'dark' ? '#94A3B8' : '#475569'} 
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF', 
                    borderColor: themeMode === 'dark' ? '#1E293B' : '#CBD5E1',
                    borderRadius: '12px',
                    color: themeMode === 'dark' ? '#F8FAF6' : '#0F172A',
                    fontSize: '11px',
                    direction: 'rtl',
                    textAlign: 'right'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="الإيرادات" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Most Frequent Repair Services (Horizontal Bar Chart) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-400" /> الخدمات الأكثر تكراراً
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">حسب أوامر الصيانة</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={frequentServicesData} 
                margin={{ top: 10, right: 5, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={themeMode === 'dark' ? '#1E293B' : '#E2E8F0'} horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke={themeMode === 'dark' ? '#94A3B8' : '#475569'} 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke={themeMode === 'dark' ? '#94A3B8' : '#475569'} 
                  fontSize={9}
                  tickLine={false}
                  width={100}
                  tickFormatter={(tick) => tick.length > 15 ? `${tick.substring(0, 15)}...` : tick}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF', 
                    borderColor: themeMode === 'dark' ? '#1E293B' : '#CBD5E1',
                    borderRadius: '12px',
                    color: themeMode === 'dark' ? '#F8FAF6' : '#0F172A',
                    fontSize: '11px',
                    direction: 'rtl',
                    textAlign: 'right'
                  }}
                />
                <Bar dataKey="count" fill="#F97316" radius={[0, 8, 8, 0]} name="عدد المرات">
                  {frequentServicesData.map((entry, index) => {
                    const colors = ['#F97316', '#3B82F6', '#10B981', '#A855F7', '#EC4899'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Current Inventory Stock Levels (Vertical Bar Chart) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-blue-400" /> مستويات المخزون الحالية
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">أصناف رئيسية</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={inventoryStockData} 
                margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={themeMode === 'dark' ? '#1E293B' : '#E2E8F0'} />
                <XAxis 
                  dataKey="name" 
                  stroke={themeMode === 'dark' ? '#94A3B8' : '#475569'} 
                  fontSize={8}
                  tickLine={false}
                  tickFormatter={(tick) => tick.length > 10 ? `${tick.substring(0, 10)}...` : tick}
                />
                <YAxis 
                  stroke={themeMode === 'dark' ? '#94A3B8' : '#475569'} 
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF', 
                    borderColor: themeMode === 'dark' ? '#1E293B' : '#CBD5E1',
                    borderRadius: '12px',
                    color: themeMode === 'dark' ? '#F8FAF6' : '#0F172A',
                    fontSize: '11px',
                    direction: 'rtl',
                    textAlign: 'right'
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="quantity" fill="#3B82F6" radius={[6, 6, 0, 0]} name="الكمية المتوفرة" />
                <Bar dataKey="reorder" fill="#EF4444" radius={[6, 6, 0, 0]} name="حد إعادة الطلب" />
              </BarChart>
            </ResponsiveContainer>
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
                  <p className="text-[11px] text-red-400 font-medium mt-0.5">الكمية الحالية: {part.quantityInStock} / الحد الآمن: {part.reorderLevel}</p>
                </div>

                <button
                  onClick={() => {
                    setSelectedPartForQuickPO(part);
                    setQuickPOQty(Math.max(10, part.reorderLevel - part.quantityInStock + 10));
                    setQuickPOSupplierId(suppliers[0]?.id || '');
                  }}
                  className="bg-orange-500/10 hover:bg-orange-500 hover:text-white text-orange-400 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-orange-500/20 cursor-pointer shrink-0 transition-all active:scale-95"
                >
                  طلب شراء سريع
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

      {/* Suggestion 2: Quick PO Dialog Modal */}
      {selectedPartForQuickPO && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-200 shadow-2xl relative">
            <button 
              onClick={() => setSelectedPartForQuickPO(null)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">إنشاء أمر شراء سريع وتلقائي</h3>
                <p className="text-[10px] text-slate-400">توليد مستند أمر الشراء وتأمين رصيد المخزون في خطوة واحدة</p>
              </div>
            </div>
            
            <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">اسم القطعة:</span>
                <span className="font-bold text-white">{selectedPartForQuickPO.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">رمز SKU / الرف:</span>
                <span className="font-mono font-bold text-slate-300">{selectedPartForQuickPO.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الرصيد الحالي:</span>
                <span className="font-bold text-red-400">{selectedPartForQuickPO.quantityInStock} وحدة (الحد: {selectedPartForQuickPO.reorderLevel})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">سعر الشراء المقدر:</span>
                <span className="font-bold text-emerald-400">{selectedPartForQuickPO.purchasePrice} {settings.currency}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">المورد المستهدف</label>
                <select
                  value={quickPOSupplierId}
                  onChange={e => setQuickPOSupplierId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-orange-500 focus:outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                  ))}
                  {suppliers.length === 0 && (
                    <option value="">لا يوجد موردين متاحين</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">الكمية المطلوبة للشراء</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={quickPOQty}
                    onChange={e => setQuickPOQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-center focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-slate-400 whitespace-nowrap font-bold">وحدة صيانة</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">الكمية المقترحة تضمن الخروج من المنطقة الحرجة وتغطية الاحتياج الآمن.</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-bold">التكلفة الإجمالية المقدرة:</span>
                <span className="text-base font-extrabold text-orange-400">{(quickPOQty * selectedPartForQuickPO.purchasePrice).toLocaleString('ar-EG')} {settings.currency}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setSelectedPartForQuickPO(null)} 
                className="px-4 py-2.5 text-slate-400 hover:text-white font-bold"
              >
                إلغاء
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (suppliers.length === 0) {
                    alert('الرجاء إضافة مورد أولاً من تبويب الموردين');
                    return;
                  }
                  const supplier = suppliers.find(s => s.id === quickPOSupplierId) || suppliers[0];
                  const totalCost = quickPOQty * selectedPartForQuickPO.purchasePrice;
                  addPurchaseOrder({
                    supplierId: supplier.id,
                    supplierName: supplier.name,
                    orderDate: new Date().toISOString().substring(0, 10),
                    items: [{
                      partId: selectedPartForQuickPO.id,
                      partName: selectedPartForQuickPO.name,
                      quantity: quickPOQty,
                      unitCost: selectedPartForQuickPO.purchasePrice,
                      totalCost
                    }],
                    totalAmount: totalCost
                  });
                  setSelectedPartForQuickPO(null);
                  setQuickPOSuccess(`تم إنشاء أمر الشراء السريع بنجاح للصنف "${selectedPartForQuickPO.name}" للمورد "${supplier.name}"!`);
                  setTimeout(() => setQuickPOSuccess(null), 5000);
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer"
              >
                تأكيد وإرسال الأمر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {quickPOSuccess && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500/30 animate-pulse">
          <span className="text-emerald-400 text-base">✓</span>
          <span className="text-slate-100">{quickPOSuccess}</span>
        </div>
      )}

    </div>
  );
};
