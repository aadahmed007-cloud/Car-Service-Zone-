import React from 'react';
import { 
  LayoutDashboard, Wrench, Users, Package, ShoppingBag, 
  Receipt, Wallet, BarChart3, Settings 
} from 'lucide-react';

interface FooterNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FooterNav: React.FC<FooterNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'workorders', label: 'الخدمات', icon: Wrench },
    { id: 'customers', label: 'العملاء', icon: Users },
    { id: 'inventory', label: 'المخزون', icon: Package },
    { id: 'suppliers', label: 'الموردون', icon: ShoppingBag },
    { id: 'invoices', label: 'الفواتير', icon: Receipt },
    { id: 'expenses', label: 'المصاريف', icon: Wallet },
    { id: 'reports', label: 'التقارير', icon: BarChart3 },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-800 py-2 px-2 z-50 overflow-x-auto no-scrollbar flex items-center gap-1.5 no-print">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all shrink-0 px-2.5 py-1 rounded-xl cursor-pointer ${
              isActive 
                ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

