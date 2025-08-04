

const AdminDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">
        Dashboard Administrativo
      </h1>
      <p className="text-gray-300 mb-6">
        Visão geral e controle central do sistema
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white">Clientes Ativos</h3>
          <p className="text-3xl font-bold text-blue-400">24</p>
        </div>
        
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white">Projetos</h3>
          <p className="text-3xl font-bold text-green-400">8</p>
        </div>
        
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white">Pagamentos</h3>
          <p className="text-3xl font-bold text-yellow-400">R$ 45.200</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 