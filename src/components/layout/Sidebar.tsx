import React from 'react';
import { 
  LayoutDashboard, Wrench, Users, Package, ShoppingBag, 
  Receipt, Wallet, BarChart3, Settings, ShieldAlert, LogOut
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, parts, workOrders, invoices, settings } = useWorkshop();

  // Badges calculation
  const lowStockCount = parts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;
  const activeWorkOrdersCount = workOrders.filter(w => w.status === 'in_progress' || w.status === 'pending' || w.status === 'waiting_parts').length;
  const unpaidInvoicesCount = invoices.filter(i => i.status === 'unpaid' || i.status === 'partial').length;

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'لوحة التحكم', 
      icon: LayoutDashboard, 
    },
    { 
      id: 'workorders', 
      label: 'بطاقات الخدمة', 
      icon: Wrench, 
      badge: activeWorkOrdersCount > 0 ? activeWorkOrdersCount : undefined,
      badgeColor: 'bg-orange-500',
    },
    { 
      id: 'customers', 
      label: 'العملاء والمركبات', 
      icon: Users, 
    },
    { 
      id: 'inventory', 
      label: 'المخزون والقطع', 
      icon: Package, 
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-red-500',
    },
    { 
      id: 'suppliers', 
      label: 'الموردون والمشتريات', 
      icon: ShoppingBag, 
    },
    { 
      id: 'invoices', 
      label: 'الفواتير والتحصيل', 
      icon: Receipt, 
      badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    { 
      id: 'expenses', 
      label: 'الخزينة والمصروفات', 
      icon: Wallet, 
    },
    { 
      id: 'reports', 
      label: 'التقارير والإحصائيات', 
      icon: BarChart3, 
    },
    { 
      id: 'settings', 
      label: 'الإعدادات والصلاحيات', 
      icon: Settings, 
    },
  ];

  // Filter items visible to the current role
  const visibleNavItems = navItems;

  return (
    <aside className="w-64 bg-[#0F172A] border-l border-slate-800 flex flex-col shrink-0 no-print hidden md:flex">
      
      {/* Top Sidebar Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="Car Service Zone" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-extrabold text-orange-400 text-xs">CSZ</span>
            )}
          </div>
          <div className="overflow-hidden">
            <span className="block text-xs font-extrabold text-white truncate">{settings.name || 'Car Service Zone'}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold">النظام نشط</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Details */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        <p className="font-semibold text-slate-400">Car Service Zone v1.0</p>
        <p>نظام صيانة السيارات المحاسبي</p>
      </div>

    </aside>
  );
};
