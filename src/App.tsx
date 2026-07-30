import React, { useState } from 'react';
import { WorkshopProvider, useWorkshop } from './context/WorkshopContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { FooterNav } from './components/layout/FooterNav';

// Views
import { DashboardView } from './components/views/DashboardView';
import { WorkOrdersView } from './components/views/WorkOrdersView';
import { InventoryView } from './components/views/InventoryView';
import { CustomersVehiclesView } from './components/views/CustomersVehiclesView';
import { InvoicesPaymentsView } from './components/views/InvoicesPaymentsView';
import { ExpensesCashBoxView } from './components/views/ExpensesCashBoxView';
import { SuppliersPurchasingView } from './components/views/SuppliersPurchasingView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { NewWorkOrderModal } from './components/modals/NewWorkOrderModal';
import { NewExpenseModal } from './components/modals/NewExpenseModal';
import { NewPartModal } from './components/modals/NewPartModal';
import { NewCustomerModal } from './components/modals/NewCustomerModal';
import { NewVehicleModal } from './components/modals/NewVehicleModal';
import { NewSupplierModal } from './components/modals/NewSupplierModal';
import { NewPOModal } from './components/modals/NewPOModal';
import { InvoiceModal } from './components/modals/InvoiceModal';

export const AppContent: React.FC = () => {
  const { themeMode } = useWorkshop();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);

  // Modal Open States
  const [isNewWorkOrderOpen, setIsNewWorkOrderOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isNewPartOpen, setIsNewPartOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [isNewPOOpen, setIsNewPOOpen] = useState(false);

  // Invoice Modal State
  const [invoiceWorkOrderId, setInvoiceWorkOrderId] = useState<string | null>(null);

  const handleOpenWorkOrder = (id: string) => {
    setSelectedWorkOrderId(id);
    setActiveTab('workorders');
  };

  const handleOpenInvoiceModalForWO = (id: string) => {
    setInvoiceWorkOrderId(id);
  };

  return (
    <div className={`min-h-screen bg-[#020617] text-slate-100 flex flex-col font-cairo theme-${themeMode}`}>
      
      {/* Top Navbar */}
      <Navbar
        onOpenNewWorkOrder={() => setIsNewWorkOrderOpen(true)}
        onSelectWorkOrder={(id) => handleOpenWorkOrder(id)}
        onOpenNewCustomer={() => setIsNewCustomerOpen(true)}
        onOpenNewSupplier={() => setIsNewSupplierOpen(true)}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 gap-6">
        
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Workspace Dynamic Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenNewWorkOrder={() => setIsNewWorkOrderOpen(true)}
              onSelectWorkOrder={(id) => handleOpenWorkOrder(id)}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              onOpenNewPart={() => setIsNewPartOpen(true)}
            />
          )}

          {activeTab === 'workorders' && (
            <WorkOrdersView
              selectedWorkOrderId={selectedWorkOrderId}
              onSelectWorkOrder={setSelectedWorkOrderId}
              onOpenNewWorkOrder={() => setIsNewWorkOrderOpen(true)}
              onOpenInvoiceModal={handleOpenInvoiceModalForWO}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              onOpenNewPart={() => setIsNewPartOpen(true)}
              onOpenNewPO={() => setIsNewPOOpen(true)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersVehiclesView
              onOpenNewCustomer={() => setIsNewCustomerOpen(true)}
              onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
              onSelectWorkOrder={(id) => handleOpenWorkOrder(id)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesPaymentsView
              onOpenInvoiceModal={handleOpenInvoiceModalForWO}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesCashBoxView
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersPurchasingView
              onOpenNewSupplier={() => setIsNewSupplierOpen(true)}
              onOpenNewPO={() => setIsNewPOOpen(true)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Mobile Footer Navigation */}
      <FooterNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <NewWorkOrderModal
        isOpen={isNewWorkOrderOpen}
        onClose={() => setIsNewWorkOrderOpen(false)}
        onSuccess={(id) => handleOpenWorkOrder(id)}
      />

      <NewExpenseModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
      />

      <NewPartModal
        isOpen={isNewPartOpen}
        onClose={() => setIsNewPartOpen(false)}
      />

      <NewCustomerModal
        isOpen={isNewCustomerOpen}
        onClose={() => setIsNewCustomerOpen(false)}
      />

      <NewVehicleModal
        isOpen={isNewVehicleOpen}
        onClose={() => setIsNewVehicleOpen(false)}
      />

      <NewSupplierModal
        isOpen={isNewSupplierOpen}
        onClose={() => setIsNewSupplierOpen(false)}
      />

      <NewPOModal
        isOpen={isNewPOOpen}
        onClose={() => setIsNewPOOpen(false)}
      />

      <InvoiceModal
        workOrderId={invoiceWorkOrderId}
        isOpen={!!invoiceWorkOrderId}
        onClose={() => setInvoiceWorkOrderId(null)}
        onInvoiceCreated={() => setActiveTab('invoices')}
      />

    </div>
  );
};

export function App() {
  return (
    <WorkshopProvider>
      <AppContent />
    </WorkshopProvider>
  );
}

export default App;
