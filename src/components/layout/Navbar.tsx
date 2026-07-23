import React, { useState } from 'react';
import { 
  Wrench, Search, Bell, Moon, Sun, UserCheck, Shield, 
  CheckCircle2, AlertTriangle, FileText, ChevronDown, Car, UserPlus, Truck
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenNewWorkOrder: () => void;
  onSelectWorkOrder: (id: string) => void;
  onOpenNewCustomer?: () => void;
  onOpenNewSupplier?: () => void;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNewWorkOrder,
  onSelectWorkOrder,
  onOpenNewCustomer,
  onOpenNewSupplier,
  setActiveTab
}) => {
  const { 
    currentRole, activeUserName, themeMode, toggleTheme, 
    settings, notifications, markAllNotificationsRead, workOrders, vehicles, customers 
  } = useWorkshop();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    owner: { label: 'مالك / مدير الورشة', bg: 'bg-orange-500/20', text: 'text-orange-400' },
  };

  // Quick search results
  const matchingWorkOrders = searchQuery.trim() ? workOrders.filter(w => 
    w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.customerName.includes(searchQuery) ||
    w.plateNumber.includes(searchQuery) ||
    w.vehicleName.includes(searchQuery)
  ) : [];

  const matchingVehicles = searchQuery.trim() ? vehicles.filter(v =>
    v.plateNumber.includes(searchQuery) ||
    v.make.includes(searchQuery) ||
    v.model.includes(searchQuery)
  ) : [];

  const matchingCustomers = searchQuery.trim() ? customers.filter(c =>
    c.name.includes(searchQuery) ||
    c.phone.includes(searchQuery)
  ) : [];

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Right Section: Workshop Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 overflow-hidden flex items-center justify-center text-white shadow-lg shadow-black/40 shrink-0">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="Car Service Zone Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <Wrench className="w-5 h-5 text-orange-400" />
            )}
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-base leading-tight text-white flex items-center gap-2">
              {settings.name || 'Car Service Zone'}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-orange-400 border border-slate-700">
                مركز صيانة معتمد
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">{settings.tagline}</p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="ابحث برقم اللوحة / اسم العميل / الهاتف / رقم الكارت..."
              className="w-full bg-slate-900/80 border border-slate-800 focus:border-orange-500/50 rounded-xl pr-10 pl-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          {/* Search Results Popover */}
          {showSearchResults && searchQuery.trim().length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#0F172A] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800 max-h-80 overflow-y-auto">
              {matchingWorkOrders.length === 0 && matchingVehicles.length === 0 && matchingCustomers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">لا توجد نتائج مطابقة لـ "{searchQuery}"</div>
              ) : (
                <>
                  {matchingWorkOrders.length > 0 && (
                    <div className="p-2">
                      <div className="text-[11px] font-bold text-orange-400 px-2 mb-1">أوامر الشغل ({matchingWorkOrders.length})</div>
                      {matchingWorkOrders.map(wo => (
                        <button
                          key={wo.id}
                          onClick={() => {
                            onSelectWorkOrder(wo.id);
                            if (setActiveTab) setActiveTab('workorders');
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-right p-2 rounded-lg hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-200 ml-2">{wo.id}</span>
                            <span className="text-slate-400">{wo.vehicleName} ({wo.plateNumber})</span>
                          </div>
                          <span className="text-[10px] text-orange-400 font-medium">{wo.customerName}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingCustomers.length > 0 && (
                    <div className="p-2">
                      <div className="text-[11px] font-bold text-blue-400 px-2 mb-1">العملاء ({matchingCustomers.length})</div>
                      {matchingCustomers.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            if (setActiveTab) setActiveTab('customers');
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-right p-2 rounded-lg hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-bold text-slate-200">{c.name}</span>
                          <span className="text-slate-400 text-[11px]">{c.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Left Section: Role Selector, Notifications, Theme & User */}
        <div className="flex items-center gap-2">

          {onOpenNewCustomer && (
            <button
              onClick={onOpenNewCustomer}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700/60 transition-all cursor-pointer"
              title="إضافة عميل جديد"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}

          {onOpenNewSupplier && (
            <button
              onClick={onOpenNewSupplier}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/60 transition-all cursor-pointer"
              title="إضافة مورد جديد"
            >
              <Truck className="w-4 h-4" />
            </button>
          )}

          {/* Quick Add Work Order Button */}
          <button
            onClick={onOpenNewWorkOrder}
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>+ كارت صيانة جديد</span>
          </button>

          {/* Role Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/60 ${roleLabels[currentRole].bg}`}>
            <Shield className={`w-4 h-4 ${roleLabels[currentRole].text}`} />
            <div className="text-right hidden md:block">
              <span className={`block text-xs font-bold ${roleLabels[currentRole].text}`}>
                {roleLabels[currentRole].label}
              </span>
            </div>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markAllNotificationsRead();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-[10px] font-extrabold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-orange-400" /> الإشعارات والتنبيهات
                  </h4>
                  <button onClick={markAllNotificationsRead} className="text-[10px] text-orange-400 hover:underline">
                    تحديد الكل كتقروء
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-right text-xs">
                      <div className="font-bold text-slate-200 flex items-center justify-between mb-0.5">
                        <span className="flex items-center gap-1">
                          {n.type === 'stock' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                          {n.type === 'workorder' && <Wrench className="w-3.5 h-3.5 text-orange-400" />}
                          {n.type === 'invoice' && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-500">{n.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-orange-500/40 flex items-center justify-center text-xs font-bold text-orange-400">
              {activeUserName.charAt(0)}
            </div>
            <div className="text-right hidden xl:block">
              <span className="block text-xs font-bold text-slate-200">{activeUserName}</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> متصل
              </span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
