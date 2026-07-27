import React, { useState } from 'react';
import { X, Car, User, Wrench, FileText } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface NewWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (workOrderId: string) => void;
}

export const NewWorkOrderModal: React.FC<NewWorkOrderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { customers, vehicles, addWorkOrder, settings, users } = useWorkshop();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [reportedIssues, setReportedIssues] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [technicianName, setTechnicianName] = useState(() => {
    return users && users.length > 0 ? users[0].name : 'مهندس الورشة (المالك)';
  });
  const [currentMileage, setCurrentMileage] = useState(85000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedVehicleId || !reportedIssues) {
      alert('يرجى اختيار العميل والمركبة وتدوين شكوى العميل');
      return;
    }

    const newWO = addWorkOrder({
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      reportedIssues,
      inspectionNotes,
      technicianName,
      currentMileage
    });

    onSuccess(newWO.id);
    onClose();
  };

  const customerVehicles = vehicles.filter(v => v.customerId === selectedCustomerId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 text-xs text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-400" /> فتح بطاقة صيانة / كارت شغل جديد
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Customer Selection */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">اختر العميل</label>
            <select
              value={selectedCustomerId}
              onChange={e => {
                setSelectedCustomerId(e.target.value);
                setSelectedVehicleId('');
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              required
            >
              <option value="">-- اختر عميل من القائمة --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>

          {/* Vehicle Selection */}
          {selectedCustomerId && (
            <div>
              <label className="block text-slate-400 font-bold mb-1">اختر المركبة المسجلة للعميل</label>
              <select
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                required
              >
                <option value="">-- اختر سيارة --</option>
                {customerVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.year}) - اللوحة: {v.plateNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mileage & Tech */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">قراءة العداد الحالية (كم)</label>
              <input
                type="number"
                value={currentMileage}
                onChange={e => setCurrentMileage(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">الفني الرئيسي المسند إليه</label>
              <select
                value={technicianName}
                onChange={e => setTechnicianName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              >
                {users && users.length > 0 ? (
                  users.map(u => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role === 'owner' ? 'إدارة/فني' : 'فني'})
                    </option>
                  ))
                ) : (
                  <option value="مهندس الورشة (المالك)">مهندس الورشة (المالك)</option>
                )}
              </select>
            </div>
          </div>

          {/* Customer Complaints */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">شكوى العميل والأعطال المطلوبة</label>
            <textarea
              value={reportedIssues}
              onChange={e => setReportedIssues(e.target.value)}
              placeholder="مثلاً: صوت في الفرامل مع اهتزاز وطقطقة مع المطب، تغيير زيت وفلتر..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500"
              required
            />
          </div>

          {/* Inspection Notes */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">تقرير الفحص الفني الابتدائي (اختياري)</label>
            <textarea
              value={inspectionNotes}
              onChange={e => setInspectionNotes(e.target.value)}
              placeholder="تم فحص السائل وتبيّن تأكل الفحامات وتلف فلتر الزيت..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20"
            >
              فتح كارت الصيانة
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
