import React, { useState } from 'react';
import { X, Car } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewVehicleModal: React.FC<NewVehicleModalProps> = ({ isOpen, onClose }) => {
  const { customers, addVehicle } = useWorkshop();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [make, setMake] = useState('تويوتا');
  const [model, setModel] = useState('كامري');
  const [year, setYear] = useState(2022);
  const [plateNumber, setPlateNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [color, setColor] = useState('أبيض');
  const [currentMileage, setCurrentMileage] = useState(65000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !plateNumber) return;

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    addVehicle({
      customerId,
      customerName: customer.name,
      make,
      model,
      year,
      plateNumber,
      chassisNumber: chassisNumber || `VIN-${Date.now()}`,
      color,
      currentMileage
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-orange-400" /> إضافة مركبة جديدة
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-400 font-bold mb-1">العميل المالك</label>
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              required
            >
              <option value="">-- اختر العميل --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">الماركة (Make)</label>
              <input
                type="text"
                value={make}
                onChange={e => setMake(e.target.value)}
                placeholder="تويوتا / هوندا / هيونداي"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">الموديل (Model)</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="كامري / أكورد / سوناتا"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">رقم اللوحة</label>
              <input
                type="text"
                value={plateNumber}
                onChange={e => setPlateNumber(e.target.value)}
                placeholder="أ ب ج 1234"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">سنة الصنع</label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(parseInt(e.target.value) || 2022)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">رقم الشاسيه VIN</label>
              <input
                type="text"
                value={chassisNumber}
                onChange={e => setChassisNumber(e.target.value)}
                placeholder="JTE283839201"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">قراءة العداد (كم)</label>
              <input
                type="number"
                value={currentMileage}
                onChange={e => setCurrentMileage(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
              إلغاء
            </button>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl">
              حفظ المركبة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
