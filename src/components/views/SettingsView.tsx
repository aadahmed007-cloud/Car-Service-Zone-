import React, { useState, useRef } from 'react';
import { 
  Settings, Save, RefreshCw, Shield, Building, DollarSign, 
  Database, Download, Upload, FileJson, CheckCircle2, 
  Users, UserPlus, Trash2, Edit3, Wrench, Eraser, ImagePlus, X, AlertTriangle
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

export const SettingsView: React.FC = () => {
  const { 
    settings, updateSettings, resetAllData, clearAllDemoData, exportDatabase, importDatabase,
    customers, vehicles, workOrders, parts, suppliers, purchaseOrders, invoices, expenses,
    users, addUser, updateUser, deleteUser
  } = useWorkshop();

  const [form, setForm] = useState(settings);

  // Keep form in sync if global settings change from context
  React.useEffect(() => {
    setForm(settings);
  }, [settings]);

  const [exportSuccess, setExportSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Technicians management state
  const [techForm, setTechForm] = useState({ name: '', phone: '', username: '', role: 'owner' as any, isActive: true });
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [showTechForm, setShowTechForm] = useState(false);

  // Custom confirmation modal & toast
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'clear_all' | 'restore_demo' | 'restore_backup' | 'delete_user' | null;
    pendingData?: any;
    targetId?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: null
  });

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const executeConfirmAction = () => {
    if (confirmModal.actionType === 'clear_all') {
      clearAllDemoData();
      showToast('تم تصفير كافة البيانات بنجاح! التطبيق الآن نظيف وجاهز لاستقبال بيانات ورشتك الحقيقية.', 'success');
    } else if (confirmModal.actionType === 'restore_demo') {
      resetAllData();
      showToast('تمت استعادة البيانات التوضيحية الافتراضية بنجاح.', 'success');
    } else if (confirmModal.actionType === 'restore_backup' && confirmModal.pendingData) {
      const success = importDatabase(confirmModal.pendingData);
      if (success) {
        showToast('تمت استعادة قاعدة البيانات بنجاح من النسخة الاحتياطية.', 'success');
      } else {
        showToast('تعذر استيراد ملف النسخة الاحتياطية. يرجى التأكد من صحة التنسيق.', 'error');
      }
    } else if (confirmModal.actionType === 'delete_user' && confirmModal.targetId) {
      deleteUser(confirmModal.targetId);
      showToast('تم حذف الفني بنجاح.', 'success');
    }
    setConfirmModal({ isOpen: false, title: '', description: '', actionType: null });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP, SVG...)', 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 3 ميجابايت.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setForm(prev => ({ ...prev, logoUrl: result }));
        updateSettings({ ...form, logoUrl: result });
        showToast('تم تحديث صورة الشعار وتطبيقها بنجاح!', 'success');
      }
    };
    reader.readAsDataURL(file);

    // Reset file input value so re-selecting same or new file triggers onChange
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    showToast('تم حفظ إعدادات الورشة والشعار بنجاح.', 'success');
  };

  const handleExport = () => {
    exportDatabase();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setConfirmModal({
          isOpen: true,
          title: 'استعادة ملف النسخة الاحتياطية',
          description: 'هل أنت متأكد من استعادة كافة بيانات الورشة من هذه النسخة الاحتياطية؟ سيتم تحديث وتحديث سجلات الورشة بهذه البيانات.',
          actionType: 'restore_backup',
          pendingData: json
        });
      } catch (err) {
        showToast('ملف غير صالح. يرجى اختيار ملف JSON صحيح مسبق تصديره من النظام.', 'error');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" /> إعدادات النظام وصلاحيات الورشة
          </h2>
          <p className="text-xs text-slate-400">تعديل بيانات الورشة، الفواتير، نسبة الضريبة، والعملة المستخدمة</p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التغييرات</span>
        </button>
      </div>

      {/* Workshop Profile Form */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 space-y-6">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-orange-400" /> الهوية والبيانات الرئيسية للورشة
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group w-24 h-24 rounded-2xl bg-slate-950 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
              {form.logoUrl ? (
                <img 
                  src={form.logoUrl} 
                  alt="شعار المركز" 
                  className="w-full h-full object-contain p-1" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="font-extrabold text-orange-400 text-base">CSZ</span>
              )}
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center justify-between">
                <label className="block text-slate-200 font-bold text-xs">شعار المركز (Logo)</label>
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const updatedForm = { ...form, logoUrl: '' };
                      setForm(updatedForm);
                      updateSettings(updatedForm);
                      showToast('تم حذف الشعار بنجاح.', 'success');
                    }}
                    className="text-red-400 hover:text-red-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف الشعار</span>
                  </button>
                )}
              </div>

              <input 
                type="file" 
                ref={logoFileInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                className="hidden" 
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition-all shadow-sm"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span>اختيار صورة من الجهاز</span>
                </button>

                <span className="text-slate-500 text-xs font-bold">أو</span>

                <input
                  type="text"
                  value={form.logoUrl || ''}
                  onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="إدخال رابط صورة مباشرة (URL)..."
                  className="flex-1 min-w-[200px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                يمكنك رفع صورة من جهازك بصيغة (PNG, JPG, WEBP) لتظهر في شريط التنقل، القوائم، والمطبوعات الرسمية.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">اسم الورشة</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">الشعار / السلوجان</label>
            <input
              type="text"
              value={form.tagline}
              onChange={e => setForm({ ...form, tagline: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">رقم الهاتف</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">البريد الإلكتروني</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-bold">العنوان التفصيلي</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Tax & Financial Config */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 space-y-6">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" /> إعدادات الضريبة والعملة
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-bold">العملة الافتراضية</label>
            <select
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value="د.إ">درهم إماراتي (د.إ)</option>
              <option value="ر.س">ريال سعودي (ر.س)</option>
              <option value="ج.م">جنيه مصري (ج.م)</option>
              <option value="$">دولار أمريكي ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">نسبة ضريبة القيمة المضافة (%)</label>
            <input
              type="number"
              value={form.vatPercentage}
              onChange={e => setForm({ ...form, vatPercentage: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">الرقم الضريبي للمنشأة</label>
            <input
              type="text"
              value={form.vatNumber}
              onChange={e => setForm({ ...form, vatNumber: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Technicians & Staff Management */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" /> إدارة الفنيين وموظفي الورشة
            </h3>
            <p className="text-xs text-slate-400 mt-1">تعديل وإضافة الطاقم الفني والمهندسين الذين يعملون بالمركز والتحكم بصلاحياتهم</p>
          </div>

          <button
            onClick={() => {
              setEditingTechId(null);
              setTechForm({ name: '', phone: '', username: '', role: 'owner', isActive: true });
              setShowTechForm(!showTechForm);
            }}
            className="flex items-center justify-center gap-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2 rounded-2xl cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4 text-orange-400" />
            <span>{showTechForm ? 'إغلاق النموذج' : 'إضافة فني جديد'}</span>
          </button>
        </div>

        {/* Technician Form */}
        {showTechForm && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!techForm.name || !techForm.phone || !techForm.username) {
                showToast('يرجى تعبئة جميع الحقول المطلوبة', 'error');
                return;
              }
              if (editingTechId) {
                updateUser(editingTechId, techForm);
                showToast('تم تعديل بيانات الفني بنجاح');
              } else {
                addUser(techForm);
                showToast('تم إضافة الفني الجديد بنجاح');
              }
              setTechForm({ name: '', phone: '', username: '', role: 'owner', isActive: true });
              setEditingTechId(null);
              setShowTechForm(false);
            }}
            className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl space-y-4 text-xs animate-fade-in"
          >
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-orange-400" />
              {editingTechId ? 'تعديل بيانات الفني' : 'إدخال فني جديد للورشة'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">الاسم الكامل للفني *</label>
                <input
                  type="text"
                  required
                  value={techForm.name}
                  onChange={e => setTechForm({ ...techForm, name: e.target.value })}
                  placeholder="مثال: م. أحمد منصور"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">رقم الهاتف/الجوال *</label>
                <input
                  type="text"
                  required
                  value={techForm.phone}
                  onChange={e => setTechForm({ ...techForm, phone: e.target.value })}
                  placeholder="050XXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">اسم المستخدم (Username) *</label>
                <input
                  type="text"
                  required
                  value={techForm.username}
                  onChange={e => setTechForm({ ...techForm, username: e.target.value })}
                  placeholder="ahmed_tech"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">الحالة التشغيلية</label>
                <select
                  value={techForm.isActive ? 'true' : 'false'}
                  onChange={e => setTechForm({ ...techForm, isActive: e.target.value === 'true' })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="true">نشط / على رأس العمل</option>
                  <option value="false">غير نشط / إجازة</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingTechId(null);
                  setTechForm({ name: '', phone: '', username: '', role: 'owner', isActive: true });
                  setShowTechForm(false);
                }}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
              >
                {editingTechId ? 'حفظ التعديلات' : 'إضافة الفني الجديد'}
              </button>
            </div>
          </form>
        )}

        {/* Technicians List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <th className="py-2.5 px-3">اسم الفني / الموظف</th>
                <th className="py-2.5 px-3">رقم الهاتف</th>
                <th className="py-2.5 px-3">اسم المستخدم</th>
                <th className="py-2.5 px-3 text-center">الحالة</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users && users.map(user => (
                <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{user.phone}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">@{user.username}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {user.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTechId(user.id);
                          setTechForm({
                            name: user.name,
                            phone: user.phone,
                            username: user.username,
                            role: user.role,
                            isActive: user.isActive
                          });
                          setShowTechForm(true);
                        }}
                        className="p-1 bg-slate-850 hover:bg-slate-800 text-blue-400 rounded-lg cursor-pointer"
                        title="تعديل"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'حذف الفني / الموظف',
                            description: `هل أنت متأكد من حذف الفني "${user.name}" من نظام الورشة؟`,
                            actionType: 'delete_user',
                            targetId: user.id
                          });
                        }}
                        className="p-1 bg-slate-850 hover:bg-slate-800 text-red-400 rounded-lg cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix Info Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-purple-400" /> مصفوفة أدوار وصلاحيات النظام
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <th className="py-2.5 px-3">الدور</th>
                <th className="py-2.5 px-3">أوامر الشغل والسيارات</th>
                <th className="py-2.5 px-3">المخزون وقطع الغيار</th>
                <th className="py-2.5 px-3">الفواتير والتحصيل</th>
                <th className="py-2.5 px-3">المصروفات والتقارير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-3 font-bold text-orange-400">مالك / مدير الورشة</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">كاملة</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">كاملة</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">كاملة</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">كاملة</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-blue-400">المحاسب</td>
                <td className="py-3 px-3 text-slate-300">قراءة/تعديل</td>
                <td className="py-3 px-3 text-slate-300">متابعة/طلبات شراء</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">إصدار وتحصيل</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">كاملة</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-emerald-400">موظف الاستقبال</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">إنشاء ومتابعة</td>
                <td className="py-3 px-3 text-slate-300">عرض الأسعار</td>
                <td className="py-3 px-3 text-slate-300">إصدار وتحصيل</td>
                <td className="py-3 px-3 text-red-400">محجوب</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-purple-400">الفني</td>
                <td className="py-3 px-3 text-purple-400 font-bold">تحديث مهام الفني فقط</td>
                <td className="py-3 px-3 text-slate-300">صرف قطع للمهمة</td>
                <td className="py-3 px-3 text-red-400">محجوب</td>
                <td className="py-3 px-3 text-red-400">محجوب</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Backup & Export Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" /> النسخ الاحتياطي وتصدير قاعدة البيانات
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              أخذ نسخة احتياطية محلية بصيغة JSON تحتوي على كافة سجلات الورشة (العملاء، السيارات، كروت الصيانة، المخزون، الفواتير، المصروفات، والإعدادات)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-blue-500/20 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تصدير قاعدة البيانات (JSON)</span>
            </button>

            {/* Import Button */}
            <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-slate-400" />
              <span>استيراد backup</span>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {/* Feedback messages */}
        {exportSuccess && (
          <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-2xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>تم تصدير ملف النسخة الاحتياطية بنجاح إلى جهازك (.json). يمكنك الاحتفاظ بالملف كأرشيف آمن.</span>
          </div>
        )}

        {importStatus && (
          <div className="flex items-center gap-2 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 p-3 rounded-2xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Live Database Content Metrics */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 block mb-2.5">
            محتويات النسخة الاحتياطية الحالية التي سيتم تصديرها:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-xs">
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-center">
              <span className="text-slate-400 block text-[10px]">العملاء</span>
              <span className="text-sm font-extrabold text-white">{customers.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-center">
              <span className="text-slate-400 block text-[10px]">السيارات</span>
              <span className="text-sm font-extrabold text-white">{vehicles.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-center">
              <span className="text-slate-400 block text-[10px]">كروت الصيانة</span>
              <span className="text-sm font-extrabold text-orange-400">{workOrders.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-center">
              <span className="text-slate-400 block text-[10px]">قطع الغيار</span>
              <span className="text-sm font-extrabold text-white">{parts.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-center">
              <span className="text-slate-400 block text-[10px]">الموردين/أوامر</span>
              <span className="text-sm font-extrabold text-white">{suppliers.length}/{purchaseOrders.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-center">
              <span className="text-slate-400 block text-[10px]">الفواتير</span>
              <span className="text-sm font-extrabold text-emerald-400">{invoices.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-center">
              <span className="text-slate-400 block text-[10px]">المصروفات</span>
              <span className="text-sm font-extrabold text-white">{expenses.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Clean & Reset Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Clear all demo data for live start */}
        <div className="bg-[#0F172A] border border-orange-500/30 bg-gradient-to-br from-slate-900 to-orange-950/20 rounded-3xl p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm mb-1">
              <Eraser className="w-5 h-5" />
              <h4>تصفير النظام ومسح جميع البيانات التجريبية</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              يقوم هذا الخيار بمسح كافة العملاء، السيارات، كروت الصيانة، المخزون، الفواتير، والمصروفات لتفريغ الورشة تماماً واستلام النظام جديداً ونظيفاً لبدء العمل الحقيقي.
            </p>
          </div>

          <button
            onClick={() => {
              setConfirmModal({
                isOpen: true,
                title: 'تصفير النظام ومسح جميع البيانات التجريبية',
                description: 'تنبيه هام جداً:\n\nهل أنت متأكد من مسح كافة العملاء، السيارات، كروت الصيانة، المخزون، الفواتير، والمصروفات لبدء التشغيل الحقيقي للورشة؟\nلا يمكن التراجع عن هذه الخطوة.',
                actionType: 'clear_all'
              });
            }}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl cursor-pointer shadow-lg shadow-orange-500/10 transition-all"
          >
            <Eraser className="w-4 h-4" />
            <span>تصفير ومسح كافة البيانات الحالية (تفريغ النظام)</span>
          </button>
        </div>

        {/* Option 2: Restore mock demo data */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-300 font-bold text-sm mb-1">
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <h4>استعادة البيانات التجريبية الافتراضية</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              إعادة ضبط كافة القوائم والتغييرات واستعادة السجلات التجريبية النموذجية لاختبار مزايا وتنسيقات النظام.
            </p>
          </div>

          <button
            onClick={() => {
              setConfirmModal({
                isOpen: true,
                title: 'استعادة البيانات التجريبية الافتراضية',
                description: 'هل أنت متأكد من إعادة استعادة البيانات النموذجية الافتراضية للورشة؟',
                actionType: 'restore_demo'
              });
            }}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-2xl cursor-pointer transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>استعادة الأمثلة الافتراضية</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal Component */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                {confirmModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, title: '', description: '', actionType: null })}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-line bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              {confirmModal.description}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, title: '', description: '', actionType: null })}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={executeConfirmAction}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/20 cursor-pointer transition-all"
              >
                تأكيد وبدء التنفيذ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Popup */}
      {toast?.show && (
        <div className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-bold animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-slate-900 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10' 
            : 'bg-slate-900 text-red-400 border-red-500/40 shadow-red-500/10'
        }`}>
          <CheckCircle2 className={`w-5 h-5 ${toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`} />
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
};
