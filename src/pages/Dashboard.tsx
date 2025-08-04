import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AccountSummary from "@/components/dashboard/client/AccountSummary";
import ImplementationProgress from "@/components/dashboard/client/ImplementationProgress";
import ContractsView from "@/components/dashboard/client/ContractsView";
import PaymentsView from "@/components/dashboard/client/PaymentsView";
import ServicesView from "@/components/dashboard/client/ServicesView";
import UsersManagement from "@/components/dashboard/admin/UsersManagement";
import AdminImplementation from "@/components/dashboard/admin/AdminImplementation";
import AdminContracts from "@/components/dashboard/admin/AdminContracts";
import AdminPayments from "@/components/dashboard/admin/AdminPayments";
import AdminServices from "@/components/dashboard/admin/AdminServices";
import AdminDashboard from "@/components/dashboard/admin/AdminDashboard";

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background animated-bg">
      <DashboardHeader />
      
      <div className="flex">
        <DashboardSidebar />
        
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={
              isAdmin ? (
                <AdminDashboard />
              ) : (
                // Client Dashboard
                <div className="space-y-8">
                  <AccountSummary />
                  <ImplementationProgress />
                </div>
              )
            } />
            
            {/* Client Routes */}
            <Route path="/implementation" element={
              <div className="space-y-8">
                <ImplementationProgress />
              </div>
            } />
            <Route path="/contracts" element={<ContractsView />} />
            <Route path="/payments" element={<PaymentsView />} />
            <Route path="/services" element={<ServicesView />} />
            
            {/* Admin Routes - apenas para admin */}
            {isAdmin && (
              <>
                <Route path="/users" element={<UsersManagement />} />
                <Route path="/admin-implementation" element={<AdminImplementation />} />
                <Route path="/admin-contracts" element={<AdminContracts />} />
                <Route path="/admin-payments" element={<AdminPayments />} />
                <Route path="/admin-services" element={<AdminServices />} />
                <Route path="/settings" element={<div>Configurações (em desenvolvimento)</div>} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;