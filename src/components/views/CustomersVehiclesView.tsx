import React, { useState } from 'react';
import { Users, Car, Search, Plus, Phone, Mail, MapPin, Wrench, ChevronLeft, Calendar, Trash2 } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { Customer, Vehicle } from '../../types';
import { ConfirmModal } from '../modals/ConfirmModal';

interface CustomersVehiclesViewProps {
  onOpenNewCustomer: () => void;
  onOpenNewVehicle: () => void;
  onSelectWorkOrder: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

export const CustomersVehiclesView: React.FC<CustomersVehiclesViewProps> = ({
  onOpenNewCustomer,
  onOpenNewVehicle,
  onSelectWorkOrder,
  setActiveTab
}) => {
  const { customers, vehicles, workOrders, deleteCustomer, deleteVehicle, settings } = useWorkshop();

  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'vehicles'>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Confirmation Modal state
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

  const handleDeleteCustomerClick = (e: React.MouseEvent, cust: Customer) => {
    e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: `حذف العميل: ${cust.name}`,
      message: `هل أنت تأكد من رغبتك في حذف العميل "${cust.name}" (${cust.phone})؟ سيتم حذف بيانات العميل نهائياً من سجلات الورشة.`,
      onConfirm: () => {
        deleteCustomer(cust.id);
        if (selectedCustomerId === cust.id) setSelectedCustomerId(null);
      }
    });
  };

  const handleDeleteVehicleClick = (e: React.MouseEvent, veh: Vehicle) => {
    e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: `حذف المركبة: ${veh.make} ${veh.model}`,
      message: `هل أنت تأكد من حذف المركبة ذات رقم اللوحة (${veh.plateNumber}) الخاصة بالعميل (${veh.customerName})؟`,
      onConfirm: () => {
        deleteVehicle(veh.id);
      }
    });
  };

  // Filtered
  const filteredCustomers = customers.filter(c =>
    c.name.includes(searchQuery) || c.phone.includes(searchQuery)
  );

  const filteredVehicles = vehicles.filter(v =>
    v.plateNumber.includes(searchQuery) ||
    v.make.includes(searchQuery) ||
    v.model.includes(searchQuery) ||
    v.customerName.includes(searchQuery)
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;
  const customerVehicles = selectedCustomer ? vehicles.filter(v => v.customerId === selectedCustomer.id) : [];
  const customerWorkOrders = selectedCustomer ? workOrders.filter(w => w.customerId === selectedCustomer.id) : [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" /> إدارة العملاء وسجل المركبات
          </h2>
          <p className="text-xs text-slate-400">سجل بيانات العملاء، المركبات وسجل الفحوصات والصيانة السابقة</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewCustomer}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة عميل جديد</span>
          </button>

          <button
            onClick={onOpenNewVehicle}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-2xl cursor-pointer"
          >
            <Car className="w-4 h-4 text-orange-400" />
            <span>إضافة مركبة</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F172A] p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveSubTab('customers'); setSelectedCustomerId(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'customers' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            دليل العملاء ({customers.length})
          </button>
          <button
            onClick={() => { setActiveSubTab('vehicles'); setSelectedCustomerId(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'vehicles' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            سجل المركبات ({vehicles.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم / الهاتف / رقم اللوحة..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'customers' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Customers List (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            {filteredCustomers.map(cust => {
              const countVeh = vehicles.filter(v => v.customerId === cust.id).length;
              const isSelected = selectedCustomerId === cust.id;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-800/90 border-orange-500 shadow-lg shadow-orange-500/10' 
                      : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-sm text-white">{cust.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-900 text-orange-400 font-bold px-2.5 py-1 rounded-full border border-slate-800">
                        {countVeh} مركبات
                      </span>
                      <button
                        onClick={(e) => handleDeleteCustomerClick(e, cust)}
                        title="حذف العميل"
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {cust.phone}
                    </div>
                    {cust.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {cust.address}
                      </div>
                    )}
                  </div>

                  {cust.notes && (
                    <p className="mt-2 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      ملاحظة: {cust.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Customer Detail Drawer (1 col) */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4">
            {selectedCustomer ? (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.phone}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-orange-400 mb-2 flex items-center gap-1.5">
                    <Car className="w-4 h-4" /> سيارات العميل المسجلة
                  </h4>
                  <div className="space-y-2">
                    {customerVehicles.map(v => (
                      <div key={v.id} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
                        <div className="font-bold text-white">{v.make} {v.model} ({v.year})</div>
                        <div className="text-orange-400 font-mono font-bold mt-0.5">اللوحة: {v.plateNumber}</div>
                        <div className="text-[10px] text-slate-500 mt-1">العداد: {v.currentMileage.toLocaleString('ar-EG')} كم</div>
                      </div>
                    ))}
                    {customerVehicles.length === 0 && (
                      <p className="text-xs text-slate-500">لا توجد سيارات مسجلة لهذا العميل</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" /> سجل أوامر الشغل والصيانة
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {customerWorkOrders.map(wo => (
                      <button
                        key={wo.id}
                        onClick={() => {
                          onSelectWorkOrder(wo.id);
                          setActiveTab('workorders');
                        }}
                        className="w-full text-right p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs transition-colors"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span>{wo.id}</span>
                          <span className="text-emerald-400">{wo.finalCost.toLocaleString('ar-EG')} {settings.currency}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{wo.vehicleName} • {wo.checkInDate.substring(0, 10)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                اختر عميلاً من القائمة لعرض تفاصيل سياراته وسجل الفحوصات
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Vehicles Catalog Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map(veh => (
            <div key={veh.id} className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-sm font-extrabold text-white">{veh.make} {veh.model}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                    {veh.plateNumber}
                  </span>
                  <button
                    onClick={(e) => handleDeleteVehicleClick(e, veh)}
                    title="حذف المركبة"
                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <p><span className="text-slate-500">المالك:</span> <span className="font-bold">{veh.customerName}</span></p>
                <p><span className="text-slate-500">سنة الصنع:</span> {veh.year} • اللون: {veh.color}</p>
                <p><span className="text-slate-500">رقم الشاسيه VIN:</span> <span className="font-mono text-slate-400">{veh.chassisNumber}</span></p>
                <p><span className="text-slate-500">عداد الكيلومترات:</span> <span className="font-bold text-emerald-400">{veh.currentMileage.toLocaleString('ar-EG')} كم</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={activeSubTab === 'customers' ? onOpenNewCustomer : onOpenNewVehicle}
        className="fixed bottom-20 left-6 z-40 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all"
        title={activeSubTab === 'customers' ? 'إضافة عميل جديد' : 'إضافة مركبة'}
      >
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
};
