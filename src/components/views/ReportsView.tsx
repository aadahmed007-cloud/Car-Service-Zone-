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
  const { workOrders, parts, invoices, expenses, settings } = useWorkshop();

  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'custom'>('month');

  // Revenue vs Expenses chart data matching Image #8
  const chartData = [
    { day: '01', revenue: 45000, expenses: 32000 },
    { day: '06', revenue: 58000, expenses: 41000 },
    { day: '11', revenue: 52000, expenses: 38000 },
    { day: '16', revenue: 64000, expenses: 48000 },
    { day: '21', revenue: 80000, expenses: 65000 },
    { day: '26', revenue: 75000, expenses: 58000 },
    { day: '31', revenue: 92000, expenses: 70000 },
  ];

  // Donut Chart Data
  const serviceDistribution = [
    { name: 'ميكانيكا وعفشة', value: 45, color: '#3B82F6' },
    { name: 'كهرباء وكومبيوتر', value: 30, color: '#F97316' },
    { name: 'تغيير زيت وصيانة', value: 25, color: '#22C55E' },
  ];

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

    XLSX.writeFile(workbook, `تقرير_ورشة_الذكاء_${new Date().toISOString().substring(0, 10)}.xlsx`);
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

      {/* KPI Cards (Matching Image #8 Bottom Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-4">
          <span className="text-xs text-slate-400 font-bold block mb-1">صافي الربح التقديري</span>
          <div className="text-2xl font-extrabold text-emerald-400">+ 45,000 {settings.currency}</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-4">
          <span className="text-xs text-slate-400 font-bold block mb-1">متوسط قيمة الفاتورة</span>
          <div className="text-2xl font-extrabold text-white">550 {settings.currency}</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-4">
          <span className="text-xs text-slate-400 font-bold block mb-1">معدل الاحتفاظ بالعملاء</span>
          <div className="text-2xl font-extrabold text-blue-400">85%</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-4">
          <span className="text-xs text-slate-400 font-bold block mb-1">الفني الأكثر ربحية</span>
          <div className="text-xl font-extrabold text-orange-400">أحمد علي</div>
        </div>

      </div>

      {/* Tech Productivity & Top Selling Parts (Matching Image #8) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tech Productivity */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users className="w-4 h-4 text-orange-400" /> إنتاجية الفنيين
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { name: 'أحمد علي', score: '92% - 120 مهمة', color: 'bg-emerald-500', width: 'w-[92%]' },
              { name: 'محمد إبراهيم', score: '88% - 105 مهمة', color: 'bg-blue-500', width: 'w-[88%]' },
              { name: 'خالد حسن', score: '85% - 90 مهمة', color: 'bg-amber-500', width: 'w-[85%]' },
            ].map((tech, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span>{tech.name}</span>
                  <span className="text-slate-400">{tech.score}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${tech.color} ${tech.width}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Parts */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wrench className="w-4 h-4 text-emerald-400" /> قطع الغيار الأكثر مبيعاً
          </h3>
          <div className="space-y-3 text-xs">
            {parts.slice(0, 3).map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                </div>
                <span className="font-extrabold text-orange-400">250 قطعة مباعة</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
