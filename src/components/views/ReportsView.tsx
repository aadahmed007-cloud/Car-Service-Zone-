import React, { useState } from 'react';
import { 
  BarChart3, Download, TrendingUp, DollarSign, Award, Users, 
  FileSpreadsheet, Wrench, CheckCircle2 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart as RechartsPie, Pie, Cell, Legend 
} from 'recharts';
import * as XLSX from 'xlsx';
import { useWorkshop } from '../../context/WorkshopContext';

export const ReportsView: React.FC = () => {
  const { workOrders, parts, invoices, expenses, customers, vehicles, users, settings } = useWorkshop();

  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'custom'>('month');

  // Dynamic calculations
  const totalRevenue = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const avgInvoiceValue = invoices.length > 0 ? Math.round(totalRevenue / invoices.length) : 0;
  const customerRetentionRate = customers.length > 0 ? Math.min(100, Math.round((workOrders.length / customers.length) * 100)) : 0;

  // Find top technician
  const techMap: Record<string, number> = {};
  workOrders.forEach(w => {
    if (w.technicianName) {
      techMap[w.technicianName] = (techMap[w.technicianName] || 0) + 1;
    }
  });
  let topTechName = 'لا يوجد';
  let maxTechOrders = 0;
  Object.entries(techMap).forEach(([name, count]) => {
    if (count > maxTechOrders) {
      maxTechOrders = count;
      topTechName = name;
    }
  });

  // Revenue vs Expenses chart data generated from real invoices & expenses
  const chartData = React.useMemo(() => {
    if (invoices.length === 0 && expenses.length === 0) {
      return [
        { day: '01', revenue: 0, expenses: 0 },
        { day: '10', revenue: 0, expenses: 0 },
        { day: '20', revenue: 0, expenses: 0 },
        { day: '30', revenue: 0, expenses: 0 },
      ];
    }

    const daysMap: Record<string, { revenue: number; expenses: number }> = {};
    invoices.forEach(inv => {
      const day = inv.issueDate ? inv.issueDate.substring(8, 10) : '01';
      if (!daysMap[day]) daysMap[day] = { revenue: 0, expenses: 0 };
      daysMap[day].revenue += inv.paidAmount || 0;
    });
    expenses.forEach(exp => {
      const day = exp.date ? exp.date.substring(8, 10) : '01';
      if (!daysMap[day]) daysMap[day] = { revenue: 0, expenses: 0 };
      daysMap[day].expenses += exp.amount || 0;
    });

    const sortedDays = Object.keys(daysMap).sort();
    return sortedDays.map(day => ({
      day,
      revenue: daysMap[day].revenue,
      expenses: daysMap[day].expenses,
    }));
  }, [invoices, expenses]);

  // Donut Chart Data generated dynamically
  const serviceDistribution = React.useMemo(() => {
    if (workOrders.length === 0) {
      return [{ name: 'لا توجد خدمات منفذة', value: 100, color: '#475569' }];
    }
    const categories: Record<string, number> = {
      'ميكانيكا وعفشة': 0,
      'كهرباء وكومبيوتر': 0,
      'تغيير زيت وصيانة': 0,
    };
    let totalServices = 0;
    workOrders.forEach(w => {
      w.services?.forEach(s => {
        totalServices++;
        if (s.serviceName.includes('زيت') || s.serviceName.includes('صيانة') || s.serviceName.includes('فلتر')) {
          categories['تغيير زيت وصيانة']++;
        } else if (s.serviceName.includes('كهرباء') || s.serviceName.includes('فحص') || s.serviceName.includes('كمبيوتر')) {
          categories['كهرباء وكومبيوتر']++;
        } else {
          categories['ميكانيكا وعفشة']++;
        }
      });
    });

    if (totalServices === 0) {
      return [{ name: 'لا توجد خدمات منفذة', value: 100, color: '#475569' }];
    }

    const colors = ['#3B82F6', '#F97316', '#22C55E'];
    return Object.entries(categories)
      .filter(([_, val]) => val > 0)
      .map(([name, val], idx) => ({
        name,
        value: Math.round((val / totalServices) * 100),
        color: colors[idx % colors.length]
      }));
  }, [workOrders]);

  // Excel Export Handler using `xlsx`
  const exportToExcel = () => {
    const reportSheetData = invoices.map(inv => ({
      'رقم الفاتورة': inv.id,
      'تاريخ الإصدار': inv.issueDate,
      'اسم العميل': inv.customerName,
      'المركبة واللوحة': inv.vehicleName,
      'الإجمالي الفرعي': inv.subtotal,
      'الخصم': inv.discount,
      'الإجمالي النهائي': inv.totalAmount,
      'طريقة الدفع': inv.paymentMethod || 'نقدي',
      'حالة السداد': inv.status === 'paid' ? 'مدفوعة بالكامل' : 'معلقة'
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportSheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير_الفواتير_والإيرادات');

    XLSX.writeFile(workbook, `تقرير_ورشة_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" /> التقارير والإحصائيات التحليلية
          </h2>
          <p className="text-xs text-slate-400">تقارير الإيرادات، المصروفات، أداء الفنيين وحركات قطع الغيار</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector (Matching Image #8 Top Buttons) */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            {[
              { key: 'day', label: 'اليوم' },
              { key: 'week', label: 'هذا الأسبوع' },
              { key: 'month', label: 'هذا الشهر' },
              { key: 'custom', label: 'مخصص' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTimeRange(t.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === t.key ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel/PDF</span>
          </button>
        </div>
      </div>

      {/* Main Charts Section (Matching Image #8) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue vs Expenses Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> الإيرادات والمصروفات
            </h3>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> الإيرادات
              </span>
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> المصروفات
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Revenue by Service Type (1 Col) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            الإيرادات حسب نوع الخدمة
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-xs">
            {serviceDistribution.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
                <span className="font-bold">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-4">
          <span className="text-xs text-slate-400 font-bold block mb-1">صافي الربح التقديري</span>
          <div className={`text-2xl font-extrabold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netProfit >= 0 ? `+ ${netProfit.toLocaleString('ar-EG')}` : netProfit.toLocaleString('ar-EG')} {settings.currency}
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-4">
          <span className="text-xs text-slate-400 font-bold block mb-1">متوسط قيمة الفاتورة</span>
          <div className="text-2xl font-extrabold text-white">{avgInvoiceValue.toLocaleString('ar-EG')} {settings.currency}</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-4">
          <span className="text-xs text-slate-400 font-bold block mb-1">معدل الاحتفاظ بالعملاء</span>
          <div className="text-2xl font-extrabold text-blue-400">{customerRetentionRate}%</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-4">
          <span className="text-xs text-slate-400 font-bold block mb-1">الفني الأكثر عمليات</span>
          <div className="text-xl font-extrabold text-orange-400 truncate">{topTechName}</div>
        </div>

      </div>

      {/* Tech Productivity & Top Selling Parts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tech Productivity */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users className="w-4 h-4 text-orange-400" /> إنتاجية الفنيين
          </h3>
          <div className="space-y-3 text-xs">
            {users.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">لا يوجد فنيين أو موظفين مسجلين حالياً.</p>
            ) : (
              users.map((u, idx) => {
                const assignedCount = workOrders.filter(w => w.technicianName === u.name || w.technicianId === u.id).length;
                const totalWO = workOrders.length || 1;
                const pct = Math.round((assignedCount / totalWO) * 100);
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500'];
                return (
                  <div key={u.id} className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{u.name}</span>
                      <span className="text-slate-400">{pct}% - {assignedCount} مهمة</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[idx % colors.length]}`} style={{ width: `${Math.max(pct, workOrders.length > 0 ? 5 : 0)}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Selling Parts */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wrench className="w-4 h-4 text-emerald-400" /> قائمة قطع الغيار بأسعارها
          </h3>
          <div className="space-y-3 text-xs">
            {parts.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">لا توجد قطع غيار مسجلة بالمخزون حالياً.</p>
            ) : (
              parts.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.sku} • المتبقي: {p.quantityInStock}</span>
                  </div>
                  <span className="font-extrabold text-orange-400">{(p.salePrice || p.purchasePrice || 0).toLocaleString('ar-EG')} {settings.currency}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
